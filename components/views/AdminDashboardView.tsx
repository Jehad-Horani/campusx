'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Student, CommunityEvent, Announcement, CampusIncident, IncidentStatus } from '@/types/campusx';
import { ASU_BUILDINGS } from '@/lib/asu-campus';
import {
  ShieldCheck,
  Users,
  Calendar,
  Megaphone,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  Edit2,
  LogOut,
  Lock,
  UserPlus,
  Camera,
  Loader2,
  ArrowLeft,
  Database,
} from 'lucide-react';

export function AdminDashboardView() {
  const {
    isAdminAuthenticated,
    currentAdmin,
    loginAdmin,
    logoutAdmin,
    studentsDirectory,
    adminUpdateStudent,
    adminDeleteStudent,
    adminAccounts,
    createAdminAccount,
    deleteAdminAccount,
    events,
    approveEvent,
    rejectEvent,
    deleteEvent,
    campusIncidents,
    updateIncidentStatus,
    deleteCampusIncident,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    supabaseConnected,
  } = useStore();

  // Admin Login Form
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Tabs
  const [activeTab, setActiveTab] = useState<'users' | 'admins' | 'events' | 'reports' | 'announcements'>('users');

  // Users Search & Edit Modal
  const [userSearch, setUserSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUniversityId, setEditUniversityId] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editFaculty, setEditFaculty] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editYear, setEditYear] = useState(1);
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  // Create New Admin Form
  const [newAdmUsername, setNewAdmUsername] = useState('');
  const [newAdmPassword, setNewAdmPassword] = useState('');
  const [newAdmFullName, setNewAdmFullName] = useState('');
  const [newAdmDept, setNewAdmDept] = useState('');
  const [adminCreateError, setAdminCreateError] = useState<string | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Announcement Form
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancCategory, setAncCategory] = useState<'Academic' | 'Registration' | 'Campus' | 'Important'>('Academic');
  const [isPublishingAnc, setIsPublishingAnc] = useState(false);

  // Generic busy guard for row action buttons
  const [busyActionId, setBusyActionId] = useState<string | null>(null);

  const runRowAction = async (key: string, fn: () => Promise<void>) => {
    if (busyActionId) return;
    setBusyActionId(key);
    try {
      await fn();
    } finally {
      setBusyActionId(null);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(loginUser, loginPass);
      if (!res.ok) {
        setLoginError(res.error || 'Invalid username or password');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openEditStudent = (s: Student) => {
    setEditingStudent(s);
    setEditFullName(s.fullName);
    setEditUniversityId(s.universityId);
    setEditEmail(s.email);
    setEditPhone(s.phoneNumber);
    setEditFaculty(s.faculty);
    setEditMajor(s.major);
    setEditYear(s.academicYear);
    setEditStatus(s.status || 'active');
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || isSavingStudent) return;
    setIsSavingStudent(true);
    try {
      await adminUpdateStudent(editingStudent.studentId, {
        fullName: editFullName,
        universityId: editUniversityId,
        email: editEmail,
        phoneNumber: editPhone,
        faculty: editFaculty,
        major: editMajor,
        academicYear: Number(editYear),
        status: editStatus,
      });
      setEditingStudent(null);
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingAdmin) return;
    setAdminCreateError(null);
    setIsCreatingAdmin(true);
    try {
      const res = await createAdminAccount({
        username: newAdmUsername,
        password: newAdmPassword,
        fullName: newAdmFullName,
        department: newAdmDept,
      });
      if (!res.ok) {
        setAdminCreateError(res.error || 'Could not create admin account');
      } else {
        setNewAdmUsername('');
        setNewAdmPassword('');
        setNewAdmFullName('');
        setNewAdmDept('');
      }
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublishingAnc || !ancTitle.trim()) return;
    setIsPublishingAnc(true);
    try {
      await addAnnouncement({
        title: ancTitle.trim(),
        content: ancContent.trim(),
        category: ancCategory,
        author: currentAdmin?.fullName || 'Campus Administration',
      });
      setAncTitle('');
      setAncContent('');
    } finally {
      setIsPublishingAnc(false);
    }
  };

  // --- DEDICATED ISOLATED ADMIN LOGIN GATE ---
  if (!isAdminAuthenticated || !currentAdmin) {
    return (
      <div
        dir="ltr"
        className="min-h-screen bg-[#080B14] text-[#F5F7FF] flex flex-col justify-between p-4 sm:p-6"
      >
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to Student Portal</span>
          </Link>
        </header>

        <main className="w-full max-w-md mx-auto my-8">
          <div className="rounded-3xl bg-[#101525] border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Admin Console Sign In
              </h1>
              <p className="text-xs text-slate-400">
                Isolated portal for managing students, admin accounts, community events, and problem reports.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="admin"
                  className="w-full h-11 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 left-3" />
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-purple-500 pl-10 pr-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Enter Admin Panel</span>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center text-[11px] text-slate-500 py-2">
          CampusX Administrative Security Gate · ASU
        </footer>
      </div>
    );
  }

  // --- AUTHENTICATED ADMIN CONSOLE ---
  const filteredStudents = studentsDirectory.filter(
    (s) =>
      !userSearch ||
      s.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.universityId.includes(userSearch) ||
      s.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.major.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingEvents = events.filter((e) => e.status === 'pending');

  return (
    <div dir="ltr" className="min-h-screen bg-[#080B14] text-[#F5F7FF] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Admin Header */}
        <header className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#1A1636] border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Image
                src="/assets/aistudio/LOGO_bc48159f.png"
                alt="CampusX"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <ShieldCheck className="w-4 h-4" />
                <span>CampusX Admin Console</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {currentAdmin.fullName} (@{currentAdmin.username})
              </h1>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{currentAdmin.department}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-cyan-300">
                  <Database className="w-3 h-3" />
                  {supabaseConnected ? 'Supabase Synced' : 'Local Storage'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center"
            >
              Student View
            </Link>
            <button
              onClick={logoutAdmin}
              className="h-10 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141C2D] border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold">Students</div>
            <div className="text-2xl font-black text-white font-mono mt-1 tabular-nums">
              {studentsDirectory.length}
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141C2D] border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold">Admins</div>
            <div className="text-2xl font-black text-purple-400 font-mono mt-1 tabular-nums">
              {adminAccounts.length}
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141C2D] border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold">Pending Events</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1 tabular-nums">
              {pendingEvents.length}
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141C2D] border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold">Problem Reports</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1 tabular-nums">
              {campusIncidents.length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
          {[
            { id: 'users', label: `Users (${studentsDirectory.length})`, icon: Users },
            { id: 'admins', label: `Admins (${adminAccounts.length})`, icon: ShieldCheck },
            { id: 'events', label: `Events (${pendingEvents.length})`, icon: Calendar },
            { id: 'reports', label: `Reports (${campusIncidents.length})`, icon: Camera },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-[#080B14]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white">Registered Students Management</h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute top-3 left-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full h-10 rounded-xl bg-[#141C2D] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 pl-10 pr-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredStudents.map((s) => {
                const delKey = `del_std_${s.studentId}`;
                const isBusy = busyActionId === delKey;
                return (
                  <div
                    key={s.studentId}
                    className="p-4 rounded-2xl bg-[#141C2D] border border-white/10 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate">{s.fullName}</span>
                          <span className="font-mono text-[11px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {s.universityId}
                          </span>
                        </div>
                        <div className="text-slate-300">
                          {s.faculty} · {s.major}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {s.email} · {s.phoneNumber}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          s.status === 'suspended'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {s.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditStudent(s)}
                        disabled={Boolean(busyActionId)}
                        className="h-9 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => runRowAction(delKey, () => adminDeleteStudent(s.studentId))}
                        disabled={Boolean(busyActionId)}
                        className="h-9 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>{isBusy ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN ACCOUNTS MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#141C2D] border border-purple-500/30 space-y-4 text-xs">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>Create New Admin Account</span>
              </h2>
              {adminCreateError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200">
                  {adminCreateError}
                </div>
              )}
              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={newAdmUsername}
                    onChange={(e) => setNewAdmUsername(e.target.value)}
                    placeholder="admin2"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={newAdmPassword}
                    onChange={(e) => setNewAdmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newAdmFullName}
                    onChange={(e) => setNewAdmFullName(e.target.value)}
                    placeholder="Admin Name"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newAdmDept}
                    onChange={(e) => setNewAdmDept(e.target.value)}
                    placeholder="Student Affairs"
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreatingAdmin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Admin...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Admin Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <h2 className="text-base font-bold text-white">Active Admin Accounts</h2>
              {adminAccounts.map((acc) => {
                const delKey = `del_adm_${acc.id}`;
                const isBusy = busyActionId === delKey;
                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl bg-[#141C2D] border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{acc.fullName}</span>
                        <span className="font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded">
                          @{acc.username}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        {acc.department} · {acc.createdAt}
                      </div>
                    </div>
                    <button
                      onClick={() => runRowAction(delKey, () => deleteAdminAccount(acc.id))}
                      disabled={adminAccounts.length <= 1 || Boolean(busyActionId)}
                      className="h-9 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-30 text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isBusy ? 'Removing...' : 'Remove'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: COMMUNITY EVENTS MODERATION */}
        {activeTab === 'events' && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">
              Community Events Review & Publishing
            </h2>
            {events.map((evt: CommunityEvent) => {
              const appKey = `app_evt_${evt.eventId}`;
              const rejKey = `rej_evt_${evt.eventId}`;
              const delKey = `del_evt_${evt.eventId}`;
              return (
                <div
                  key={evt.eventId}
                  className="p-5 rounded-3xl bg-[#141C2D] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{evt.title}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          evt.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : evt.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {evt.status === 'approved'
                          ? 'Published'
                          : evt.status === 'pending'
                          ? 'Pending'
                          : 'Rejected'}
                      </span>
                    </div>
                    <p className="text-slate-300">{evt.description}</p>
                    <div className="text-slate-400">
                      {evt.eventDate} ({evt.startTime} - {evt.endTime}) · {evt.location} · {evt.organizer}
                    </div>
                    <div className="text-cyan-300 font-semibold">Contact: {evt.contactInfo}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {evt.status !== 'approved' && (
                      <button
                        onClick={() => runRowAction(appKey, () => approveEvent(evt.eventId))}
                        disabled={Boolean(busyActionId)}
                        className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {busyActionId === appKey ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>{busyActionId === appKey ? 'Publishing...' : 'Publish'}</span>
                      </button>
                    )}
                    {evt.status === 'pending' && (
                      <button
                        onClick={() => runRowAction(rejKey, () => rejectEvent(evt.eventId))}
                        disabled={Boolean(busyActionId)}
                        className="h-10 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {busyActionId === rejKey ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                    )}
                    <button
                      onClick={() => runRowAction(delKey, () => deleteEvent(evt.eventId))}
                      disabled={Boolean(busyActionId)}
                      className="h-10 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {busyActionId === delKey ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: PROBLEM REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Student Problem Reports</h2>
            {campusIncidents.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#141C2D] border border-white/10 text-center text-xs text-slate-400">
                No problem reports at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campusIncidents.map((inc: CampusIncident) => {
                  const delKey = `del_inc_${inc.incidentId}`;
                  const statusKey = `sts_inc_${inc.incidentId}`;
                  const isBusyDel = busyActionId === delKey;
                  return (
                    <div
                      key={inc.incidentId}
                      className="p-5 rounded-3xl bg-[#141C2D] border border-white/10 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] text-cyan-400 font-bold">
                            #{inc.incidentId} · {inc.priority}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-0.5">{inc.title}</h3>
                        </div>
                        <select
                          value={inc.status}
                          disabled={Boolean(busyActionId)}
                          onChange={(e) =>
                            runRowAction(statusKey, () =>
                              updateIncidentStatus(inc.incidentId, e.target.value as IncidentStatus)
                            )
                          }
                          className="h-8 px-2 rounded-lg bg-[#080B14] border border-white/10 text-[11px] text-white disabled:opacity-50"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      {inc.imageUrl && (
                        <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                          <Image
                            src={inc.imageUrl}
                            alt={inc.title}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <p className="text-slate-300 leading-relaxed">{inc.description}</p>

                      <div className="p-3 rounded-xl bg-[#080B14] border border-white/5 space-y-1 text-[11px]">
                        <div className="text-cyan-300 font-semibold">
                          {inc.building} · {inc.floor} · {inc.room}
                        </div>
                        <div className="text-slate-400">
                          Reporter: {inc.studentName} · {inc.submittedAt}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex justify-end">
                        <button
                          onClick={() => runRowAction(delKey, () => deleteCampusIncident(inc.incidentId))}
                          disabled={Boolean(busyActionId)}
                          className="h-9 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isBusyDel ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>{isBusyDel ? 'Deleting...' : 'Mark Solved & Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-4 text-xs">
              <h3 className="text-base font-bold text-white">Publish Official Announcement</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={ancTitle}
                    onChange={(e) => setAncTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={ancCategory}
                    onChange={(e) => setAncCategory(e.target.value as Announcement['category'])}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Registration">Registration</option>
                    <option value="Campus">Campus</option>
                    <option value="Important">Important</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Content</label>
                  <textarea
                    required
                    rows={4}
                    value={ancContent}
                    onChange={(e) => setAncContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPublishingAnc}
                  className="w-full h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPublishingAnc ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Announcement</span>
                  )}
                </button>
              </form>
            </div>

            <div className="md:col-span-7 space-y-3">
              {announcements.map((anc: Announcement) => {
                const delKey = `del_anc_${anc.announcementId}`;
                return (
                  <div
                    key={anc.announcementId}
                    className="p-4 rounded-2xl bg-[#141C2D] border border-white/10 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{anc.title}</span>
                      <button
                        onClick={() => runRowAction(delKey, () => deleteAnnouncement(anc.announcementId))}
                        disabled={Boolean(busyActionId)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer disabled:opacity-50"
                      >
                        {busyActionId === delKey ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-slate-300">{anc.content}</p>
                    <div className="text-[11px] text-slate-500">
                      {anc.author} · {anc.publishDate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101525] border border-cyan-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Student Details</h3>
              <button
                type="button"
                disabled={isSavingStudent}
                onClick={() => setEditingStudent(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">University ID</label>
                  <input
                    type="text"
                    required
                    value={editUniversityId}
                    onChange={(e) => setEditUniversityId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Faculty</label>
                <select
                  value={editFaculty}
                  onChange={(e) => setEditFaculty(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white"
                >
                  {ASU_BUILDINGS.filter((b) => b.category === 'academic').map((b) => (
                    <option key={b.code} value={b.nameEn} className="bg-[#101525]">
                      {b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Major</label>
                  <input
                    type="text"
                    required
                    value={editMajor}
                    onChange={(e) => setEditMajor(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Year</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'suspended')}
                    className="w-full h-10 px-2 rounded-xl bg-[#080B14] border border-white/10 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingStudent}
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStudent}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingStudent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Student</span>
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
