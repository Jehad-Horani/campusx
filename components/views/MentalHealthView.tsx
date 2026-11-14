'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { HeartHandshake, Construction, ArrowRight } from 'lucide-react';

export function MentalHealthView() {
  const { setActiveView } = useStore();

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-lg w-full rounded-3xl bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#271430] border border-purple-500/30 p-7 sm:p-10 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300">
          <HeartHandshake className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Construction className="w-3.5 h-3.5" />
          <span>Under Construction — Coming Soon</span>
        </div>

        <h1 className="text-2xl font-extrabold text-white">Mental Health & Student Wellbeing</h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The confidential student wellbeing and counseling module is currently under construction and launching soon.
        </p>

        <button
          onClick={() => setActiveView('dashboard')}
          className="h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
