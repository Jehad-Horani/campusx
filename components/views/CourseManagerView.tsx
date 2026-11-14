'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Course } from '@/types/campusx';
import { ASU_BUILDINGS, decodeAsuClassroom } from '@/lib/asu-campus';
import {
  BookOpen,
  Plus,
  Trash2,
  MapPin,
  Clock,
  User,
  X,
  Loader2,
} from 'lucide-react';

const DAYS_OPTIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

export function CourseManagerView() {
  const { courses, addCourse, deleteCourse, t } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [instructor, setInstructor] = useState('');
  const [classroom, setClassroom] = useState('1104');
  const [days, setDays] = useState<string[]>(['Sun', 'Tue', 'Thu']);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [syllabus, setSyllabus] = useState('');

  const decodedPreview = decodeAsuClassroom(classroom);

  const toggleDay = (dayId: string) => {
    setDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !name.trim()) return;

    const dec = decodeAsuClassroom(classroom);
    const newCourse: Course = {
      courseId: `crs_${Date.now()}`,
      courseCode: code.trim().toUpperCase() || 'ASU101',
      courseName: name.trim(),
      creditHours: Number(credits),
      instructorName: instructor.trim() || 'Faculty Instructor',
      instructorEmail: '',
      building: dec.isValid ? dec.buildingNameEn : ASU_BUILDINGS[0].nameEn,
      classroom: classroom.trim() || '1104',
      days: days.length > 0 ? days : ['Sun', 'Tue', 'Thu'],
      startTime,
      endTime,
      color: '#35C8FF',
      syllabus: syllabus.trim(),
    };

    setIsSubmitting(true);
    try {
      await addCourse(newCourse);
      setShowAddModal(false);
      setCode('');
      setName('');
      setInstructor('');
      setSyllabus('');
    } finally {
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

  const totalCreditsEnrolled = courses.reduce((sum: number, c: Course) => sum + c.creditHours, 0);

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
            Total Enrolled: {totalCreditsEnrolled} Credits across {courses.length} courses
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
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
            onClick={() => setShowAddModal(true)}
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
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      {course.courseCode}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {course.creditHours} Cr
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{course.courseName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{course.instructorName}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {course.days.join(', ')} · {course.startTime} - {course.endTime}
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

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
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

      {/* ADD COURSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101525] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Course to Schedule</h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="CS412"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white uppercase focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Credit Hours</label>
                  <select
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {[1, 2, 3, 4, 6].map((num) => (
                      <option key={num} value={num} className="bg-[#101525]">
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="Distributed Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Classroom Code</label>
                  <input
                    type="text"
                    placeholder="7106 / 1B12 / 14203"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Instructor</label>
                  <input
                    type="text"
                    placeholder="Dr. Name"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {classroom.trim().length >= 3 && (
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-200">
                  {decodedPreview.summaryEn}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OPTIONS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer ${
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Course</span>
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
