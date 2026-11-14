'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  Sparkles,
  BookOpen,
  RefreshCw,
  ExternalLink,
  Layers,
  Compass,
  Clock,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export function RecommendedCoursesView() {
  const {
    courses,
    courseRecommendations,
    isLoadingRecommendations,
    refreshCourseRecommendations,
    setActiveView,
  } = useStore();

  const matchingRecommendations = courseRecommendations.filter((group) =>
    courses.some(
      (c) => c.courseName.trim().toLowerCase() === group.courseName.trim().toLowerCase()
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#1D1840] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI External Course Advisor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Recommended External Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Tailored strictly from your enrolled semester courses: external resources split into During-Semester reinforcement and Post-Semester deep dives.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refreshCourseRecommendations()}
            disabled={isLoadingRecommendations || courses.length === 0}
            className="h-11 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            {isLoadingRecommendations ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isLoadingRecommendations ? 'Refreshing...' : 'Refresh AI Picks'}</span>
          </button>
        </div>
      </div>

      {/* Empty or Loading State */}
      {courses.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#141C2D] border border-white/10 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Courses Uploaded Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add your semester courses first so AI can generate personalized external courses.
          </p>
          <button
            onClick={() => setActiveView('courses')}
            className="px-5 h-10 rounded-xl bg-cyan-500 text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Manage My Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : isLoadingRecommendations && matchingRecommendations.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#141C2D] border border-white/10 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-white">
            Analyzing your courses & curating external courses...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matchingRecommendations.map((group, idx) => (
            <div
              key={`${group.courseName}-${idx}`}
              className="p-5 sm:p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  {group.courseCode && (
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {group.courseCode}
                    </span>
                  )}
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    {group.courseName}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* During Semester */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>During Semester (Reinforcement)</span>
                  </div>

                  <div className="space-y-2.5">
                    {group.duringSemester.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#080B14]/80 border border-cyan-500/20 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 shrink-0">
                            {item.provider}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.reason}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {item.duration} · {item.level}
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                          >
                            <span>Open Course</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post Semester */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Post-Semester (Deep Dive)</span>
                  </div>

                  <div className="space-y-2.5">
                    {group.postSemester.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#080B14]/80 border border-purple-500/20 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 shrink-0">
                            {item.provider}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.reason}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {item.duration} · {item.level}
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold"
                          >
                            <span>Open Course</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
