import { VideoClip } from "./types";

export interface DemoVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videoUrl: string; // Direct video file stream
  duration: number;
  clips: VideoClip[];
}

export const DEMO_VIDEOS: DemoVideo[] = [
  {
    id: "hormozi-wealth",
    title: "How to Build $100M Offers & True Value",
    channel: "Alex Hormozi",
    thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-cellphone-and-typing-43037-large.mp4", // A high quality vertical background stock of a phone typing to serve as interactive visual stream
    duration: 52,
    clips: [
      {
        id: "clip-1",
        title: "The Golden Rule of Offers",
        description: "An emotional speech peak identifying why most businesses fail because of pricing fear.",
        start: 5,
        end: 28,
        viralScore: 94,
        whyViral: "Strong psychological hook in the first 3 seconds, high energetic voice peaks, and highly relatable money paradigms.",
        captions: [
          { word: "The", start: 5.0, end: 5.3 },
          { word: "reason", start: 5.3, end: 5.6 },
          { word: "you", start: 5.6, end: 5.8 },
          { word: "are", start: 5.8, end: 6.0 },
          { word: "struggling", start: 6.0, end: 6.5 },
          { word: "to", start: 6.5, end: 6.7 },
          { word: "sell", start: 6.7, end: 7.0 },
          { word: "is", start: 7.0, end: 7.2 },
          { word: "not", start: 7.2, end: 7.5 },
          { word: "your", start: 7.5, end: 7.7 },
          { word: "product.", start: 7.7, end: 8.2 },
          { word: "It", start: 8.5, end: 8.8 },
          { word: "is", start: 8.8, end: 9.0 },
          { word: "your", start: 9.0, end: 9.2 },
          { word: "absolute", start: 9.2, end: 9.6 },
          { word: "pricing", start: 9.6, end: 10.0 },
          { word: "fear.", start: 10.0, end: 10.5 },
          { word: "You", start: 11.0, end: 11.3 },
          { word: "think", start: 11.3, end: 11.6 },
          { word: "that", start: 11.6, end: 11.8 },
          { word: "by", start: 11.8, end: 12.0 },
          { word: "making", start: 12.0, end: 12.3 },
          { word: "it", start: 12.3, end: 12.5 },
          { word: "cheap,", start: 12.5, end: 13.0 },
          { word: "people", start: 13.0, end: 13.3 },
          { word: "will", start: 13.3, end: 13.5 },
          { word: "buy.", start: 13.5, end: 14.0 },
          { word: "Wrong!", start: 14.2, end: 15.0 },
          { word: "Cheap", start: 15.5, end: 15.9 },
          { word: "signals", start: 15.9, end: 16.3 },
          { word: "low", start: 16.3, end: 16.6 },
          { word: "quality.", start: 16.6, end: 17.2 },
          { word: "If", start: 18.0, end: 18.2 },
          { word: "you", start: 18.2, end: 18.4 },
          { word: "make", start: 18.4, end: 18.7 },
          { word: "an", start: 18.7, end: 18.9 },
          { word: "offer", start: 18.9, end: 19.4 },
          { word: "so", start: 19.4, end: 19.6 },
          { word: "good", start: 19.6, end: 20.0 },
          { word: "that", start: 20.0, end: 20.3 },
          { word: "they", start: 20.3, end: 20.5 },
          { word: "feel", start: 20.5, end: 20.8 },
          { word: "stupid", start: 20.8, end: 21.3 },
          { word: "saying", start: 21.3, end: 21.6 },
          { word: "no,", start: 21.6, end: 22.2 },
          { word: "that", start: 23.0, end: 23.3 },
          { word: "is", start: 23.3, end: 23.5 },
          { word: "when", start: 23.5, end: 23.7 },
          { word: "you", start: 23.7, end: 23.9 },
          { word: "win", start: 23.9, end: 24.3 },
          { word: "the", start: 24.3, end: 24.5 },
          { word: "market", start: 24.5, end: 25.0 },
          { word: "forever.", start: 25.0, end: 26.0 }
        ]
      },
      {
        id: "clip-2",
        title: "Scaling with Zero Margin Costs",
        description: "Tactical advice on why digital products and premium offerings scale 10x faster.",
        start: 30,
        end: 50,
        viralScore: 89,
        whyViral: "Clear, quantitative bento points and extreme authority on margins structure.",
        captions: [
          { word: "Digital", start: 30.0, end: 30.5 },
          { word: "products", start: 30.5, end: 31.0 },
          { word: "have", start: 31.0, end: 31.2 },
          { word: "infinite", start: 31.2, end: 31.7 },
          { word: "scalability", start: 31.7, end: 32.5 },
          { word: "because", start: 32.8, end: 33.1 },
          { word: "your", start: 33.1, end: 33.3 },
          { word: "marginal", start: 33.3, end: 33.8 },
          { word: "cost", start: 33.8, end: 34.2 },
          { word: "is", start: 34.2, end: 34.4 },
          { word: "exactly", start: 34.4, end: 34.8 },
          { word: "zero.", start: 34.8, end: 35.5 },
          { word: "Think", start: 36.5, end: 36.9 },
          { word: "about", start: 36.9, end: 37.1 },
          { word: "it.", start: 37.1, end: 37.6 },
          { word: "Every", start: 38.0, end: 38.3 },
          { word: "new", start: 38.3, end: 38.6 },
          { word: "customer", start: 38.6, end: 39.0 },
          { word: "is", start: 39.0, end: 39.2 },
          { word: "pure", start: 39.2, end: 39.6 },
          { word: "ninety", start: 39.6, end: 40.0 },
          { word: "percent", start: 40.0, end: 40.3 },
          { word: "plus", start: 40.3, end: 40.6 },
          { word: "profit.", start: 40.6, end: 41.3 },
          { word: "Stop", start: 42.0, end: 42.3 },
          { word: "trading", start: 42.3, end: 42.7 },
          { word: "your", start: 42.7, end: 42.9 },
          { word: "hours", start: 42.9, end: 43.3 },
          { word: "for", start: 43.3, end: 43.5 },
          { word: "dollars", start: 43.5, end: 44.0 },
          { word: "and", start: 44.0, end: 44.3 },
          { word: "start", start: 44.3, end: 44.6 },
          { word: "pricing", start: 44.6, end: 45.0 },
          { word: "for", start: 45.0, end: 45.3 },
          { word: "the", start: 45.3, end: 45.5 },
          { word: "value", start: 45.5, end: 46.0 },
          { word: "delivered.", start: 46.0, end: 47.0 }
        ]
      }
    ]
  },
  {
    id: "rogan-artificial",
    title: "The Insane Future of Robotics & AI",
    channel: "Joe Rogan",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-robot-moving-head-glowing-in-the-dark-42407-large.mp4", // direct cyberpunk robot stream
    duration: 40,
    clips: [
      {
        id: "clip-3",
        title: "Robots are Replicating Fast",
        description: "Mind-bending breakdown of the replication speeds and physics constraints of robotic hardware.",
        start: 2,
        end: 32,
        viralScore: 97,
        whyViral: "High curiosity score, mind blowing robotic facts, incredible speed metrics.",
        captions: [
          { word: "So,", start: 2.0, end: 2.3 },
          { word: "mind-blowing", start: 2.3, end: 2.9 },
          { word: "news", start: 2.9, end: 3.2 },
          { word: "from", start: 3.2, end: 3.4 },
          { word: "the", start: 3.4, end: 3.6 },
          { word: "labs.", start: 3.6, end: 4.1 },
          { word: "These", start: 5.0, end: 5.3 },
          { word: "humanoid", start: 5.3, end: 5.8 },
          { word: "robots", start: 5.8, end: 6.2 },
          { word: "can", start: 6.2, end: 6.4 },
          { word: "already", start: 6.4, end: 6.8 },
          { word: "learn", start: 6.8, end: 7.2 },
          { word: "by", start: 7.2, end: 7.4 },
          { word: "simply", start: 7.4, end: 7.7 },
          { word: "observing,", start: 7.7, end: 8.3 },
          { word: "like", start: 8.5, end: 8.8 },
          { word: "cameras", start: 8.8, end: 9.2 },
          { word: "watching", start: 9.2, end: 9.5 },
          { word: "us.", start: 9.5, end: 10.0 },
          { word: "They", start: 10.5, end: 10.8 },
          { word: "don't", start: 10.8, end: 11.1 },
          { word: "need", start: 11.1, end: 11.3 },
          { word: "reprogramming.", start: 11.3, end: 12.2 },
          { word: "They", start: 12.5, end: 12.7 },
          { word: "just", start: 12.7, end: 12.9 },
          { word: "watch", start: 12.9, end: 13.2 },
          { word: "a", start: 13.2, end: 13.4 },
          { word: "human", start: 13.4, end: 13.8 },
          { word: "make", start: 13.8, end: 14.0 },
          { word: "coffee,", start: 14.0, end: 14.5 },
          { word: "and", start: 14.5, end: 14.7 },
          { word: "they", start: 14.7, end: 15.0 },
          { word: "do", start: 15.0, end: 15.2 },
          { word: "it", start: 15.2, end: 15.4 },
          { word: "flawlessly.", start: 15.4, end: 16.2 },
          { word: "That", start: 17.0, end: 17.3 },
          { word: "is", start: 17.3, end: 17.5 },
          { word: "both", start: 17.5, end: 17.8 },
          { word: "the", start: 17.8, end: 18.0 },
          { word: "most", start: 18.0, end: 18.3 },
          { word: "beautiful", start: 18.3, end: 18.8 },
          { word: "and", start: 18.8, end: 19.1 },
          { word: "absolutely", start: 19.1, end: 19.6 },
          { word: "terrifying", start: 19.6, end: 20.2 },
          { word: "thing", start: 20.2, end: 20.5 },
          { word: "I", start: 20.5, end: 20.7 },
          { word: "have", start: 20.7, end: 20.9 },
          { word: "ever", start: 20.9, end: 21.2 },
          { word: "witnessed.", start: 21.2, end: 22.0 }
        ]
      }
    ]
  }
];

