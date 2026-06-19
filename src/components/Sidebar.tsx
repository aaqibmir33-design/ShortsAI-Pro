import React from "react";
import { Film, Sparkles, TrendingUp, Cpu, Award } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-72 glass text-white border-b lg:border-r border-white/10 p-6 flex flex-col justify-between" id="app-sidebar">
      <div>
        {/* Brand Header with Frosted Theme */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-white flex items-center gap-1">
              ShortsAI<span className="text-indigo-400">Pro</span>
            </h1>
            <p className="text-[10px] text-indigo-300 font-mono tracking-wider">Kashmir's Finest Video AI</p>
          </div>
        </div>

        {/* Pro Stats Panel */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 relative overflow-hidden" id="stats-panel">
          <div className="accent-glow absolute inset-0 opacity-20"></div>
          <h2 className="text-xs font-mono text-indigo-300 uppercase tracking-widest mb-3">Workspace Stats</h2>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Virality Rating</span>
              <span className="font-bold text-emerald-400 font-mono">98.4% Max</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> Server Load</span>
              <span className="font-bold text-indigo-300 font-mono">0.02% (Free)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" /> Render Engine</span>
              <span className="font-bold text-amber-300 font-mono">Canvas v2</span>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-5" id="feature-list">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">Features Included</h3>
          
          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-indigo-500/10 mt-0.5 text-indigo-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-200">9:16 Auto Cropping</h4>
              <p className="text-xs text-slate-400">Fits 16:9 videos perfectly into vertical format with interactive positioning.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-emerald-500/10 mt-0.5 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-200">AI Engagement Detector</h4>
              <p className="text-xs text-slate-400">Finds best hooks and speech peaks using Gemini 3.5 Flash automatically.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-amber-500/10 mt-0.5 text-amber-400">
              <span className="font-mono text-xs font-bold leading-none">AA</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-200">Hormozi / Beast Captions</h4>
              <p className="text-xs text-slate-400">Saves thousands in editing fees. Word-by-word highlights styled beautifully.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
        <p className="font-mono">Local rendering engine operates entirely on device. No video limits.</p>
        <p className="mt-2 text-indigo-400 font-medium">✨ Powered by Gemini AI</p>
      </div>
    </aside>
  );
}
