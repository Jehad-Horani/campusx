'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOffline } = useStore();

  if (!isOffline) return null;

  return (
    <div className="w-full bg-amber-950/90 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-100">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-semibold">
          No internet connection — displaying locally cached data
        </span>
      </div>
    </div>
  );
}
