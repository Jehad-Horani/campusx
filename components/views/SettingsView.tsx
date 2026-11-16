'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Settings,
  Bell,
  LocateFixed,
  CheckCircle2,
  ExternalLink,
  Volume2,
  Info,
} from 'lucide-react';

export function SettingsView() {
  const {
    notificationPrefs,
    updateNotificationPrefs,
    requestNotificationPermission,
    sendTestNotification,
    locationPermissionStatus,
    requestLocationAccess,
    t,
  } = useStore();

  const [inIframe, setInIframe] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    const syncEnv = () => {
      try {
        setInIframe(window.self !== window.top);
      } catch {
        setInIframe(true);
      }
      setAppUrl(window.location.href);
    };
    const t0 = setTimeout(syncEnv, 0);
    return () => clearTimeout(t0);
  }, []);

  const osGranted = notificationPrefs.permissionStatus === 'granted';
  const inAppActive = Boolean(notificationPrefs.inAppAlertsEnabled) || osGranted;

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
                  Used to detect if you are on ASU campus, pin you on the map, and measure real distance to lectures.
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
                  Browser push & in-app smart alerts for walking warnings and exam/quiz deadlines
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {osGranted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OS Push Active</span>
                </span>
              ) : (
                <button
                  onClick={requestNotificationPermission}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                >
                  {inAppActive ? 'Retry OS Push Permission' : 'Enable Alerts'}
                </button>
              )}

              <button
                type="button"
                onClick={sendTestNotification}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Send Test Alert</span>
              </button>
            </div>
          </div>

          {/* Clear Safari / Chrome / Iframe Status Hint */}
          {!osGranted && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/35 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-start gap-2 text-cyan-200">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <div className="font-bold text-white">
                    {inAppActive
                      ? 'In-App Smart Alerts Are Active'
                      : 'Browser OS Popups Require a Direct Tab'}
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {inIframe || notificationPrefs.blockReason === 'iframe'
                      ? 'Chrome & Safari automatically block OS notification permission prompts inside embedded preview iframes. In-App alerts & chimes still work right here, and you can open CampusX in a full browser tab to enable native OS notifications.'
                      : notificationPrefs.permissionStatus === 'unsupported'
                      ? 'On iPhone/iPad Safari, tap Share → Add to Home Screen for iOS Push Notifications. In-App Smart Alerts work immediately.'
                      : 'If the browser previously blocked notifications for this site, allow Notifications in Chrome/Safari Site Settings, or use the active In-App Smart Alerts.'}
                  </p>
                </div>
              </div>
              {(inIframe || notificationPrefs.blockReason === 'iframe') && appUrl && (
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B14] font-bold text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Full Browser Tab for OS Push</span>
                </a>
              )}
            </div>
          )}

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
