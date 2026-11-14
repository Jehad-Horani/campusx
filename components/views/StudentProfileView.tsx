'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import {
  User,
  Mail,
  Phone,
  Save,
  Edit2,
  QrCode,
  LogOut,
  Loader2,
} from 'lucide-react';

export function StudentProfileView() {
  const { student, updateStudent, logoutStudent, t } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(student.fullName);
  const [phone, setPhone] = useState(student.phoneNumber);
  const [major, setMajor] = useState(student.major);
  const [faculty, setFaculty] = useState(student.faculty);
  const [academicYear, setAcademicYear] = useState(student.academicYear);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateStudent({
        fullName,
        phoneNumber: phone,
        major,
        faculty,
        academicYear,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Digital Student Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.nav.profile}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>

          <button
            onClick={logoutStudent}
            className="h-10 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.nav.signOut}</span>
          </button>
        </div>
      </div>

      {/* Digital ASU Student ID Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-tr from-[#080B14] via-[#10192E] to-[#1C2642] border border-cyan-500/40 shadow-2xl text-white space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 p-0.5 shrink-0">
              <Image
                src="/assets/aistudio/LOGO_bc48159f.png"
                alt="CampusX"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white">
                Campus<span className="text-cyan-400">X</span> · ASU
              </div>
              <div className="text-[10px] text-slate-400">
                Applied Science Private University
              </div>
            </div>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            Active Student
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-1 shrink-0">
            <div className="w-full h-full bg-[#101525] rounded-[12px] flex items-center justify-center text-3xl font-black text-cyan-300">
              {student.fullName.charAt(0)}
            </div>
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="text-xl font-black text-white">{student.fullName}</h2>
            <div className="text-xs text-cyan-300 font-mono font-semibold">
              University ID: {student.universityId}
            </div>
            <div className="text-xs text-slate-300">
              {student.major} · {student.faculty}
            </div>
            <div className="text-xs text-slate-400">
              Academic Year {student.academicYear}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0 text-center space-y-1">
            <QrCode className="w-12 h-12 text-cyan-300 mx-auto" />
            <div className="text-[9px] font-mono text-slate-400">ASU ID</div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-4 text-xs">
          <h3 className="text-base font-bold text-white">Edit Profile Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Major</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Faculty</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              >
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y} className="bg-[#101525]">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-3xl bg-[#141C2D] border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white">Contact Records</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                University Email
              </span>
              <div className="font-mono text-white text-sm">{student.email}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                Phone Number
              </span>
              <div className="font-mono text-white text-sm">{student.phoneNumber}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
