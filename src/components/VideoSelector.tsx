import React, { useState, useRef } from "react";
import { Link2, Upload, Sparkles, Film, AlertCircle } from "lucide-react";

interface VideoSelectorProps {
  onAnalyzeUrl: (url: string, topic: string) => Promise<void>;
  onLocalFileSelected: (file: File) => void;
  isLoading: boolean;
  onSelectDemo: (videoId: string) => void;
}

export default function VideoSelector({
  onAnalyzeUrl,
  onLocalFileSelected,
  isLoading,
  onSelectDemo,
}: VideoSelectorProps) {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("Motivational Podcast");
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate YouTube URL structure
  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!url.trim()) {
      setValidationError("Please enter a valid URL.");
      return;
    }

    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
    if (!isYoutube) {
      setValidationError("Please enter a valid YouTube video watch link.");
      return;
    }

    onAnalyzeUrl(url, topic);
  };

  // Drag and Drop implementation for flexible client upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        onLocalFileSelected(file);
      } else {
        setValidationError("Only video files (MP4, WebM, etc.) are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLocalFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6" id="video-selector-container">
      {/* Selector Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Paste link panel */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="accent-glow absolute inset-0 opacity-15"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <Link2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight font-heading">Source Video</h2>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Analyze public videos directly. Our AI detects audio hooks, transcribes content and slices engagement-peaks into Shorts automatically.
            </p>

            <form onSubmit={handleSubmitUrl} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                  YouTube Video Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-black/40 border border-white/10 hover:border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-505 font-sans tracking-tight text-white disabled:opacity-50 transition-all"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-400">
                    <Film className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5 font-mono">
                  Backup Context / Guest (If no transcript found)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joe Rogan discussing human intelligence"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-black/40 border border-white/10 hover:border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-505 font-sans tracking-tight text-white disabled:opacity-50 transition-all"
                />
              </div>

              {validationError && (
                <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing Metadata...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    Extract AI Clips (Free)
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-5 font-mono border-t border-white/5 pt-4">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div> AI Analysis Enabled
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Face-Tracking On
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> Auto-Captions
            </span>
          </div>
        </div>

        {/* Drag & Drop Local Upload */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card p-6 flex flex-col items-center justify-center transition-all cursor-pointer text-center group border border-dashed relative overflow-hidden ${
            isDragActive
              ? "border-indigo-500 bg-slate-900/80 scale-[0.99]"
              : "border-white/20 hover:border-indigo-400 hover:bg-white/10"
          }`}
          id="dropzone-area"
        >
          <div className="accent-glow absolute inset-0 opacity-10"></div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
          <div className="p-4 bg-white/5 rounded-full shadow-lg mb-4 border border-white/10 transform group-hover:scale-110 transition-transform relative z-10">
            <Upload className="w-6 h-6 text-indigo-300 group-hover:text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5 font-heading relative z-10">Upload Local Video</h3>
          <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed relative z-10">
            Drag and drop your own raw video footage here, or click to browse. Bypass standard YouTube download blocks entirely!
          </p>
          <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-semibold text-indigo-300 uppercase tracking-widest font-mono shadow-sm relative z-10">
            Fastest Rendering
          </span>
        </div>
      </div>

      {/* Popular Demo Presets */}
      <div className="glass-card p-5 text-white shadow-sm relative overflow-hidden">
        <div className="accent-glow absolute inset-0 opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-xs font-mono text-indigo-300 uppercase tracking-widest">
              Fast Track: Try Instant Demo Clips
            </h3>
          </div>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Don't have a URL or local video file? Initialize editing instantly using these high-converting preset clips:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onSelectDemo("hormozi-wealth")}
              className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10 text-left hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
            >
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150"
                alt="Alex"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                  Alex Hormozi
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2">
                  "The Golden Rule of Offers & Pricing Fear"
                </p>
              </div>
            </button>

            <button
              onClick={() => onSelectDemo("rogan-artificial")}
              className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10 text-left hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
            >
              <img
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=150"
                alt="Joe"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                  Joe Rogan Podcast
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2">
                  "Robotic Hardware & Humanoid Replication Speeds"
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
