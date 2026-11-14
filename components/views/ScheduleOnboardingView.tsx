'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Course } from '@/types/campusx';
import {
  decodeAsuClassroom,
  findCourseTimeConflict,
  findFirstAvailableSlot,
  formatTime12h,
  getBlockedIntervalsForDays,
  getEndTimeSlots,
  getStartTimeSlots,
  normalizeTimeHHMM,
  parseTimeToMinutes,
} from '@/lib/asu-campus';
import {
  Calendar,
  Plus,
  Trash2,
  MapPin,
  Clock,
  BookOpen,
  CheckCircle2,
  Sparkles,
  LogOut,
  Loader2,
  AlertTriangle,
  Lock,
  Pencil,
  X,
} from 'lucide-react';

const DAYS_LIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

function pickBestEndTime(
  start: string,
  preferredEnd: string,
  targetDays: string[],
  otherCourses: Course[]
): string {
  const endSlots = getEndTimeSlots(start, targetDays, otherCourses).filter((s) => !s.disabled);
  if (endSlots.length === 0) return '';
  const normPreferred = normalizeTimeHHMM(preferredEnd);
  if (endSlots.some((s) => s.value === normPreferred)) return normPreferred;
  const startMins = parseTimeToMinutes(start);
  const hourSlot = endSlots.find((s) => s.minutes === startMins + 60);
  if (hourSlot) return hourSlot.value;
  return endSlots[0].value;
}

