'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  Settings,
  Bell,
  LocateFixed,
  CheckCircle2,
} from 'lucide-react';

export function SettingsView() {
  const {
    notificationPrefs,
    updateNotificationPrefs,
    requestNotificationPermission,
    locationPermissionStatus,
    requestLocationAccess,
    t,
  } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div>
        <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          <span>Platform Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.nav.settings}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure real-time notifications and GPS location permissions
        </p>
      </div>

      <div className="space-y-4">
        {/* Permissions: Location */}
        <div className="p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <LocateFixed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Location Access Permission</h3>
                <p className="text-xs text-slate-400">
                  Used to detect if you are on ASU campus and estimate walking time to lectures.
                </p>
              </div>
            </div>

            {locationPermissionStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Granted</span>
              </span>
            ) : (
              <button
                onClick={requestLocationAccess}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer"
              >
                Allow Location
              </button>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Notification Preferences</h3>
                <p className="text-xs text-slate-400">
                  Browser push alerts for walking time warnings and exam/quiz deadlines
                </p>
              </div>
            </div>

            {notificationPrefs.permissionStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Push Active</span>
              </span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                Enable Push Alerts
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-white">Campus Mode Walking Time Warnings</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Alert 15 minutes before lecture with ON TIME / TIGHT / LATE status.
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs.walkingWarnings}
                onChange={(e) => updateNotificationPrefs({ walkingWarnings: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-white">Exam & Quiz Deadlines</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Receive reminders 48 hours and 2 hours prior to scheduled evaluations.
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs.examDeadlines}
                onChange={(e) => updateNotificationPrefs({ examDeadlines: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
