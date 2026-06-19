import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper: Extract YouTube raw Video ID
function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Helper: Fetch YouTube subtitles directly (Captions scraper)
async function fetchYouTubeTranscript(videoId: string): Promise<{ text: string; start: number; duration: number }[] | null> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) return null;
    const html = await response.text();
    
    // Search for captionTracks in ytInitialPlayerResponse
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.*?});/);
    let captionsJson: any = null;
    
    if (playerResponseMatch) {
      const playerResponse = JSON.parse(playerResponseMatch[1]);
      captionsJson = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    }
    
    if (!captionsJson) {
      // Alternate regex search inside ytplayer config
      const altMatch = html.match(/"captionTracks"\s*:\s*(\[.*?\])/);
      if (altMatch) {
        captionsJson = JSON.parse(altMatch[1]);
      }
    }
    
    if (!captionsJson || captionsJson.length === 0) {
      return null;
    }
    
    // Choose the first track, preferably English or auto-generated
    let selectedTrack = captionsJson.find((track: any) => track.languageCode === 'en' || track.vssId?.startsWith('.en'));
    if (!selectedTrack) selectedTrack = captionsJson[0];
    
    const subtitleUrl = selectedTrack.baseUrl;
    if (!subtitleUrl) return null;
    
    // Fetch captions XML from YouTube
    const xmlResponse = await fetch(subtitleUrl);
    if (!xmlResponse.ok) return null;
    const xmlText = await xmlResponse.text();
    
    // Parse the XML
    const transcript: { text: string; start: number; duration: number }[] = [];
    const itemRegex = /<text start="([\d\.]+)" dur="([\d\.]+)"[^>]*>([\s\S]*?)<\/text>/gi;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const start = parseFloat(match[1]);
      const duration = parseFloat(match[2]);
      const text = match[3]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/\n/g, ' ');
        
      transcript.push({ text, start, duration });
    }
    
    return transcript.length > 0 ? transcript : null;
  } catch (error) {
    console.error("Error scraping transcript:", error);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini SDK with custom user agent
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // REST API: Analyze YouTube Link
  app.post("/api/analyze-link", async (req, res) => {
    const { url, backupTopic } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required." });
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL format." });
    }
    
    console.log(`Starting analysis for YouTube Video ID: ${videoId}`);
    
    try {
      let rawTranscript = await fetchYouTubeTranscript(videoId);
      let transcriptTextForGemini = "";
      
      if (rawTranscript) {
        transcriptTextForGemini = rawTranscript
          .slice(0, 400)
          .map((t) => `[${t.start.toFixed(1)}s - ${(t.start + t.duration).toFixed(1)}s] ${t.text}`)
          .join("\n");
      } else {
        console.log("No official captions found. Gemini will generate high-fidelity simulated captions.");
        transcriptTextForGemini = `The user supplied a YouTube video with ID ${videoId}. No subtitles could be scraped. Theme context: "${backupTopic || 'Motivational Podcast'}"`;
      }
      
      const systemPrompt = `You are a world-class AI Short-Form Producer (e.g. producing YouTube Shorts, TikTok, Reels).
  Given a YouTube Video context with its transcript, detect the 3 most highly engaging "moments" or "hooks" suited for clips of 15 to 45 seconds.

  For each clip, you must output:
  1. title: A catchy, virality-optimized title (Max 6 words)
  2. description: Briefly explain why this clip is viral (e.g., strong speech peak, controversial hook, great punchline)
  3. start: Precise start time in decimal seconds
  4. end: Precise end time in decimal seconds (start + 15 to 45)
  5. viralScore: A predicted rating from 50 to 100 based on hook potential, retention, and emotion
  6. whyViral: Details on how the peak engages users
  7. captions: An array of words inside this clip. Each word entry MUST have:
     - word: The word itself
     - start: Precise timestamp in seconds when the word is starting
     - end: Precise timestamp in seconds when the word ends
     Ensure the timing starts at the clip's 'start' and flows incrementally up to 'end'. Make the timings realistic for speech (approx 120-150 words per minute, spaced evenly or representing natural speaking speeds).

  Keep your output detailed, and structure it exactly matching the schema.`;

      const userPrompt = `Video URL: ${url}
  Video ID: ${videoId}
  Theme: ${backupTopic || 'Auto-detected context'}
  Transcript excerpts:
  ${transcriptTextForGemini}`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["videoTitle", "suggestedClips"],
            properties: {
              videoTitle: { type: Type.STRING, description: "Title of the main video" },
              suggestedClips: {
                type: Type.ARRAY,
                description: "Array of 3 recommended short clips",
                items: {
                  type: Type.OBJECT,
                  required: ["title", "description", "start", "end", "viralScore", "whyViral", "captions"],
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    start: { type: Type.NUMBER },
                    end: { type: Type.NUMBER },
                    viralScore: { type: Type.INTEGER },
                    whyViral: { type: Type.STRING },
                    captions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["word", "start", "end"],
                        properties: {
                          word: { type: Type.STRING },
                          start: { type: Type.NUMBER },
                          end: { type: Type.NUMBER }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const parsedData = JSON.parse(geminiResponse.text || "{}");
      
      res.json({
        success: true,
        videoId,
        videoTitle: parsedData.videoTitle || "Analyzed Video Short Candidates",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        clips: parsedData.suggestedClips || []
      });

    } catch (error: any) {
      console.error("Gemini context extraction failed:", error);
      res.status(500).json({ error: error?.message || "Internal algorithm failure during AI clip analysis." });
    }
  });

  // Mounting Vite dev server or serving build static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sheenora YouTube Shorts API server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
