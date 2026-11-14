'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Course } from '@/types/campusx';
import { decodeAsuClassroom } from '@/lib/asu-campus';
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
} from 'lucide-react';

const DAYS_LIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

export function ScheduleOnboardingView() {
  const { student, completeOnboarding, logoutStudent } = useStore();

  const [draftCourses, setDraftCourses] = useState<Course[]>([]);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [classroom, setClassroom] = useState('');
  const [days, setDays] = useState<string[]>(['Sun', 'Tue', 'Thu']);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [creditHours, setCreditHours] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  const decodedPreview = decodeAsuClassroom(classroom);

  const toggleDay = (dayId: string) => {
    setDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleAddDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !courseName.trim() || !classroom.trim()) return;

    const decoded = decodeAsuClassroom(classroom);
    const newCourse: Course = {
      courseId: `crs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      courseCode: courseCode.trim().toUpperCase() || `ASU${draftCourses.length + 101}`,
      courseName: courseName.trim(),
      creditHours,
      instructorName: instructorName.trim() || 'Faculty Instructor',
      instructorEmail: '',
      classroom: classroom.trim(),
      building: decoded.isValid ? decoded.buildingNameEn : 'ASU Campus',
      days: days.length > 0 ? days : ['Sun', 'Tue', 'Thu'],
      startTime,
      endTime,
      color: '#35C8FF',
      syllabus: '',
    };

    setDraftCourses((prev) => [...prev, newCourse]);
    setCourseCode('');
    setCourseName('');
    setInstructorName('');
    setClassroom('');
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
              Enter your enrolled courses, lecture times, and ASU classroom numbers (e.g., 7106, 1B12) to unlock smart campus walking alerts and AI external course suggestions.
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
          {/* Form Column */}
          <form
            onSubmit={handleAddDraft}
            className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-4 text-xs"
          >
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Add Semester Course</span>
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Code</label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="CS412"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white uppercase font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  placeholder="7106 / 1B12 / 14203"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Credits</label>
                <select
                  value={creditHours}
                  onChange={(e) => setCreditHours(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  {[1, 2, 3, 4, 6].map((h) => (
                    <option key={h} value={h} className="bg-[#101525]">
                      {h} Credits
                    </option>
                  ))}
                </select>
              </div>
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

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Instructor (Optional)
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="Dr. Instructor"
                className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course to List</span>
            </button>
          </form>

          {/* Draft Schedule List Column */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-[#141C2D] border border-white/10 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">
                  Added Courses ({draftCourses.length})
                </h2>
                <span className="text-xs text-cyan-400 font-mono">
                  {draftCourses.reduce((s, c) => s + c.creditHours, 0)} Cr
                </span>
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
                        className="p-3.5 rounded-2xl bg-[#080B14]/80 border border-white/10 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400">{c.courseCode}</span>
                            <span className="font-bold text-white truncate">{c.courseName}</span>
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>
                              {c.days.join('/')} · {c.startTime} - {c.endTime}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>
                              {c.classroom} — {dec.summaryEn}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            setDraftCourses((prev) => prev.filter((x) => x.courseId !== c.courseId))
                          }
                          className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
