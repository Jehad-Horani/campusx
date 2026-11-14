'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { NotificationItem } from '@/types/campusx';
import {
  X,
  Bell,
  CheckCheck,
  Calendar,
  Compass,
  Users,
  Sparkles,
} from 'lucide-react';

export function NotificationDrawer() {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    t,
  } = useStore();

  if (!isNotificationDrawerOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'campus':
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'community':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'system':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'academic':
      default:
        return <Calendar className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div
      onClick={() => setIsNotificationDrawerOpen(false)}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end"
    >
      <div
        className="w-full max-w-md h-full bg-[#101525] border-l border-white/10 shadow-2xl flex flex-col animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#080B14]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">{t.nav.notifications}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notifications at this time
            </div>
          ) : (
            notifications.map((n: NotificationItem) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-white/5 border-white/5 text-slate-300'
                    : 'bg-cyan-950/25 border-cyan-500/30 text-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#080B14] border border-white/10 shrink-0">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold truncate">{n.title}</div>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.dateSent}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {n.message}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/10 bg-[#080B14] text-[11px] text-center text-slate-500">
          CampusX Smart Notification Center
        </div>
      </div>
    </div>
  );
}
