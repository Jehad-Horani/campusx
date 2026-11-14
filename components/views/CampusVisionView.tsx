'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { ASU_BUILDINGS, decodeAsuClassroom } from '@/lib/asu-campus';
import {
  CampusIncident,
  IncidentCategory,
  IncidentPriority,
} from '@/types/campusx';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Clock,
  Loader2,
  CheckCircle,
  X,
  Video,
  Aperture,
} from 'lucide-react';

const CATEGORIES: IncidentCategory[] = [
  'Maintenance',
  'Electrical',
  'Cleaning',
  'IT Support',
  'Facilities',
  'Safety',
  'Other',
];

const PRIORITIES: IncidentPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function CampusVisionView() {
  const {
    campusIncidents,
    submitCampusIncident,
    student,
    showToast,
  } = useStore();

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activeTab, setActiveTab] = useState<'report' | 'my-reports'>('report');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Maintenance');
  const [priority, setPriority] = useState<IncidentPriority>('Medium');
  const [building, setBuilding] = useState(`Bldg ${ASU_BUILDINGS[0].code} — ${ASU_BUILDINGS[0].nameEn}`);
  const [floor, setFloor] = useState('1st Floor');
  const [room, setRoom] = useState('');
  const [aiClassification, setAiClassification] = useState<CampusIncident['aiClassification']>();

  const decodedRoom = decodeAsuClassroom(room);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const startLiveCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      showToast('Camera API unsupported; please upload a photo.');
      uploadInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      showToast('Could not open live camera; choose a photo from device.');
      uploadInputRef.current?.click();
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setImagePreviewUrl(dataUrl);
    await analyzePhotoWithAi(dataUrl, 'image/jpeg');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImagePreviewUrl(base64String);
      await analyzePhotoWithAi(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhotoWithAi = async (base64Data: string, mimeType: string) => {
    setIsAnalyzingImage(true);
    try {
      const res = await fetch('/api/campus-vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          userPrompt: 'Diagnose this campus facility or classroom issue.',
        }),
      });
      const data = await res.json();
      if (data) {
        if (!title) setTitle(data.detectedObject || '');
        if (!description) setDescription(data.reasoning || '');
        if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category);
        if (data.priority && PRIORITIES.includes(data.priority)) setPriority(data.priority);
        setAiClassification({
          detectedObject: data.detectedObject || 'Facility Issue',
          confidence: data.confidence || 0.9,
          recommendedDepartment: data.recommendedDepartment || 'University Maintenance',
          reasoning: data.reasoning || '',
        });
      }
    } catch {
      // ignore if offline or AI key unavailable
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isAnalyzingImage) return;

    if (!title.trim() || !description.trim()) {
      showToast('Please enter issue title and description.');
      return;
    }

    const resolvedBuilding = decodedRoom.isValid
      ? `Bldg ${decodedRoom.buildingCode} — ${decodedRoom.buildingNameEn}`
      : building;
    const resolvedFloor = decodedRoom.isValid ? decodedRoom.floorLabelEn : floor;

    setIsSubmitting(true);
    try {
      await submitCampusIncident({
        studentId: student.studentId,
        studentName: student.fullName,
        isConfidential: false,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        building: resolvedBuilding,
        floor: resolvedFloor,
        room: room.trim() || 'Not specified',
        imageUrl: imagePreviewUrl || undefined,
        assignedDepartment: aiClassification?.recommendedDepartment || 'Campus Facilities & Maintenance',
        aiClassification,
      });

      setTitle('');
      setDescription('');
      setRoom('');
      setImagePreviewUrl(null);
      setAiClassification(undefined);
      setActiveTab('my-reports');
    } finally {
      setIsSubmitting(false);
    }
  };

  const myReports = campusIncidents.filter((inc) => inc.studentId === student.studentId);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#101525] via-[#141C2D] to-[#15233D] border border-cyan-500/25 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Camera className="w-3.5 h-3.5" />
              <span>Direct Campus Problem Reporting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Report a Problem
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Capture a photo directly with your camera or upload an image with the room number; reports are sent directly to campus administration with your student name.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-4 h-10 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'report'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/5 text-slate-300 border border-white/10'
              }`}
            >
              New Report
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-reports')}
              className={`px-4 h-10 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'my-reports'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/5 text-slate-300 border border-white/10'
              }`}
            >
              <span>My Reports</span>
              <span className="font-mono px-1.5 py-0.5 rounded bg-black/20 text-[10px]">
                {myReports.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'report' ? (
        <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Camera / Upload Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#141C2D] border border-white/10 rounded-3xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Problem Photo (Camera or Upload)</span>
              </h2>

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {isCameraOpen ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-cyan-500/40">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={captureFromCamera}
                      className="flex-1 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Aperture className="w-4 h-4" />
                      <span>Capture Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : imagePreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 aspect-video bg-black">
                  <Image
                    src={imagePreviewUrl}
                    alt="Problem Photo"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isAnalyzingImage && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-cyan-300 z-10">
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span className="text-xs font-bold">Analyzing image...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreviewUrl(null);
                      setAiClassification(undefined);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 text-rose-300 border border-rose-500/40 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startLiveCamera}
                    className="p-5 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all"
                  >
                    <Video className="w-7 h-7 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Open Camera</span>
                    <span className="text-[10px] text-slate-400">Live Capture</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all"
                  >
                    <Upload className="w-7 h-7 text-purple-400" />
                    <span className="text-xs font-bold text-white">Upload Image</span>
                    <span className="text-[10px] text-slate-400">From Gallery</span>
                  </button>
                </div>
              )}

              {aiClassification && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Analysis:</span>
                  </div>
                  <div className="text-white font-semibold">{aiClassification.detectedObject}</div>
                </div>
              )}
            </div>

            <div className="bg-[#141C2D] border border-white/10 rounded-2xl p-4 text-xs text-slate-300 space-y-1">
              <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                Reporter Identity
              </div>
              <div className="font-semibold text-white">
                {student.fullName} · ID {student.universityId}
              </div>
              <p className="text-[11px] text-slate-400">
                Reports are logged under your official ASU student profile for faster maintenance follow-up.
              </p>
            </div>
          </div>

          {/* Right: Details Form */}
          <div className="lg:col-span-7 bg-[#141C2D] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Problem Details & Location</span>
            </h2>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken projector or AC malfunction"
                className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue clearly..."
                className="w-full p-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="7106 / 1B12"
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Building
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full h-10 px-2.5 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  {ASU_BUILDINGS.map((b) => (
                    <option key={b.code} value={`Bldg ${b.code} — ${b.nameEn}`} className="bg-[#101525]">
                      {b.code} · {b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Floor
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {decodedRoom.isValid && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
                {decodedRoom.summaryEn}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#101525]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                  className="w-full h-10 px-3 rounded-xl bg-[#080B14] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p} className="bg-[#101525]">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isAnalyzingImage}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Problem Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#141C2D] border border-white/10 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">You have not submitted any reports yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myReports.map((inc) => (
                <div
                  key={inc.incidentId}
                  className="p-4 rounded-2xl bg-[#141C2D] border border-white/10 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">
                      #{inc.incidentId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {inc.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{inc.title}</h3>
                  <p className="text-slate-400 line-clamp-2">{inc.description}</p>
                  <div className="text-[11px] text-cyan-300">
                    {inc.building} · {inc.room}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
