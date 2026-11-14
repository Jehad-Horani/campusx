'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ScheduleItem, ScheduleItemType } from '@/types/campusx';
import { decodeAsuClassroom, formatTime12h, parseTimeToMinutes } from '@/lib/asu-campus';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  BookOpen,
  AlertCircle,
  FileText,
  X,
  Loader2,
} from 'lucide-react';

export function ScheduleView() {
  const { schedule, addScheduleItem, deleteScheduleItem, t } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | ScheduleItemType>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ScheduleItemType>('quiz');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('1104');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDate((prev) => prev || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const decodedLoc = decodeAsuClassroom(location);

  const filteredSchedule = schedule.filter((item: ScheduleItem) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;
    if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
      return;
    }

    const effectiveDate = date || new Date().toISOString().split('T')[0];
    const dueIso =
      type !== 'class' && effectiveDate
        ? new Date(`${effectiveDate}T${startTime}:00`).toISOString()
        : undefined;
    const dec = decodeAsuClassroom(location);

    const newItem: ScheduleItem = {
      scheduleId: `sch_${Date.now()}`,
      courseId: 'custom',
      title: title.trim(),
      type,
      date: type !== 'class' ? effectiveDate : undefined,
      dueDateTime: dueIso,
      startTime,
      endTime,
      location: location.trim() || 'ASU',
      building: dec.isValid ? dec.buildingNameEn : 'ASU Campus',
      dayOfWeek: type === 'class' ? 'Sun/Tue/Thu' : undefined,
      description,
      status: 'upcoming',
    };

    setIsSubmitting(true);
    try {
      await addScheduleItem(newItem);
      setShowAddModal(false);
      setTitle('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId === id) return;
    setDeletingId(id);
    try {
      await deleteScheduleItem(id);
    } finally {
      setDeletingId(null);
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable & Auto-Expiring Tasks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.nav.schedule}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Add quizzes, assignments, and exams — 48h & 2h reminders are sent and past-due items auto-delete.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141C2D] border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'day' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All' },
          { id: 'class', label: 'Lectures' },
          { id: 'quiz', label: 'Quizzes' },
          { id: 'assignment', label: 'Assignments' },
          { id: 'exam', label: 'Exams' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as 'all' | ScheduleItemType)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeFilter === f.id
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-[#141C2D] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {viewMode === 'day' ? (
        <div className="space-y-3">
          {filteredSchedule.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#141C2D] border border-white/10 text-center space-y-3">
              <Calendar className="w-10 h-10 text-cyan-400 mx-auto" />
              <p className="text-xs text-slate-400">No schedule items match this filter.</p>
            </div>
          ) : (
            filteredSchedule.map((item: ScheduleItem) => {
              const dec = decodeAsuClassroom(item.location);
              const isDeleting = deletingId === item.scheduleId;
              return (
                <div
                  key={item.scheduleId}
                  className="p-4 sm:p-5 rounded-3xl bg-[#141C2D] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 ${
                        item.type === 'class'
                          ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                          : item.type === 'exam'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          : item.type === 'quiz'
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.type === 'class' && <BookOpen className="w-5 h-5" />}
                      {item.type === 'exam' && <AlertCircle className="w-5 h-5" />}
                      {item.type === 'quiz' && <Clock className="w-5 h-5" />}
                      {item.type === 'assignment' && <FileText className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {item.date || item.dayOfWeek}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-cyan-400 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime12h(item.startTime)} - {formatTime12h(item.endTime)}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {item.location} {dec.isValid ? `· ${dec.summaryEn}` : ''}
                        </span>
                      </div>
                      {item.description && <p className="text-xs text-slate-400 pt-1">{item.description}</p>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.scheduleId)}
                    disabled={isDeleting}
                    className="self-end sm:self-center p-2.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer shrink-0 disabled:opacity-50"
                    aria-label="Delete schedule item"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {daysOfWeek.map((day) => {
            const dayItems = schedule.filter((s) => s.dayOfWeek?.includes(day));
            return (
              <div key={day} className="p-4 rounded-3xl bg-[#141C2D] border border-white/10 space-y-2.5 min-h-[240px]">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-sm text-white">{day}</span>
                  <span className="text-xs text-slate-400 font-mono">{dayItems.length}</span>
                </div>
                {dayItems.map((item) => (
                  <div key={item.scheduleId} className="p-2.5 rounded-xl bg-[#080B14]/70 border border-white/5 text-xs space-y-1">
                    <div className="font-bold text-white truncate">{item.title}</div>
                    <div className="text-[11px] text-cyan-400 font-mono">
                      {formatTime12h(item.startTime)} · {item.location}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101525] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Quiz, Assignment, or Exam</h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Data Structures Quiz"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ScheduleItemType)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Exact Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
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
                <label className="font-semibold text-slate-300 block mb-1">Classroom / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="7106 / 1B12 / Online"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                {decodedLoc.isValid && (
                  <div className="text-[11px] text-emerald-300 mt-1">{decodedLoc.summaryEn}</div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
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
                  disabled={isSubmitting || parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Item</span>
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
