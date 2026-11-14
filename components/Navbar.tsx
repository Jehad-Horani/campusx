'use client';

import React from 'react';
import Image from 'next/image';
import { useStore, ActiveView } from '@/lib/store';
import { NotificationItem } from '@/types/campusx';
import {
  Bell,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const {
    activeView,
    setActiveView,
    t,
    student,
    isOffline,
    setIsNotificationDrawerOpen,
    notifications,
  } = useStore();

  const unreadCount = notifications.filter((n: NotificationItem) => !n.isRead).length;

  const desktopLinks: Array<{ id: ActiveView; label: string; highlight?: boolean }> = [
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'campus-mode', label: t.nav.campusMode },
    { id: 'recommended-courses', label: t.nav.recommendedCourses, highlight: true },
    { id: 'schedule', label: t.nav.schedule },
    { id: 'community', label: t.nav.communityHub },
    { id: 'campus-vision', label: t.nav.problemReport },
  ];

  return (
    <header className="sticky top-0 z-30 w-full h-14 sm:h-16 border-b border-white/10 bg-[#080B14]/95 backdrop-blur-xl px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-2">
      {/* Brand Logo + Wordmark */}
      <button
        onClick={() => setActiveView('dashboard')}
        className="flex items-center gap-2 shrink-0 focus-visible:outline-none cursor-pointer group"
      >
        <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-0.5 transition-transform group-hover:scale-105 shrink-0">
          <Image
            src="/assets/aistudio/LOGO_bc48159f.png"
            alt="CampusX Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
            Campus<span className="text-cyan-400">X</span>
          </span>
          <span className="text-[10px] font-bold tracking-wide text-cyan-300 px-1.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 leading-none">
            ASU
          </span>
        </div>
      </button>

      {/* Desktop Links */}
      <nav className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-medium">
        {desktopLinks.map((link) => {
          const active = activeView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveView(link.id)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                active
                  ? link.highlight
                    ? 'text-purple-300 bg-purple-950/50 border border-purple-500/30 font-semibold'
                    : 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.highlight && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Utility Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Connection Status */}
        <div
          className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border ${
            isOffline
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}
          title={isOffline ? t.status.offline : t.status.online}
        >
          {isOffline ? (
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span className="hidden min-[380px]:inline">
            {isOffline ? t.status.offline : t.status.online}
          </span>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative h-8 sm:h-9 w-8 sm:w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-cyan-500 text-[#080B14] text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Student Profile Avatar */}
        <button
          onClick={() => setActiveView('profile')}
          className="h-8 sm:h-9 flex items-center gap-2 px-1 sm:px-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          aria-label="Student profile"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {student.fullName.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden xl:inline max-w-[100px] truncate">
            {student.fullName.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
