import React from "react";
import { VideoClip } from "../types";
import { Sparkles, Play, Award, HelpCircle, CheckCircle2 } from "lucide-react";

interface AIClipRecommendationsProps {
  clips: VideoClip[];
  onSelectClip: (clip: VideoClip) => void;
  selectedClipId?: string;
}

export default function AIClipRecommendations({
  clips,
  onSelectClip,
  selectedClipId,
}: AIClipRecommendationsProps) {
  if (clips.length === 0) return null;

  return (
    <div className="space-y-4" id="ai-recommendations-list">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
        <h2 className="text-base font-bold text-white tracking-tight font-heading">
          AI Discovered Viral Clips
        </h2>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mb-4">
        Our Gemini 3.5 AI analyzed the transcript timeline and located speech peaks, emotional hooks, and high-retention segments. Click on any clip below to load it into the Live 9:16 Editor.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clips.map((clip, idx) => {
          const isSelected = selectedClipId === clip.id;
          return (
            <div
              key={clip.id}
              onClick={() => onSelectClip(clip)}
              className={`relative glass-card transition-all cursor-pointer flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg ${
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white/5"
                  : "border-white/10 hover:border-white/20"
              }`}
              id={`clip-card-${clip.id}`}
            >
              {/* Highlight badge */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white font-mono text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> Active Editor
                </div>
              )}

              {/* Main Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-white/5 rounded text-indigo-300 border border-white/10">
                    Moment #{idx + 1}
                  </span>
                  
                  {/* Circular / Indicator Virality score */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 text-emerald-400 px-2.5 py-0.5 rounded-full">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-[10px] font-bold">{clip.viralScore}% Virality</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug line-clamp-1 mb-2 group-hover:text-indigo-300 transition-colors">
                  {clip.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
                  {clip.description}
                </p>

                {/* Engagement Peak Waveform */}
                <div className="mb-4 bg-black/25 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                    <span>Viral Retention Wave</span>
                    <span className="text-indigo-400 font-bold">{clip.viralScore > 90 ? "EXTREME PEAK" : "HIGH PEAK"}</span>
                  </div>
                  {/* Wave columns */}
                  <div className="h-6 flex items-end gap-[3px] px-1 overflow-hidden">
                    {Array.from({ length: 22 }).map((_, i) => {
                      // Generate wave peaks based on viralScore and a sine wave formula
                      const multiplier = Math.sin((i / 22) * Math.PI) * 0.8 + 0.2;
                      const noise = Math.sin(i * 1.5) * 0.15;
                      const heightPercent = Math.min(100, Math.floor((clip.viralScore * multiplier + noise * 100) * 0.7));
                      const isHighlighted = isSelected || (i > 6 && i < 16);
                      return (
                        <div
                          key={i}
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-sm transition-all ${
                            isHighlighted
                              ? "bg-gradient-to-t from-indigo-500 to-cyan-400"
                              : "bg-white/10"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 bg-black/20 px-3 py-1.5 rounded-xl border border-dotted border-white/10">
                  <span className="font-mono">Time: <strong className="text-white">{clip.start.toFixed(1)}s</strong> - <strong className="text-white">{clip.end.toFixed(1)}s</strong></span>
                  <span className="font-mono font-medium text-slate-400">{(clip.end - clip.start).toFixed(0)}s Short</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-5 pb-5 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(clip);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    isSelected
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                      : "bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20"
                  }`}
                >
                  <Play className="w-3 text-current animate-pulse" />
                  Load to 9:16 Editor
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
