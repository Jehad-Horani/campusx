'use client';

import React, { useState } from 'react';
import { useStore, ActiveView } from '@/lib/store';
import {
  LayoutDashboard,
  Navigation,
  Sparkles,
  BookOpen,
  Calendar,
  Grid,
  X,
  Users,
  Camera,
  HeartHandshake,
  Bot,
  Settings,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export function MobileBottomNav() {
  const { activeView, setActiveView, t, logoutStudent } = useStore();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  const drawerItems: Array<{
    id: ActiveView;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: string;
  }> = [
    {
      id: 'courses',
      label: t.nav.courses,
      desc: 'Manage enrolled courses & rooms',
      icon: BookOpen,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'community',
      label: t.nav.communityHub,
      desc: 'Browse & submit student events',
      icon: Users,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'campus-vision',
      label: t.nav.problemReport,
      desc: 'Report a campus issue via photo',
      icon: Camera,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'ai-assistant',
      label: t.nav.aiAssistant,
      desc: 'Under Construction — Coming Soon',
      icon: Bot,
      color: 'text-slate-400 bg-white/5 border-white/10',
      badge: 'Soon',
    },
    {
      id: 'mental-health',
      label: t.nav.mentalHealth,
      desc: 'Under Construction — Coming Soon',
      icon: HeartHandshake,
      color: 'text-slate-400 bg-white/5 border-white/10',
      badge: 'Soon',
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#080B14]/95 backdrop-blur-2xl border-t border-white/10 px-1.5 py-1.5 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]"
      >
        <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto">
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeView === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 truncate max-w-[58px]">{t.nav.dashboard}</span>
          </button>

          {/* Tab 2: Campus Map */}
          <button
            onClick={() => setActiveView('campus-mode')}
            className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeView === 'campus-mode' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span className="text-[10px] mt-1 truncate max-w-[58px]">Campus</span>
          </button>

          {/* Tab 3: AI External Courses (Center Focus) */}
          <button
            onClick={() => setActiveView('recommended-courses')}
            className="relative flex flex-col items-center justify-center min-h-[44px] -mt-4 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-95 border border-white/20 ${
                activeView === 'recommended-courses'
                  ? 'bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-cyan-500/30'
                  : 'bg-gradient-to-tr from-cyan-600/80 to-purple-700/80 text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-1 text-cyan-300 truncate max-w-[60px]">
              AI Courses
            </span>
          </button>

          {/* Tab 4: Schedule & Quizzes */}
          <button
            onClick={() => setActiveView('schedule')}
            className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeView === 'schedule' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-1 truncate max-w-[58px]">Tasks</span>
          </button>

          {/* Tab 5: More Drawer */}
          <button
            onClick={() => setIsMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
              isMoreDrawerOpen ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] mt-1 truncate max-w-[58px]">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Drawer */}
      {isMoreDrawerOpen && (
        <div
          onClick={() => setIsMoreDrawerOpen(false)}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#101525] border-t border-cyan-500/30 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">CampusX Services</h3>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMoreDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-start flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-500/40'
                        : 'bg-[#141C2D] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  setActiveView('profile');
                  setIsMoreDrawerOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#141C2D] border border-white/10 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>{t.nav.profile}</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('settings');
                  setIsMoreDrawerOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#141C2D] border border-white/10 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  logoutStudent();
                }}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
