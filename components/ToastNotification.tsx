'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function ToastNotification() {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm rounded-2xl bg-[#141C2D]/95 border border-cyan-500/40 p-3.5 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="text-xs font-medium text-white leading-relaxed">
        {toastMessage}
      </div>
    </div>
  );
}
