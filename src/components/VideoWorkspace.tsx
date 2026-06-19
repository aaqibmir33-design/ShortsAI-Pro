import React, { useState, useRef, useEffect } from "react";
import { VideoClip, CaptionStyle, WordCaption } from "../types";
import { PRESET_FONTS, CAPTION_PRESETS } from "../data";
import { Play, Pause, RotateCcw, Video, Download, Sliders, Type, Edit3, Sparkles, Check, ArrowRight, Save, Eye, X, Info, Smartphone } from "lucide-react";

interface VideoWorkspaceProps {
  clip: VideoClip;
  videoUrl: string; // File object URL, demo stock, or backup stream
  onUpdateClipCaptions: (updatedCaptions: WordCaption[]) => void;
}

export default function VideoWorkspace({
  clip,
  videoUrl,
  onUpdateClipCaptions,
}: VideoWorkspaceProps) {
  // Video & Playback Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // Styling States
  const [stylePreset, setStylePreset] = useState<'hormozi' | 'beast' | 'minimal'>('hormozi');
  const [style, setStyle] = useState<CaptionStyle>(CAPTION_PRESETS.hormozi);
  
  // Crop / Position Alignment States
  const [cropCenterX, setCropCenterX] = useState<number>(0); // manual panning offset in pixels
  const [zoomScale, setZoomScale] = useState<number>(1.6); // width scaling factor for vertical height match

  // Final Render Preview States
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [safetyGuide, setSafetyGuide] = useState<'clean' | 'tiktok' | 'instagram' | 'shorts'>('clean');
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);

  // Subtitle Timings/Text Editor States
  const [isEditingTexts, setIsEditingTexts] = useState(false);
  const [wordList, setWordList] = useState<WordCaption[]>(clip.captions);

  // Recording states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // Web Audio integration refs for flawless recording capture
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Sync state whenever the clip changes
  useEffect(() => {
    setWordList(clip.captions);
    if (videoRef.current) {
      videoRef.current.currentTime = clip.start;
      setIsPlaying(false);
    }
    setRecordedUrl(null);
  }, [clip]);

  // Load style preset values
  const handlePresetSelect = (preset: 'hormozi' | 'beast' | 'minimal') => {
    setStylePreset(preset);
    setStyle(CAPTION_PRESETS[preset]);
  };

  // Canvas Rending loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderLoop = () => {
      if (video.paused || video.ended) {
        // Continue drawing last static frame even if paused
      }

      const cw = canvas.width;  // 720 px for vertical short target
      const ch = canvas.height; // 1280 px for vertical short target

      // Clear frame
      ctx.clearRect(0, 0, cw, ch);

      // Draw Cropped Video onto canvas
      if (video.readyState >= 2) {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 360;

        // Ideal crop dimensions centered with manual offset tracking
        // For a 9:16 canvas:
        const targetRatio = 9 / 16;
        const cropH = vh;
        const cropW = vh * targetRatio / zoomScale;

        // Position crop X with client centering + custom pan
        const baseCropX = (vw - cropW) / 2;
        const finalCropX = Math.max(0, Math.min(vw - cropW, baseCropX + cropCenterX));

        ctx.drawImage(
          video,
          finalCropX, 0, cropW, cropH, // Source segment
          0, 0, cw, ch               // Destination (fills 720x1280)
        );
      } else {
        // Placeholder background if video stream not ready or loading
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = "#94A3B8";
        ctx.font = "14px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Rendering Video Stream...", cw / 2, ch / 2);
      }

      // Draw Word Captions overlay on top of vertical crop
      const curTime = video.currentTime;
      const activeWord = wordList.find(c => curTime >= c.start && curTime <= c.end);

      if (activeWord) {
        ctx.save();
        
        // Font customization selection
        ctx.font = `bold ${style.fontSize}px ${style.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const posY = ch * (style.positionY / 100);
        const textToDraw = style.uppercase ? activeWord.word.toUpperCase() : activeWord.word;

        // Text bounce transition scale zoom on active word highlighting
        let scaleAmount = 1.0;
        if (style.scaleOnWord) {
          // Word pulse during its active frames
          const wordDuration = activeWord.end - activeWord.start;
          const wordPercent = (curTime - activeWord.start) / (wordDuration || 0.1);
          scaleAmount = 1.0 + Math.sin(wordPercent * Math.PI) * 0.18; // pulse up to 1.18x size
        }

        // Apply visual matrix translate to zoom specific text
        ctx.translate(cw / 2, posY);
        ctx.scale(scaleAmount, scaleAmount);

        // Glow effect shadow layering
        if (style.glowEffect) {
          ctx.shadowColor = style.highlightColor;
          ctx.shadowBlur = 12;
        }

        // Draw thick custom stroke outline (Beast / Hormozi style)
        if (style.outlineWidth > 0) {
          ctx.strokeStyle = style.outlineColor;
          ctx.lineWidth = style.outlineWidth;
          ctx.lineJoin = "round";
          ctx.strokeText(textToDraw, 0, 0);
        }

        // Fill text body
        ctx.fillStyle = style.highlightColor;
        ctx.fillText(textToDraw, 0, 0);

        ctx.restore();
      }

      // Check boundaries if playing & enforce end limit
      if (video.currentTime >= clip.end) {
        if (isRecording) {
          stopRecording();
        } else {
          video.currentTime = clip.start;
          if (!video.loop) {
            video.pause();
            setIsPlaying(false);
          }
        }
      }

      // Update progress bar
      if (isRecording) {
        const totalDuration = clip.end - clip.start;
        const currentProgress = (video.currentTime - clip.start) / (totalDuration || 1);
        setRecordProgress(Math.min(100, Math.floor(currentProgress * 100)));
      }

      // Update preview canvas modal mirror if active
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const pCtx = previewCanvas.getContext("2d");
        if (pCtx) {
          pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          pCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
        }
      }

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [wordList, style, cropCenterX, zoomScale, isRecording, isPreviewModalOpen]);

  // Video control triggers
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      // If outside clip range, seek back to start
      if (video.currentTime < clip.start || video.currentTime >= clip.end) {
        video.currentTime = clip.start;
      }
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log("Video play request failed:", err));
    }
  };

  const handleResetTime = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = clip.start;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Apply timing and word adjustments
  const handleSaveCaptions = () => {
    onUpdateClipCaptions(wordList);
    setIsEditingTexts(false);
  };

  // Web Audio & High-Speed Canvas Exporter / Recorder pipeline
  const startRecording = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsRecording(true);
    setRecordProgress(0);
    setRecordedUrl(null);
    recordedChunksRef.current = [];

    // Ensure video is at starting point for clean edit boundaries
    video.currentTime = clip.start;
    video.pause();

    try {
      // 1. Initialize Web Audio Context to intercept video sound track
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      
      // Resume context if suspended
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      // 2. Attach destination splitter node to capture audio stream from video tag
      const dest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createMediaElementSource(video);
      source.connect(dest);
      source.connect(audioCtx.destination); // bridge clean feedback to speakers so user listens as it renders

      // 3. Capture Canvas high-speed video track (30 frames per second standard)
      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream();

      // Bundle tracks
      canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      dest.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      // 4. Create standard MediaRecorder targeting combined streams
      // fallback options for varying browser support
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8,opus" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }

      const recorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setIsRecording(false);
        setRecordProgress(100);
      };

      // Play and start recording!
      recorder.start();
      video.play().then(() => {
        setIsPlaying(true);
      });

    } catch (e) {
      console.error("Audio Routing setup blocked. Falling back to video-only capture:", e);
      // Fallback: standard canvas record with no audio capture if permissions denied
      const canvasStream = canvas.captureStream(30);
      const recorder = new MediaRecorder(canvasStream, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setIsRecording(false);
      };

      recorder.start();
      video.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  const stopRecording = () => {
    const video = videoRef.current;
    if (video) video.pause();
    setIsPlaying(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="workspace-layout">
      
      {/* LEFT: Live Canvas Viewport (Mobile Frame Style 9:16) */}
      <div className="xl:col-span-5 flex flex-col items-center">
        
        {/* Phone Frame wrapper */}
        <div className="relative w-full max-w-[325px] aspect-[9/16] bg-[#020617] rounded-[40px] p-3.5 shadow-2xl border-[6px] border-slate-900 ring-4 ring-indigo-500/10 ring-offset-1 flex flex-col justify-between overflow-hidden">
          
          {/* Phone Speaker Notch */}
          <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-4.5 bg-slate-950 rounded-full z-20 flex items-center justify-center border border-white/5">
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Canvas Draw Stage */}
          <div className="relative w-full h-full bg-slate-950 rounded-[28px] overflow-hidden z-10 border border-white/5">
            <canvas
              ref={canvasRef}
              width={720}
              height={1280}
              className="w-full h-full object-cover"
              id="vertical-render-canvas"
            />

            {/* Hidden source video element */}
            <video
              ref={videoRef}
              src={videoUrl}
              crossOrigin="anonymous"
              playsInline
              className="hidden"
            />

            {/* Recording HUD Overlay */}
            {isRecording && (
              <div className="absolute inset-0 bg-slate-950/85 z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-indigo-500/25 rounded-full" />
                  <div
                    className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"
                    style={{ animationDuration: "1s" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400 font-mono">
                    {recordProgress}%
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mb-2 font-heading">Rendering WebM Short</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mb-4">
                  Capturing 9:16 canvas frames and audio on-the-fly. Do not exit workspace.
                </p>
                <button
                  onClick={stopRecording}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-mono font-bold"
                >
                  ABORT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Playback HUD Bar */}
        <div className="mt-4 flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 shadow-lg text-white">
          <button
            onClick={handleResetTime}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Rewind to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            disabled={isRecording}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div className="text-xs font-bold font-mono text-slate-300 select-none">
            {videoRef.current ? videoRef.current.currentTime.toFixed(1) : "0.0"}s / {clip.end.toFixed(1)}s
          </div>
        </div>

        {/* Preview Final Render action button */}
        <button
          onClick={() => setIsPreviewModalOpen(true)}
          className="mt-4 w-full max-w-[325px] py-3 px-4 bg-indigo-650/25 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 border border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          id="preview-final-render-btn"
        >
          <Eye className="w-4 h-4 text-indigo-400" />
          Preview Final Render
        </button>
      </div>

      {/* RIGHT: Layout Croppers & Styling Panels (7 Cols) */}
      <div className="xl:col-span-7 space-y-6" id="editor-control-panel">
        
        {/* PANEL A: Video Face Aligners & Scaling */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="accent-glow absolute inset-0 opacity-10"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10 text-white">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-white font-heading">
              Aligning & Scaling Controls
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-slate-300 relative z-10">
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span>Horizontal Pan (X-Offset)</span>
                <span className="font-bold text-white">{cropCenterX} px</span>
              </div>
              <input
                type="range"
                min="-300"
                max="300"
                value={cropCenterX}
                onChange={(e) => setCropCenterX(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                Slide to track moving speakers or center key visual elements.
              </p>
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1">
                <span>Crop Scaling (Zoom)</span>
                <span className="font-bold text-white">{zoomScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={zoomScale}
                onChange={(e) => setZoomScale(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                Alter scaling ratio to center-focus wide/tight frame targets.
              </p>
            </div>
          </div>
        </div>

        {/* PANEL B: Custom Caption Designer (Hormozi / Beast styles) */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="accent-glow absolute inset-0 opacity-10"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10 text-white">
            <Type className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-white font-heading">
              Captions Highlighter & Presets
            </h3>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
            <button
              onClick={() => handlePresetSelect('hormozi')}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                stylePreset === 'hormozi'
                  ? "border-amber-500 bg-white/5 shadow-sm"
                  : "border-white/10 hover:bg-white/5"
              }`}
            >
              <span className="text-xs font-mono font-bold block text-white">Hormozi Yellow</span>
              <span className="text-[9px] text-[#D97706] font-extrabold uppercase tracking-wide">IMPACT + PULSE</span>
            </button>

            <button
              onClick={() => handlePresetSelect('beast')}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                stylePreset === 'beast'
                  ? "border-purple-500 bg-white/5 shadow-sm"
                  : "border-white/10 hover:bg-white/5"
              }`}
            >
              <span className="text-xs font-sans font-bold block text-white">Beast Pink</span>
              <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-wide">CYAN OUTLINE</span>
            </button>

            <button
              onClick={() => handlePresetSelect('minimal')}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                stylePreset === 'minimal'
                  ? "border-indigo-400 bg-white/5 shadow-sm"
                  : "border-white/10 hover:bg-white/5"
              }`}
            >
              <span className="text-xs font-sans font-semibold block text-white font-serif">Clean Slate</span>
              <span className="text-[9px] text-indigo-300 font-semibold uppercase tracking-wide leading-relaxed">MINIMAL WHITE</span>
            </button>
          </div>

          {/* Timing/Styling Config parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 relative z-10">
            <div>
              <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                Font Family
              </label>
              <select
                value={style.fontFamily}
                onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
                className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-505 bg-slate-900 text-white"
              >
                {PRESET_FONTS.map(f => (
                  <option key={f.name} value={f.val}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                Highlight Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={style.highlightColor}
                  onChange={(e) => setStyle({ ...style, highlightColor: e.target.value })}
                  className="w-10 h-10 rounded border border-white/10 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={style.highlightColor.toUpperCase()}
                  onChange={(e) => setStyle({ ...style, highlightColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded font-mono text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                Y-Position (%)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={style.positionY}
                onChange={(e) => setStyle({ ...style, positionY: Number(e.target.value) })}
                className="w-full px-2.5 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-xs text-slate-300 relative z-10">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.scaleOnWord}
                onChange={(e) => setStyle({ ...style, scaleOnWord: e.target.checked })}
                className="rounded accent-indigo-500 text-indigo-650 focus:ring-indigo-500"
              />
              <span>Pulse zoom on active word</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.uppercase}
                onChange={(e) => setStyle({ ...style, uppercase: e.target.checked })}
                className="rounded accent-indigo-500 text-indigo-650 focus:ring-indigo-500"
              />
              <span>Full uppercase words</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.glowEffect}
                onChange={(e) => setStyle({ ...style, glowEffect: e.target.checked })}
                className="rounded accent-indigo-500 text-indigo-650 focus:ring-indigo-500"
              />
              <span>Highlight outline glow shadow</span>
            </label>
          </div>
        </div>

        {/* PANEL C: Click-To-Edit Timings/Word Subtitle Editor */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="accent-glow absolute inset-0 opacity-10"></div>
          <div className="flex items-center justify-between mb-3 relative z-10 text-white">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-white font-heading">
                AI Transcribed Timeline
              </h3>
            </div>
            
            <button
              onClick={() => {
                if (isEditingTexts) {
                  handleSaveCaptions();
                } else {
                  setIsEditingTexts(true);
                }
              }}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {isEditingTexts ? (
                <>
                  <Save className="w-3.5 h-3.5 text-indigo-300" /> Save Changes
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-indigo-300" /> Edit Words
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mb-4 pl-0.5 relative z-10">
            Words are plotted along the sound timeline. Click "Edit Words" to fix typos, refine sync timestamps, or adjust lengths.
          </p>

          <div className="max-h-[170px] overflow-y-auto border border-white/5 rounded-xl p-3 bg-black/30 space-y-2 relative z-10" id="timing-timeline-list">
            {isEditingTexts ? (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <div className="col-span-6">Word String</div>
                  <div className="col-span-3">Starts (s)</div>
                  <div className="col-span-3">Ends (s)</div>
                </div>
                {wordList.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <input
                      type="text"
                      value={item.word}
                      onChange={(e) => {
                        const updated = [...wordList];
                        updated[index].word = e.target.value;
                        setWordList(updated);
                      }}
                      className="col-span-6 px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded text-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={item.start}
                      onChange={(e) => {
                        const updated = [...wordList];
                        updated[index].start = Number(e.target.value);
                        setWordList(updated);
                      }}
                      className="col-span-3 px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded text-white font-mono"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={item.end}
                      onChange={(e) => {
                        const updated = [...wordList];
                        updated[index].end = Number(e.target.value);
                        setWordList(updated);
                      }}
                      className="col-span-3 px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {wordList.map((item, index) => {
                  const isActive = videoRef.current ? (videoRef.current.currentTime >= item.start && videoRef.current.currentTime <= item.end) : false;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (videoRef.current) videoRef.current.currentTime = item.start;
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm scale-110"
                          : "bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      {item.word}
                      <span className="block text-[8px] opacity-60 font-mono font-normal">
                        {item.start.toFixed(1)}s
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PANEL D: COMPILER STAGE (Client-Side MP4 WebM Downloader) */}
        <div className="glass-card p-6 text-white relative overflow-hidden">
          <div className="accent-glow absolute inset-0 opacity-15"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-5 h-5 text-yellow-300 animate-pulse" />
              <h3 className="text-base font-bold tracking-tight text-white font-heading">
                Export 9:16 vertical Short
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Ready to pull? Click render. The workspace compiles canvas frames in high 30FPS quality and pipes speaker audio directly. Process occurs locally, saving serverside rendering costs. No watermarks!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {recordedUrl ? (
                <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                  <a
                    href={recordedUrl}
                    download={`${clip.title.toLowerCase().replace(/\s+/g, "_")}_short.webm`}
                    className="w-full sm:w-auto py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4 text-white fill-current" />
                    Download High-Res Clip
                  </a>

                  <button
                    onClick={() => setRecordedUrl(null)}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Re-Render / Modify Settings
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className="w-full sm:w-auto py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Sparkles className="w-4 text-yellow-300 animate-pulse" />
                  Render Output Now
                </button>
              )}

              {!isRecording && !recordedUrl && (
                <span className="text-xs font-mono text-slate-400">
                  ⚡ Compile speed: Instantaneous
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FINAL PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-6 overflow-y-auto animate-fade-in" id="preview-render-modal">
          <div className="relative w-full max-w-5xl bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Close button */}
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 z-50 p-2.5 bg-black/40 hover:bg-white/10 text-slate-300 hover:text-white rounded-full transition-all border border-white/5 cursor-pointer"
              title="Close Preview"
              id="close-preview-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Simulated Device Canvas (720x1280 resolution target scaled down) */}
            <div className="flex-1 bg-slate-950 p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_100%)]"></div>
              
              <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] bg-black rounded-[36px] shadow-2xl ring-4 ring-indigo-500/15 overflow-hidden flex flex-col justify-between" id="simulated-phone-screen">
                
                {/* Simulated Phone Notch */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black/90 rounded-full z-45 flex items-center justify-center border border-white/5">
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Mirror Canvas Container */}
                <div className="relative w-full h-full bg-slate-950 overflow-hidden z-20">
                  <canvas
                    ref={previewCanvasRef}
                    width={720}
                    height={1280}
                    className="w-full h-full object-cover"
                    id="simulated-preview-canvas"
                  />

                  {/* PLATFORM LAYOUT MOCKUPS (OVERLAY) */}
                  {safetyGuide === 'tiktok' && (
                    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 pb-6 text-white text-sans tracking-wide">
                      {/* Top Bar (Follow/For You) */}
                      <div className="flex justify-center gap-4 text-xs font-semibold pt-1 text-white/60">
                        <span>Following</span>
                        <span className="text-white border-b-2 border-white pb-1 font-bold">For You</span>
                      </div>

                      {/* Right Sidebar Icons Container */}
                      <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-4 pointer-events-auto">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full border border-white bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold">SJ</div>
                          <div className="w-4 h-4 rounded-full bg-rose-500 font-bold text-white text-[10px] flex items-center justify-center -mt-2">+</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <button className="w-10 h-10 rounded-full bg-black/45 flex items-center justify-center hover:bg-black/60"><span className="text-red-500">❤️</span></button>
                          <span className="text-[9px] font-semibold mt-0.5">182.4K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <button className="w-10 h-10 rounded-full bg-black/45 flex items-center justify-center"><span className="text-white">💬</span></button>
                          <span className="text-[9px] font-semibold mt-0.5">1.4K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <button className="w-10 h-10 rounded-full bg-black/45 flex items-center justify-center"><span className="text-yellow-400">⭐</span></button>
                          <span className="text-[9px] font-semibold mt-0.5">24.5K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <button className="w-10 h-10 rounded-full bg-black/45 flex items-center justify-center"><span className="text-white">🔗</span></button>
                          <span className="text-[9px] font-semibold mt-0.5">Share</span>
                        </div>
                      </div>

                      {/* Bottom Description Container */}
                      <div className="w-full max-w-[80%] mt-auto flex flex-col gap-1 pr-4">
                        <div className="text-xs font-bold font-sans">@sheenora_journeys</div>
                        <div className="text-[10px] text-white/90 line-clamp-2">
                          Discover the majestic peaks of Kashmir! 🏔️✈️ Experience Gulmarg like never before with Sheenora Journeys. #travel #shorts
                        </div>
                        <div className="text-[10px] text-white/70 flex items-center gap-1 mt-1 font-mono">
                          <span>🎵 Original sound - Sheenora Journeys</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {safetyGuide === 'instagram' && (
                    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 pb-6 text-white text-sans">
                      {/* Top Bar */}
                      <div className="flex justify-between items-center pt-1 px-1">
                        <span className="text-xs font-bold uppercase tracking-wider">Reels</span>
                        <span className="text-white">📷</span>
                      </div>

                      {/* Right Icons */}
                      <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-5 pointer-events-auto">
                        <div className="flex flex-col items-center">
                          <button className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-rose-500">❤️</button>
                          <span className="text-[8px] font-semibold mt-0.5">14.9K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <button className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-white">💬</button>
                          <span className="text-[8px] font-semibold mt-0.5">145</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <button className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-white">✈️</button>
                        </div>
                        <div className="flex flex-col items-center">
                          <button className="text-white text-lg">•••</button>
                        </div>
                        <div className="w-6 h-6 rounded bg-indigo-900 border border-white/20"></div>
                      </div>

                      {/* Bottom Information */}
                      <div className="w-full max-w-[80%] mt-auto flex flex-col gap-1 pr-4">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <div className="w-6 h-6 rounded-full bg-indigo-950 flex items-center justify-center text-[8px]">SJ</div>
                          <span>sheenora_journeys</span>
                          <span className="px-1.5 py-0.5 border border-white/30 rounded text-[8px] uppercase tracking-wider font-extrabold text-white">Follow</span>
                        </div>
                        <div className="text-[10px] text-white/90 line-clamp-2 mt-1">
                          A dream trip to Kashmir awaits you. Pristine rivers, snow and floating houseboats! Book today.
                        </div>
                      </div>
                    </div>
                  )}

                  {safetyGuide === 'shorts' && (
                    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 pb-6 text-white text-sans">
                      {/* Top Bar */}
                      <div className="flex justify-between items-center pt-1 px-1">
                        <span className="text-xs font-bold bg-red-650 px-2 py-0.5 rounded text-white font-mono uppercase tracking-widest bg-red-600">Shorts</span>
                        <span className="text-white">🔍</span>
                      </div>

                      {/* Right Sidebar */}
                      <div className="absolute right-2.5 bottom-20 flex flex-col items-center gap-4 pointer-events-auto">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white text-sm">👍</div>
                          <span className="text-[8px] font-semibold mt-0.5">42K</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white text-sm">👎</div>
                          <span className="text-[8px] font-semibold mt-0.5">Dislike</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white text-sm">💬</div>
                          <span className="text-[8px] font-semibold mt-0.5">924</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white text-sm">➡️</div>
                          <span className="text-[8px] font-semibold mt-0.5">Share</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white text-sm">💿</div>
                          <span className="text-[8px] font-semibold mt-0.5">Remix</span>
                        </div>
                      </div>

                      {/* Bottom Profile and metadata */}
                      <div className="w-full max-w-[80%] mt-auto flex flex-col gap-1.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-950 flex items-center justify-center text-[8px] font-bold">SJ</div>
                          <span className="text-xs font-semibold">Sheenora Journeys</span>
                          <span className="bg-red-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white tracking-wider uppercase">Subscribe</span>
                        </div>
                        <div className="text-[10px] text-white/90 line-clamp-1">
                          Heaven on Earth exists right here in Kashmir.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Guidelines Safe Zone Box */}
                  {showGuidelines && (
                    <div className="absolute inset-x-4 top-[35%] bottom-[25%] border-2 border-dashed border-cyan-400 bg-cyan-400/5 z-40 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
                      <span className="bg-cyan-900 border border-cyan-400 text-cyan-300 font-mono text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Social Caption Safe Zone</span>
                      <span className="text-cyan-300/40 text-[7px] font-mono select-none">TikTok / Reels / Shorts Cleared Area</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Simulator Control Board (300px) */}
            <div className="w-full md:w-[320px] bg-slate-900/40 p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh]">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-md font-bold text-white tracking-wide font-heading">Render Inspector</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Simulate & Verify Crop Alignment</p>
                  </div>
                </div>

                {/* Subtitle Warning Banner */}
                <div className="mb-4">
                  {style.positionY >= 35 && style.positionY <= 72 ? (
                    <div className="flex items-start gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      <Check className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <span className="font-bold">Captions Safely Cleared</span>
                        <p className="text-[9px] text-slate-400 mt-0.5">Placed at {style.positionY}%. This guarantees full visual legibility, bypassing native platform icon clutter on TikTok and Instagram Reels.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      <Info className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold">Caption Intersect Warning</span>
                        <p className="text-[9px] text-slate-400 mt-0.5">Captions are at {style.positionY}%. On social platforms, they may overlap with comment arrays or description texts. Optimal region is 35% - 72%.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Social Frame Selection Tabs */}
                <div className="space-y-3 mb-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 font-mono">
                    Social Layout Overlays
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      onClick={() => setSafetyGuide('clean')}
                      className={`py-2 px-3 rounded-lg border text-center font-bold tracking-tight cursor-pointer transition-all ${
                        safetyGuide === 'clean'
                          ? "bg-indigo-650 border-indigo-505 text-white shadow-md shadow-indigo-600/15"
                          : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      Clean View
                    </button>
                    <button
                      onClick={() => setSafetyGuide('tiktok')}
                      className={`py-2 px-3 rounded-lg border text-center font-bold tracking-tight cursor-pointer transition-all ${
                        safetyGuide === 'tiktok'
                          ? "bg-indigo-650 border-indigo-505 text-white shadow-md shadow-indigo-600/15"
                          : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      TikTok
                    </button>
                    <button
                      onClick={() => setSafetyGuide('instagram')}
                      className={`py-2 px-3 rounded-lg border text-center font-bold tracking-tight cursor-pointer transition-all ${
                        safetyGuide === 'instagram'
                          ? "bg-indigo-650 border-indigo-505 text-white shadow-md shadow-indigo-600/15"
                          : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      IG Reels
                    </button>
                    <button
                      onClick={() => setSafetyGuide('shorts')}
                      className={`py-2 px-3 rounded-lg border text-center font-bold tracking-tight cursor-pointer transition-all ${
                        safetyGuide === 'shorts'
                          ? "bg-indigo-650 border-indigo-505 text-white shadow-md shadow-indigo-600/15"
                          : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      YT Shorts
                    </button>
                  </div>
                </div>

                {/* Safe Zone Boundary Checkbox Toggle */}
                <div className="mb-6 flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-300 font-medium font-sans">Render Safe Area Guides</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGuidelines}
                      onChange={(e) => setShowGuidelines(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Real-time Crop / Alignment Customizers (Inside Inspector!) */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest pl-0.5 font-mono">
                    Real-Time Corrections
                  </h4>

                  {/* Horizontal Panning */}
                  <div className="text-xs">
                    <div className="flex justify-between text-slate-300 font-mono mb-1 text-[11px]">
                      <span>Horizontal Pan</span>
                      <span className="font-bold text-white">{cropCenterX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={cropCenterX}
                      onChange={(e) => setCropCenterX(Number(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-lg accent-indigo-500 cursor-pointer animate-pulse"
                    />
                  </div>

                  {/* Crop Scaling Zoom */}
                  <div className="text-xs">
                    <div className="flex justify-between text-slate-300 font-mono mb-1 text-[11px]">
                      <span>Zoom Scale</span>
                      <span className="font-bold text-white">{zoomScale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.05"
                      value={zoomScale}
                      onChange={(e) => setZoomScale(Number(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-lg accent-indigo-500 cursor-pointer animate-pulse"
                    />
                  </div>

                  {/* Caption Vertical Offset */}
                  <div className="text-xs">
                    <div className="flex justify-between text-slate-300 font-mono mb-1 text-[11px]">
                      <span>Y-Position Offset</span>
                      <span className="font-bold text-white">{style.positionY}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={style.positionY}
                      onChange={(e) => setStyle({ ...style, positionY: Number(e.target.value) })}
                      className="w-full h-1 bg-white/15 rounded-lg accent-indigo-500 cursor-pointer animate-pulse"
                    />
                  </div>
                </div>
              </div>

              {/* Player Loop Controls */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <div className="flex items-center justify-between gap-2 bg-black/20 p-2 rounded-xl">
                  <button
                    onClick={handleResetTime}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Rewind to start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="flex-1 py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isPlaying ? <><Pause className="w-3.5 h-3.5 fill-current" /> Pause Preview</> : <><Play className="w-3.5 h-3.5 fill-current" /> Play Simulation</>}
                  </button>

                  <span className="text-[10px] font-mono font-bold text-slate-300 px-2 select-none">
                    {videoRef.current ? videoRef.current.currentTime.toFixed(1) : "0.0"}s
                  </span>
                </div>
                
                <p className="text-[9px] text-slate-500 text-center mt-3 leading-relaxed">
                  Real-time direct frame mapping. Any alignment modifications or repositioning updates immediately back in the main studio editor!
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
