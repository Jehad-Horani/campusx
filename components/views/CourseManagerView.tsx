'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Course } from '@/types/campusx';
import {
  ASU_BUILDINGS,
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
  BookOpen,
  Plus,
  Trash2,
  MapPin,
  Clock,
  User,
  X,
  Loader2,
  AlertTriangle,
  Lock,
  Pencil,
} from 'lucide-react';

const DAYS_OPTIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

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

export function CourseManagerView() {
  const { courses, addCourse, updateCourse, deleteCourse, t } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [classroom, setClassroom] = useState('1104');
  const [days, setDays] = useState<string[]>(['Sun', 'Tue', 'Thu']);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');

  const decodedPreview = decodeAsuClassroom(classroom);

  const comparisonCourses = useMemo(() => {
    const excludeId = editingCourseId || submittingCourseId;
    return excludeId ? courses.filter((c) => c.courseId !== excludeId) : courses;
  }, [courses, editingCourseId, submittingCourseId]);

  const blockedIntervals = useMemo(
    () => getBlockedIntervalsForDays(days, comparisonCourses),
    [days, comparisonCourses]
  );

  const startTimeSlots = useMemo(() => {
    const base = getStartTimeSlots(days, comparisonCourses);
    const normStart = normalizeTimeHHMM(startTime);
    const startMins = parseTimeToMinutes(normStart);
    if (
      startMins >= 0 &&
      normStart &&
      !base.some((s) => s.value === normStart) &&
      !blockedIntervals.some((b) => startMins >= b.start && startMins < b.end)
    ) {
      return [
        ...base,
        {
          value: normStart,
          label: formatTime12h(normStart),
          minutes: startMins,
          disabled: false,
        },
      ].sort((a, b) => a.minutes - b.minutes);
    }
    return base;
  }, [days, comparisonCourses, startTime, blockedIntervals]);

  const endTimeSlots = useMemo(() => {
    const base = getEndTimeSlots(startTime, days, comparisonCourses);
    const normStart = normalizeTimeHHMM(startTime);
    const normEnd = normalizeTimeHHMM(endTime);
    const startMins = parseTimeToMinutes(normStart);
    const endMins = parseTimeToMinutes(normEnd);
    if (
      startMins >= 0 &&
      endMins > startMins &&
      normEnd &&
      !base.some((s) => s.value === normEnd) &&
      !findCourseTimeConflict({ days, startTime: normStart, endTime: normEnd }, comparisonCourses)
    ) {
      return [
        ...base,
        {
          value: normEnd,
          label: formatTime12h(normEnd),
          minutes: endMins,
          disabled: false,
        },
      ].sort((a, b) => a.minutes - b.minutes);
    }
    return base;
  }, [startTime, days, comparisonCourses, endTime]);

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

  const openAddModal = () => {
    setFormError(null);
    setEditingCourseId(null);
    setName('');
    setClassroom('1104');
    const defaultDays = ['Sun', 'Tue', 'Thu'];
    setDays(defaultDays);
    snapTimesForDays(defaultDays, courses, '10:00', '11:00');
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setFormError(null);
    setEditingCourseId(course.courseId);
    setName(course.courseName);
    setClassroom(course.classroom);
    setDays(course.days.length > 0 ? [...course.days] : ['Sun', 'Tue', 'Thu']);
    setStartTime(normalizeTimeHHMM(course.startTime) || '10:00');
    setEndTime(normalizeTimeHHMM(course.endTime) || '11:00');
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setEditingCourseId(null);
    setFormError(null);
  };

  const toggleDay = (dayId: string) => {
    setFormError(null);
    const nextDays = days.includes(dayId)
      ? days.filter((d) => d !== dayId)
      : [...days, dayId];
    setDays(nextDays);
    snapTimesForDays(nextDays, comparisonCourses, startTime, endTime);
  };

  const handleStartTimeChange = (nextStart: string) => {
    setFormError(null);
    setStartTime(nextStart);
    const nextEnd = pickBestEndTime(nextStart, endTime, days, comparisonCourses);
    setEndTime(nextEnd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !name.trim() || !classroom.trim()) return;

    if (liveTimeError) {
      setFormError(liveTimeError);
      return;
    }

    const dec = decodeAsuClassroom(classroom);
    const normStart = normalizeTimeHHMM(startTime);
    const normEnd = normalizeTimeHHMM(endTime);

    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingCourseId) {
        setSubmittingCourseId(editingCourseId);
        const existing = courses.find((c) => c.courseId === editingCourseId);
        const updatedCourse: Course = {
          courseId: editingCourseId,
          courseCode: existing?.courseCode || '',
          courseName: name.trim(),
          creditHours: existing?.creditHours || 3,
          instructorName: existing?.instructorName || '',
          instructorEmail: existing?.instructorEmail || '',
          building: dec.isValid ? dec.buildingNameEn : ASU_BUILDINGS[0].nameEn,
          classroom: classroom.trim(),
          days,
          startTime: normStart,
          endTime: normEnd,
          color: existing?.color || '#35C8FF',
          syllabus: existing?.syllabus || '',
        };
        const res = await updateCourse(editingCourseId, updatedCourse);
        if (!res.ok) {
          setFormError(res.error || 'Could not update course due to schedule conflict.');
          return;
        }
      } else {
        const newCourseId = `crs_${Date.now()}`;
        setSubmittingCourseId(newCourseId);
        const newCourse: Course = {
          courseId: newCourseId,
          courseCode: '',
          courseName: name.trim(),
          creditHours: 3,
          instructorName: '',
          instructorEmail: '',
          building: dec.isValid ? dec.buildingNameEn : ASU_BUILDINGS[0].nameEn,
          classroom: classroom.trim(),
          days,
          startTime: normStart,
          endTime: normEnd,
          color: '#35C8FF',
          syllabus: '',
        };
        const res = await addCourse(newCourse);
        if (!res.ok) {
          setFormError(res.error || 'Could not add course due to schedule conflict.');
          return;
        }
      }
      setShowModal(false);
      setEditingCourseId(null);
      setName('');
      setClassroom('1104');
      setFormError(null);
    } finally {
      setSubmittingCourseId(null);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (deletingCourseId === courseId) return;
    setDeletingCourseId(courseId);
    try {
      await deleteCourse(courseId);
    } finally {
      setDeletingCourseId(null);
    }
  };

  const activeError = isSubmitting ? null : (formError || liveTimeError);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Enrolled Semester Courses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.nav.courses}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} added to your semester schedule
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#141C2D] border border-white/10 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Enrolled Courses</h3>
          <button
            onClick={openAddModal}
            className="px-5 h-10 rounded-xl bg-cyan-500 text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Course</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: Course) => {
            const dec = decodeAsuClassroom(course.classroom);
            const isDeleting = deletingCourseId === course.courseId;
            return (
              <div
                key={course.courseId}
                className="p-5 rounded-3xl bg-[#141C2D] border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-white leading-snug">{course.courseName}</h3>
                      {course.courseCode && (
                        <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/20 shrink-0">
                          {course.courseCode}
                        </span>
                      )}
                    </div>
                    {course.instructorName && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{course.instructorName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {course.days.join(', ')} · {formatTime12h(course.startTime)} - {formatTime12h(course.endTime)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080B14] border border-white/5 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Room {course.classroom}</div>
                        <div className="text-[11px] text-emerald-300 mt-0.5">{dec.summaryEn}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(course)}
                    disabled={isDeleting}
                    className="h-9 px-3 rounded-xl hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(course.courseId)}
                    disabled={isDeleting}
                    className="h-9 px-3 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isDeleting ? 'Removing...' : 'Remove'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT COURSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101525] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingCourseId ? 'Edit Course' : 'Add Course'}
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Course Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Classroom / Hall *</label>
                <input
                  type="text"
                  placeholder="7106 / 1B12 / 14203"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {classroom.trim().length >= 3 && (
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-200">
                  {decodedPreview.summaryEn}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Lecture Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OPTIONS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      disabled={isSubmitting}
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer disabled:opacity-60 ${
                        days.includes(d)
                          ? 'bg-cyan-500 text-black'
                          : 'bg-[#080B14] text-slate-400 border border-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
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
                    disabled={!hasAvailableStartSlot || isSubmitting}
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
                    onChange={(e) => {
                      setFormError(null);
                      setEndTime(e.target.value);
                    }}
                    required
                    disabled={!hasAvailableEndSlot || isSubmitting}
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

              {activeError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{activeError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 font-semibold cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(liveTimeError)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCourseId ? 'Save Changes' : 'Add Course'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
