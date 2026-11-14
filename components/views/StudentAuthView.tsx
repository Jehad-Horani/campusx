'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ASU_BUILDINGS } from '@/lib/asu-campus';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Building2,
  Hash,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Database,
} from 'lucide-react';

export function StudentAuthView() {
  const { loginStudent, registerStudent, supabaseConnected } = useStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up state
  const academicFaculties = ASU_BUILDINGS.filter((b) => b.category === 'academic');
  const [fullName, setFullName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [faculty, setFaculty] = useState(
    academicFaculties[0]?.nameEn || 'Faculty of Information Technology'
  );
  const [major, setMajor] = useState('');
  const [academicYear, setAcademicYear] = useState(1);
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await loginStudent(identifier, loginPassword);
      if (!res.ok) {
        setErrorMsg(res.error || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        fullName,
        universityId,
        email,
        phoneNumber,
        faculty,
        major,
        academicYear,
        password: signupPassword,
      });
      if (!res.ok) {
        setErrorMsg(res.error || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoStudent = () => {
    setMode('login');
    setIdentifier('202110482');
    setLoginPassword('demo123');
    setErrorMsg(null);
  };

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-[#080B14] text-[#F5F7FF] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top minimal bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-1 flex items-center justify-center">
            <Image
              src="/assets/aistudio/LOGO_bc48159f.png"
              alt="CampusX Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="font-extrabold text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
              <span>Campus<span className="text-cyan-400">X</span></span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                ASU
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Applied Science Private University
            </div>
          </div>
        </div>

        <Link
          href="/admin"
          className="h-9 px-3.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </Link>
      </header>

      {/* Main Auth Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-6">
        <div className="rounded-3xl bg-[#101525]/95 border border-white/10 shadow-2xl p-5 sm:p-7 space-y-5 backdrop-blur-xl">
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {mode === 'login' ? 'Student Sign In' : 'Create Student Account'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {mode === 'login'
                ? 'Sign in with your university ID or email to access your ASU schedule and smart tools.'
                : 'Register your ASU account and upload your current semester schedule.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#080B14] border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-cyan-500 text-[#080B14] shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-[#080B14] shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  University ID or Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute top-3 left-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 202110482 or student@asu.edu.jo"
                    className="w-full h-11 rounded-xl bg-[#080B14] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-10 pr-3"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3 left-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl bg-[#080B14] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-10 pr-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Quick test student:</span>
                <button
                  type="button"
                  onClick={fillDemoStudent}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                >
                  202110482 / demo123
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full h-10 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500 pl-9 pr-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">University ID</label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
                    <input
                      type="text"
                      required
                      value={universityId}
                      onChange={(e) => setUniversityId(e.target.value)}
                      placeholder="202310455"
                      className="w-full h-10 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500 pl-9 pr-3"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@asu.edu.jo"
                      className="w-full h-10 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500 pl-9 pr-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="079xxxxxxx"
                      className="w-full h-10 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500 pl-9 pr-3"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">ASU Faculty</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500 pl-9 pr-3"
                  >
                    {academicFaculties.map((b) => (
                      <option key={b.code} value={b.nameEn} className="bg-[#101525]">
                        {b.nameEn} (Bldg {b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Major</label>
                  <div className="relative">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
                    <input
                      type="text"
                      required
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Software Engineering"
                      className="w-full h-10 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500 pl-9 pr-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="w-full h-10 px-2.5 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y} value={y} className="bg-[#101525]">
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500 pl-9 pr-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Upload Schedule</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer note */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto text-center text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-3 py-2">
        <span className="inline-flex items-center gap-1">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          {supabaseConnected ? 'Connected to Supabase DB' : 'Local Storage Fallback (Ready for Supabase)'}
        </span>
      </footer>
    </div>
  );
}
