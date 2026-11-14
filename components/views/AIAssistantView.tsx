'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Bot, Construction, Sparkles, ArrowRight } from 'lucide-react';

export function AIAssistantView() {
  const { setActiveView } = useStore();

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-lg w-full rounded-3xl bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#1D1840] border border-cyan-500/30 p-7 sm:p-10 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <Bot className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Construction className="w-3.5 h-3.5" />
          <span>Under Construction — Coming Soon</span>
        </div>

        <h1 className="text-2xl font-extrabold text-white">Personal Academic Assistant</h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          We are actively building the personalized ASU AI Academic Assistant. Stay tuned for the upcoming release.
        </p>

        <button
          onClick={() => setActiveView('dashboard')}
          className="h-11 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B14] font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
