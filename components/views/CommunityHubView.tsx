'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { CommunityEvent } from '@/types/campusx';
import {
  Users,
  Calendar,
  MapPin,
  PlusCircle,
  Search,
  Phone,
  Clock,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';

export function CommunityHubView() {
  const { student, events, submitEventProposal, t } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showProposeModal, setShowProposeModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proposal form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('11:00');
  const [newEndTime, setNewEndTime] = useState('14:00');
  const [newLoc, setNewLoc] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newContactInfo, setNewContactInfo] = useState('');
  const [newCat, setNewCat] = useState<'Environment' | 'Health' | 'Education' | 'Charity' | 'Campus Life'>('Campus Life');

  useEffect(() => {
    const timer = setTimeout(() => {
      setNewDate((prev) => prev || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['All', 'Education', 'Environment', 'Health', 'Charity', 'Campus Life'];

  const approvedEvents = events.filter((e: CommunityEvent) => {
    if (e.status !== 'approved') return false;
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myPendingEvents = events.filter(
    (e: CommunityEvent) =>
      e.status === 'pending' && e.submittedByStudentId === student.studentId
  );

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !newTitle.trim() || !newContactInfo.trim()) return;

    setIsSubmitting(true);
    try {
      await submitEventProposal({
        title: newTitle.trim(),
        description: newDesc.trim(),
        eventDate: newDate || new Date().toISOString().split('T')[0],
        startTime: newStartTime,
        endTime: newEndTime,
        location: newLoc.trim() || 'ASU Campus',
        organizer: newOrganizer.trim() || student.fullName,
        contactInfo: newContactInfo.trim(),
        category: newCat,
      });

      setShowProposeModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewLoc('');
      setNewOrganizer('');
      setNewContactInfo('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#0D2838] border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Users className="w-4 h-4" />
            <span>ASU Student Activities & Events</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.community.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.community.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowProposeModal(true)}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.community.proposeEvent}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-[#141C2D] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat === 'All' ? t.community.allCategories : cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full h-9 rounded-xl bg-[#141C2D] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-9 pr-3"
          />
        </div>
      </div>

      {/* My Pending Proposals */}
      {myPendingEvents.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Your Events Pending Admin Approval:</span>
          </div>
          {myPendingEvents.map((evt) => (
            <div key={evt.eventId} className="text-slate-200 flex items-center justify-between bg-black/20 p-2 rounded-xl">
              <span className="font-semibold">{evt.title}</span>
              <span className="text-[11px] text-amber-300">{evt.eventDate}</span>
            </div>
          ))}
        </div>
      )}

      {/* Approved Public Events Grid */}
      {approvedEvents.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#141C2D] border border-white/10 text-center space-y-3">
          <Users className="w-10 h-10 text-cyan-400 mx-auto" />
          <p className="text-xs text-slate-400">No published events match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedEvents.map((evt) => (
            <div
              key={evt.eventId}
              className="p-5 rounded-3xl bg-[#141C2D] border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    {evt.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{evt.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {evt.eventDate} ({evt.startTime} - {evt.endTime})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{evt.organizer}</span>
                  </div>
                </div>
              </div>

              {/* Organizer Contact Info Box */}
              <div className="p-3 rounded-2xl bg-[#080B14] border border-cyan-500/20 space-y-1 text-xs">
                <div className="text-[10px] font-bold text-cyan-400 uppercase">
                  Contact Organizer to Participate:
                </div>
                <div className="flex items-center gap-1.5 text-white font-semibold break-all">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{evt.contactInfo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT EVENT MODAL */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101525] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{t.community.proposeEvent}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submitted events go to Admin for review before appearing publicly with your contact info.
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowProposeModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Competitive Programming Workshop"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the event details..."
                  className="w-full p-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Start</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">End</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    placeholder="Bldg 10 Auditorium"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as CommunityEvent['category'])}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Campus Life">Campus Life</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Health">Health</option>
                    <option value="Charity">Charity</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Organizer</label>
                  <input
                    type="text"
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    placeholder="Club or Student Name"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Organizer Contact Info *</label>
                  <input
                    type="text"
                    required
                    value={newContactInfo}
                    onChange={(e) => setNewContactInfo(e.target.value)}
                    placeholder="WhatsApp 079... or Email"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowProposeModal(false)}
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
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit to Admin</span>
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
