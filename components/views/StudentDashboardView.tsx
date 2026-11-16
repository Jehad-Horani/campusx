'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/lib/store';
import { ScheduleItem, ScheduleItemType } from '@/types/campusx';
import {
  decodeAsuClassroom,
  formatTime12h,
  isInsideAsuCampus,
  parseTimeToMinutes,
} from '@/lib/asu-campus';
import { CampusModeCard } from '@/components/CampusModeCard';
import {
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  AlertCircle,
  ArrowRight,
  MapPin,
  Shield,
  Bell,
  LocateFixed,
  Plus,
  Trash2,
  ExternalLink,
  X,
  GraduationCap,
  Loader2,
  Radio,
} from 'lucide-react';

export function StudentDashboardView() {
  const {
    student,
    courses,
    schedule,
    addScheduleItem,
    deleteScheduleItem,
    courseRecommendations,
    isLoadingRecommendations,
    announcements,
    setActiveView,
    userCoordinates,
    locationPermissionStatus,
    requestLocationAccess,
    notificationPrefs,
    requestNotificationPermission,
    campusWeather,
    t,
  } = useStore();

  // Pure timestamp state updated on mount & every minute
  const [nowMs, setNowMs] = useState<number>(0);

  // Quick Task / Quiz Modal
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<ScheduleItemType>('quiz');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('12:00');
  const [taskLocation, setTaskLocation] = useState('1104');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const syncTime = () => {
      const now = Date.now();
      setNowMs(now);
      setTaskDate((prev) => prev || new Date(now + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    };
    const t0 = setTimeout(syncTime, 0);
    const interval = setInterval(syncTime, 60000);
    return () => {
      clearTimeout(t0);
      clearInterval(interval);
    };
  }, []);

  const todayStr = nowMs
    ? new Date(nowMs).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const upcomingTasks = schedule.filter((item) => item.type !== 'class');

  const todayCode = nowMs
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(nowMs).getDay()]
    : '';
  const todayCoursesFiltered = todayCode
    ? courses.filter((c) => c.days.length === 0 || c.days.includes(todayCode))
    : courses;
  const todayLectures = (todayCoursesFiltered.length > 0 ? todayCoursesFiltered : courses)
    .slice()
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))
    .slice(0, 4);

  const handleQuickTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingTask || !taskTitle.trim()) return;

    const dec = decodeAsuClassroom(taskLocation);
    const effectiveDate = taskDate || new Date().toISOString().split('T')[0];
    const dueIso = new Date(`${effectiveDate}T${taskTime}:00`).toISOString();

    setIsSubmittingTask(true);
    try {
      await addScheduleItem({
        scheduleId: `tsk_${Date.now()}`,
        courseId: courses[0]?.courseId || 'custom',
        courseCode: courses[0]?.courseCode || '',
        title: taskTitle.trim(),
        date: effectiveDate,
        dueDateTime: dueIso,
        startTime: taskTime,
        endTime: taskTime,
        location: taskLocation.trim() || 'ASU',
        building: dec.isValid ? dec.buildingNameEn : 'ASU Campus',
        type: taskType,
        status: 'upcoming',
      });

      setShowQuickTaskModal(false);
      setTaskTitle('');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (deletingTaskId === id) return;
    setDeletingTaskId(id);
    try {
      await deleteScheduleItem(id);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const formatCountdown = (dueIso?: string) => {
    if (!dueIso || !nowMs) return '';
    const diffHours = Math.max(0, Math.round((new Date(dueIso).getTime() - nowMs) / (1000 * 60 * 60)));
    if (diffHours < 24) {
      return `in ${diffHours}h`;
    }
    const days = Math.floor(diffHours / 24);
    return `in ${days}d`;
  };

  const campusCheck = userCoordinates
    ? isInsideAsuCampus(userCoordinates.lat, userCoordinates.lng)
    : null;
  const isInsideCampus = Boolean(campusCheck?.inside);

  const alertsConfigured =
    notificationPrefs.permissionStatus === 'granted' || Boolean(notificationPrefs.inAppAlertsEnabled);

  const showPermissionsBanner =
    locationPermissionStatus !== 'granted' || !alertsConfigured;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-2">
            <span>{todayStr}</span>
            <span className="text-slate-600">·</span>
            <span>{student.faculty}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.dashboard.greetingMorning}, {student.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{t.dashboard.welcomeSub}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isInsideCampus && campusCheck && (
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-xs font-bold text-emerald-200 flex items-center gap-2 shadow-lg shadow-emerald-500/15"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>On Campus · Bldg {campusCheck.nearestBuilding.code}</span>
            </motion.div>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>
              Year {student.academicYear} · {student.major}
            </span>
          </div>
        </div>
      </div>

      {/* Live On-Campus Animated Atmosphere Strip */}
      {isInsideCampus && campusCheck && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#0E222A] to-cyan-950/70 border border-emerald-400/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <motion.div
            aria-hidden
            animate={{ x: ['-100%', '220%'] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-300/15 to-transparent skew-x-12"
          />
          <div className="relative z-10 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-2xl bg-emerald-400/40"
              />
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-white flex flex-wrap items-center gap-2">
                <span>Welcome Inside ASU Campus</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  LIVE TRACKING
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mt-0.5">
                Nearest building: <strong>Bldg {campusCheck.nearestBuilding.code} ({campusCheck.nearestBuilding.nameEn})</strong> · {campusWeather.temperatureC}°C {campusWeather.condition}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('campus-mode')}
            className="relative z-10 h-9 px-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#080B14] font-extrabold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shrink-0 transition-colors"
          >
            <span>See My Pin on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Permissions Banner */}
      {showPermissionsBanner && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/50 via-[#141C2D] to-purple-950/50 border border-cyan-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Enable Smart Permissions for Full Experience</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Location access detects if you are inside ASU campus to calculate real walking distance, and Notifications alert you 15m before lectures and 48h/2h before exams & quizzes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {locationPermissionStatus !== 'granted' && (
              <button
                onClick={requestLocationAccess}
                className="h-10 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B14] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Allow Location</span>
              </button>
            )}
            {!alertsConfigured && (
              <button
                onClick={requestNotificationPermission}
                className="h-10 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Alerts</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Smart Campus Mode Card */}
      <section aria-label="Campus Mode">
        <CampusModeCard />
      </section>

      {/* 2. Quizzes, Assignments & Exams Tracker + AI Recommended Courses Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quizzes & Assignments Tracker */}
        <section className="lg:col-span-6 bg-[#141C2D] rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Quizzes, Assignments & Exams</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Alerts sent 48h & 2h before due time; expired items auto-remove.
              </p>
            </div>
            <button
              onClick={() => setShowQuickTaskModal(true)}
              className="h-9 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B14] font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No upcoming quizzes or assignments.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.slice(0, 4).map((item: ScheduleItem) => {
                const dec = decodeAsuClassroom(item.location);
                const isDeleting = deletingTaskId === item.scheduleId;
                return (
                  <div
                    key={item.scheduleId}
                    className="p-3.5 rounded-2xl bg-[#080B14]/70 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.type === 'exam'
                              ? 'bg-rose-500/20 text-rose-300'
                              : item.type === 'quiz'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {item.type}
                        </span>
                        {item.dueDateTime && (
                          <span className="text-[10px] font-mono text-cyan-300">
                            {formatCountdown(item.dueDateTime)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {item.date} · {formatTime12h(item.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {item.location} {dec.isValid ? `(${dec.buildingNameEn})` : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(item.scheduleId)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer shrink-0 disabled:opacity-50"
                      aria-label="Delete task"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setActiveView('schedule')}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Manage Full Tasks & Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* Right: AI Recommended External Courses Preview Card */}
        <section className="lg:col-span-6 bg-[#141C2D] rounded-3xl p-5 sm:p-6 border border-purple-500/25 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Recommended Courses</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  External picks for During Semester & Post-Semester deep dives
                </p>
              </div>
              <button
                onClick={() => setActiveView('recommended-courses')}
                className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{t.dashboard.viewAll}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingRecommendations && courseRecommendations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Generating AI course recommendations...
              </div>
            ) : courses.length === 0 || courseRecommendations.filter((g) => courses.some((c) => c.courseName.trim().toLowerCase() === g.courseName.trim().toLowerCase())).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Add courses to see AI external recommendations.
              </div>
            ) : (
              <div className="space-y-2.5">
                {courseRecommendations
                  .filter((g) =>
                    courses.some(
                      (c) => c.courseName.trim().toLowerCase() === g.courseName.trim().toLowerCase()
                    )
                  )
                  .slice(0, 2)
                  .map((group, idx) => {
                    const topDuring = group.duringSemester[0];
                    const topPost = group.postSemester[0];
                    return (
                      <div
                        key={`${group.courseName}-${idx}`}
                        onClick={() => setActiveView('recommended-courses')}
                        className="p-3.5 rounded-2xl bg-[#080B14]/70 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-white truncate">
                            {group.courseName}
                          </span>
                          {group.courseCode && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 shrink-0">
                              {group.courseCode}
                            </span>
                          )}
                        </div>
                        {topDuring && (
                          <div className="text-[11px] text-slate-300 flex items-center justify-between gap-2">
                            <span className="truncate">
                              <span className="text-cyan-400 font-bold">During: </span>
                              {topDuring.title}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                          </div>
                        )}
                        {topPost && (
                          <div className="text-[11px] text-slate-300 flex items-center justify-between gap-2">
                            <span className="truncate">
                              <span className="text-purple-400 font-bold">Post: </span>
                              {topPost.title}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveView('recommended-courses')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-purple-500/30 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open All Recommended Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>

      {/* 3. Today's Lectures + Official Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-[#141C2D] rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{t.dashboard.whatMattersNow}</span>
            </h2>
            <button
              onClick={() => setActiveView('courses')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {todayLectures.map((c) => {
              const dec = decodeAsuClassroom(c.classroom);
              return (
                <div
                  key={c.courseId}
                  className="p-3.5 rounded-2xl bg-[#080B14]/70 border border-white/10 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-cyan-400">
                      {c.courseCode || c.days.join('/')}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300">
                      {formatTime12h(c.startTime)} - {formatTime12h(c.endTime)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{c.courseName}</div>
                  <div className="text-[11px] text-emerald-300 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {c.classroom} · {dec.summaryEn}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-5 bg-[#141C2D] rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Official ASU Announcements</span>
          </h2>

          <div className="space-y-2.5">
            {announcements.slice(0, 3).map((anc) => (
              <div
                key={anc.announcementId}
                className="p-3.5 rounded-2xl bg-[#080B14]/70 border border-white/10 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{anc.title}</span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded shrink-0">
                    {anc.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {anc.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick Add Quiz / Assignment Modal */}
      {showQuickTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#101525] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Quiz, Assignment, or Exam</h3>
              <button
                type="button"
                disabled={isSubmittingTask}
                onClick={() => setShowQuickTaskModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Database Lab Quiz"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as ScheduleItemType)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Room / Location</label>
                  <input
                    type="text"
                    value={taskLocation}
                    onChange={(e) => setTaskLocation(e.target.value)}
                    placeholder="7106 / Online"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Due Time</label>
                  <input
                    type="time"
                    required
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingTask}
                className="w-full h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B14] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmittingTask ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save & Enable Reminders</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
