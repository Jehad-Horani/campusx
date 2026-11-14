'use client';

import React from 'react';
import { useStore, ActiveView } from '@/lib/store';
import {
  LayoutDashboard,
  Navigation,
  Sparkles,
  BookOpen,
  Calendar,
  Users,
  Camera,
  HeartHandshake,
  Bot,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';

export function Sidebar() {
  const {
    activeView,
    setActiveView,
    t,
    student,
    isOffline,
    logoutStudent,
  } = useStore();

  const navSection = (
    label: string,
    items: Array<{
      id: ActiveView;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string;
      badgeColor?: string;
    }>
  ) => (
    <div className="mb-5">
      <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/70 to-purple-950/40 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    item.badgeColor || 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 bg-[#080B14]/90 p-4 min-h-[calc(100vh-4rem)] justify-between select-none">
      <div className="overflow-y-auto pr-1">
        {navSection('Main Menu', [
          { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
          { id: 'campus-mode', label: t.nav.campusMode, icon: Navigation, badge: 'ASU', badgeColor: 'bg-cyan-500/20 text-cyan-300' },
          { id: 'courses', label: t.nav.courses, icon: BookOpen },
          { id: 'schedule', label: t.nav.schedule, icon: Calendar },
          { id: 'recommended-courses', label: t.nav.recommendedCourses, icon: Sparkles, badge: 'AI', badgeColor: 'bg-purple-500/20 text-purple-300' },
        ])}

        {navSection('Campus Services', [
          { id: 'community', label: t.nav.communityHub, icon: Users },
          { id: 'campus-vision', label: t.nav.problemReport, icon: Camera },
        ])}

        {navSection('Coming Soon', [
          { id: 'ai-assistant', label: t.nav.aiAssistant, icon: Bot, badge: 'Soon', badgeColor: 'bg-white/10 text-slate-300' },
          { id: 'mental-health', label: t.nav.mentalHealth, icon: HeartHandshake, badge: 'Soon', badgeColor: 'bg-white/10 text-slate-300' },
        ])}
      </div>

      {/* Footer Area */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isOffline ? t.status.offline : t.status.online}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">{student.universityId}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 gap-1">
          <button
            onClick={() => setActiveView('profile')}
            className="flex items-center gap-2.5 text-start truncate flex-1 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{student.fullName}</div>
              <div className="text-[10px] text-slate-400 truncate">{student.major}</div>
            </div>
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={t.nav.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={logoutStudent}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title={t.nav.signOut}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