export function ScheduleOnboardingView() {
  const { student, completeOnboarding, logoutStudent, showToast } = useStore();

  const [draftCourses, setDraftCourses] = useState<Course[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [courseName, setCourseName] = useState('');
  const [classroom, setClassroom] = useState('');
  const [days, setDays] = useState<string[]>(['Sun', 'Tue', 'Thu']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [isSaving, setIsSaving] = useState(false);

  const decodedPreview = decodeAsuClassroom(classroom);

  const comparisonCourses = useMemo(
    () => (editingDraftId ? draftCourses.filter((c) => c.courseId !== editingDraftId) : draftCourses),
    [draftCourses, editingDraftId]
  );

  const blockedIntervals = useMemo(
    () => getBlockedIntervalsForDays(days, comparisonCourses),
    [days, comparisonCourses]
  );

  const startTimeSlots = useMemo(
    () => getStartTimeSlots(days, comparisonCourses),
    [days, comparisonCourses]
  );

  const endTimeSlots = useMemo(
    () => getEndTimeSlots(startTime, days, comparisonCourses),
    [startTime, days, comparisonCourses]
  );

  const hasAvailableStartSlot = useMemo(
    () => startTimeSlots.some((s) => !s.disabled),
    [startTimeSlots]
  );

  const hasAvailableEndSlot = useMemo(
    () => endTimeSlots.some((s) => !s.disabled),
    [endTimeSlots]
  );

  const liveTimeError = useMemo(() => {
    if (days.length === 0) {
      return 'Select at least one lecture day.';
    }
    if (!hasAvailableStartSlot) {
      return 'No free time slots remain on the selected days. Choose other days or remove an existing course.';
    }
    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);
    const conflict = findCourseTimeConflict({ days, startTime, endTime }, comparisonCourses);
    if (conflict) {
      return `Schedule conflict with "${conflict.conflictingCourse}" on ${conflict.overlappingDays.join(', ')} (${conflict.timeRange}). Two lectures cannot be at the same time.`;
    }
    if (!startTime || !endTime || startMins < 0 || endMins <= startMins || !hasAvailableEndSlot) {
      return 'Select an available start and end time.';
    }
    return null;
  }, [days, startTime, endTime, comparisonCourses, hasAvailableStartSlot, hasAvailableEndSlot]);

  const snapTimesForDays = (
    targetDays: string[],
    otherList: Course[],
    currentStart: string,
    currentEnd: string
  ) => {
    if (targetDays.length === 0) return;
    const normStart = normalizeTimeHHMM(currentStart);
    const normEnd = normalizeTimeHHMM(currentEnd);
    const conflict = findCourseTimeConflict(
      { days: targetDays, startTime: normStart, endTime: normEnd },
      otherList
    );
    const startOpt = getStartTimeSlots(targetDays, otherList).find(
      (s) => s.value === normStart && !s.disabled
    );
    const endOpt = getEndTimeSlots(normStart, targetDays, otherList).find(
      (s) => s.value === normEnd && !s.disabled
    );

    if (!conflict && startOpt && endOpt) {
      setStartTime(normStart);
      setEndTime(normEnd);
      return;
    }

    const firstFree = findFirstAvailableSlot(targetDays, otherList, 60);
    if (firstFree) {
      setStartTime(firstFree.startTime);
      setEndTime(firstFree.endTime);
    } else {
      setStartTime('');
      setEndTime('');
    }
  };

  const toggleDay = (dayId: string) => {
    const nextDays = days.includes(dayId)
      ? days.filter((d) => d !== dayId)
      : [...days, dayId];
    setDays(nextDays);
    snapTimesForDays(nextDays, comparisonCourses, startTime, endTime);
  };

  const handleStartTimeChange = (nextStart: string) => {
    setStartTime(nextStart);
    setEndTime(pickBestEndTime(nextStart, endTime, days, comparisonCourses));
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !courseName.trim() || !classroom.trim()) return;

    if (liveTimeError) {
      showToast(liveTimeError);
      return;
    }

    const decoded = decodeAsuClassroom(classroom);
    const normStart = normalizeTimeHHMM(startTime);
    const normEnd = normalizeTimeHHMM(endTime);

    let nextDrafts: Course[];
    if (editingDraftId) {
      nextDrafts = draftCourses.map((c) =>
        c.courseId === editingDraftId
          ? {
              ...c,
              courseName: courseName.trim(),
              classroom: classroom.trim(),
              building: decoded.isValid ? decoded.buildingNameEn : 'ASU Campus',
              days,
              startTime: normStart,
              endTime: normEnd,
            }
          : c
      );
      setEditingDraftId(null);
      showToast('Course updated.');
    } else {
      const newCourse: Course = {
        courseId: `crs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        courseCode: '',
        courseName: courseName.trim(),
        creditHours: 3,
        instructorName: '',
        instructorEmail: '',
        classroom: classroom.trim(),
        building: decoded.isValid ? decoded.buildingNameEn : 'ASU Campus',
        days,
        startTime: normStart,
        endTime: normEnd,
        color: '#35C8FF',
        syllabus: '',
      };
      nextDrafts = [...draftCourses, newCourse];
    }

    setDraftCourses(nextDrafts);
    setCourseName('');
    setClassroom('');

    const nextFree = findFirstAvailableSlot(days, nextDrafts, 60);
    if (nextFree) {
      setStartTime(nextFree.startTime);
      setEndTime(nextFree.endTime);
    } else {
      setStartTime('');
      setEndTime('');
    }
  };

  const handleEditDraft = (c: Course) => {
    setEditingDraftId(c.courseId);
    setCourseName(c.courseName);
    setClassroom(c.classroom);
    setDays(c.days.length > 0 ? [...c.days] : ['Sun', 'Tue', 'Thu']);
    setStartTime(normalizeTimeHHMM(c.startTime));
    setEndTime(normalizeTimeHHMM(c.endTime));
  };

  const handleCancelEditDraft = () => {
    setEditingDraftId(null);
    setCourseName('');
    setClassroom('');
    const nextFree = findFirstAvailableSlot(days, draftCourses, 60);
    if (nextFree) {
      setStartTime(nextFree.startTime);
      setEndTime(nextFree.endTime);
    }
  };

  const handleRemoveDraft = (courseId: string) => {
    const nextDrafts = draftCourses.filter((x) => x.courseId !== courseId);
    setDraftCourses(nextDrafts);
    if (editingDraftId === courseId) {
      setEditingDraftId(null);
      setCourseName('');
      setClassroom('');
    }
    if (!startTime || !endTime) {
      const firstFree = findFirstAvailableSlot(days, nextDrafts, 60);
      if (firstFree) {
        setStartTime(firstFree.startTime);
        setEndTime(firstFree.endTime);
      }
    }
  };

  const handleFinish = async () => {
    if (isSaving || draftCourses.length === 0) return;
    setIsSaving(true);
    try {
      await completeOnboarding(draftCourses);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir="ltr" className="min-h-screen bg-[#080B14] text-[#F5F7FF] p-4 sm:p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#1A2438] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Final Onboarding Step</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Welcome {student.fullName} — Upload Your Semester Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Enter your enrolled course names, classroom numbers (e.g., 7106, 1B12), and lecture times to unlock smart campus walking alerts and AI external course suggestions.
            </p>
          </div>

          <button
            onClick={logoutStudent}
            className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column (Course Name, Classroom, Time Only) */}
          <form
            onSubmit={handleSaveDraft}
            className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{editingDraftId ? 'Edit Semester Course' : 'Add Semester Course'}</span>
              </h2>
              {editingDraftId && (
                <button
                  type="button"
                  onClick={handleCancelEditDraft}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Course Name *</label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Distributed Systems"
                className="w-full h-11 px-3.5 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Classroom / Hall *</label>
              <input
                type="text"
                required
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="7106 / 1B12 / 14203"
                className="w-full h-11 px-3.5 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Live ASU Room Decoder Preview */}
            {classroom.trim().length >= 3 && (
              <div
                className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                  decodedPreview.isValid
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">ASU Room Decoder:</div>
                  <div>{decodedPreview.summaryEn}</div>
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Lecture Days</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_LIST.map((d) => {
                  const active = days.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#080B14] text-slate-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {blockedIntervals.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Booked times locked on selected days:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {blockedIntervals.map((b, idx) => (
                    <span
                      key={`${b.courseName}-${b.startTime}-${idx}`}
                      className="px-2 py-0.5 rounded-md bg-black/40 border border-amber-500/20 text-[10px] text-amber-200 font-mono"
                    >
                      {formatTime12h(b.startTime)}–{formatTime12h(b.endTime)} · {b.courseName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                  disabled={!hasAvailableStartSlot}
                  className="w-full h-11 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                >
                  {!hasAvailableStartSlot && <option value="">No free slots</option>}
                  {startTimeSlots.map((slot) => (
                    <option
                      key={slot.value}
                      value={slot.value}
                      disabled={slot.disabled}
                      className={slot.disabled ? 'text-slate-500 bg-[#080B14]' : 'text-white bg-[#080B14]'}
                    >
                      {slot.disabled ? `${slot.label} (Taken · ${slot.blockedBy})` : slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  disabled={!hasAvailableEndSlot}
                  className="w-full h-11 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                >
                  {!hasAvailableEndSlot && <option value="">No free slots</option>}
                  {endTimeSlots.map((slot) => (
                    <option
                      key={slot.value}
                      value={slot.value}
                      disabled={slot.disabled}
                      className={slot.disabled ? 'text-slate-500 bg-[#080B14]' : 'text-white bg-[#080B14]'}
                    >
                      {slot.disabled ? `${slot.label} (Blocked · ${slot.blockedBy})` : slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isSaving && liveTimeError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{liveTimeError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving || Boolean(liveTimeError)}
              className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{editingDraftId ? 'Save Course Changes' : 'Add Course to List'}</span>
            </button>
          </form>

          {/* Draft Schedule List Column */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#141C2D] border border-white/10 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">
                  Added Courses ({draftCourses.length})
                </h2>
              </div>

              {draftCourses.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-[#080B14]/60 border border-dashed border-white/10 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Add your semester courses using the form to save your schedule and generate AI course recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {draftCourses.map((c) => {
                    const dec = decodeAsuClassroom(c.classroom);
                    return (
                      <div
                        key={c.courseId}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs ${
                          editingDraftId === c.courseId
                            ? 'bg-cyan-950/30 border-cyan-400/50'
                            : 'bg-[#080B14]/80 border-white/10'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-white truncate">{c.courseName}</div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>
                              {c.days.join('/')} · {formatTime12h(c.startTime)} - {formatTime12h(c.endTime)}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>
                              {c.classroom} — {dec.summaryEn}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleEditDraft(c)}
                            aria-label="Edit draft course"
                            className="p-2 rounded-lg hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleRemoveDraft(c.courseId)}
                            aria-label="Remove draft course"
                            className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={draftCourses.length === 0 || isSaving}
              onClick={handleFinish}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Schedule...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Schedule & Enter CampusX</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