export const PRESET_FONTS = [
  { name: "Impact", val: "Impact, Charcoal, sans-serif" },
  { name: "Montserrat Black", val: "'Montserrat', sans-serif" },
  { name: "Inter Bold", val: "'Inter', system-ui, sans-serif" },
  { name: "JetBrains Mono Big", val: "'JetBrains Mono', monospace" },
  { name: "Space Grotesk Heavy", val: "'Space Grotesk', system-ui" }
];

export const CAPTION_PRESETS = {
  hormozi: {
    fontFamily: "Impact, Charcoal, sans-serif",
    fontSize: 54,
    uppercase: true,
    textColor: "#FFFFFF",
    highlightColor: "#FFFF00", // Yellow accent
    outlineColor: "#000000",
    outlineWidth: 5,
    positionY: 65,
    scaleOnWord: true,
    glowEffect: true
  },
  beast: {
    fontFamily: "'Space Grotesk', system-ui",
    fontSize: 48,
    uppercase: true,
    textColor: "#00FFFF", // Cyan outline beast vibe
    highlightColor: "#FF007F", // Neon Pink highlighting
    outlineColor: "#000000",
    outlineWidth: 6,
    positionY: 72,
    scaleOnWord: true,
    glowEffect: true
  },
  minimal: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 32,
    uppercase: false,
    textColor: "#FFFFFF",
    highlightColor: "#10B981", // Pine green
    outlineColor: "#1F2937",
    outlineWidth: 2,
    positionY: 80,
    scaleOnWord: false,
    glowEffect: false
  }
};
