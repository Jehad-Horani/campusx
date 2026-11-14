'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { decodeAsuClassroom } from '@/lib/asu-campus';
import { WifiOff, Clock, MapPin, User, BookOpen, Calendar } from 'lucide-react';

export function OfflineCachedView() {
  const { student, courses, schedule, lastSyncTime } = useStore();
  const lectureItems = schedule.filter((s) => s.type === 'class');

  return (
    <div dir="ltr" className="min-h-screen bg-[#080B14] text-[#F5F7FF] flex flex-col">
      {/* Top Offline Status Bar */}
      <div className="w-full bg-amber-950/90 border-b border-amber-500/40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <WifiOff className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-amber-100">
              Offline Mode Active — Showing Cached Academic Data
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-200/80">
            Last sync: {lastSyncTime}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Student Cached Info */}
        <section className="p-5 rounded-3xl bg-[#141C2D] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-lg font-black text-white shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">{student.fullName}</h1>
              <div className="text-xs text-cyan-300 font-mono">
                {student.universityId} · {student.major}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{student.faculty}</div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 self-start sm:self-center">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academic Year {student.academicYear}</span>
          </div>
        </section>

        {/* Cached Courses & Classrooms */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Cached Semester Lectures & Rooms</span>
          </h2>

          {courses.length === 0 && lectureItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#141C2D] border border-white/10 text-center text-xs text-slate-400">
              No cached courses saved on this device yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {courses.map((c) => {
                const decoded = decodeAsuClassroom(c.classroom);
                return (
                  <div
                    key={c.courseId}
                    className="p-4 rounded-2xl bg-[#141C2D] border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                        {c.courseCode}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {c.creditHours} Cr
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h3 className="text-sm font-bold text-white">{c.courseName}</h3>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {c.days.join(' / ')} · {c.startTime} - {c.endTime}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#080B14] border border-white/5 text-xs flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Room {c.classroom}</div>
                        <div className="text-[11px] text-emerald-300 mt-0.5">
                          {decoded.summaryEn}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
