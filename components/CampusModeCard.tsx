'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  decodeAsuClassroom,
  estimateWalkingMinutesToBuilding,
  formatMinutesToHours,
  formatTime12h,
  getNextScheduledCourse,
  isInsideAsuCampus,
  ASU_CAMPUS_MAPS_URL,
} from '@/lib/asu-campus';
import {
  Navigation,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Footprints,
  Compass,
  LocateFixed,
  ExternalLink,
} from 'lucide-react';

export function CampusModeCard() {
  const {
    courses,
    setActiveView,
    userCoordinates,
    locationPermissionStatus,
    requestLocationAccess,
    simulatedLocation,
    walkingSpeed,
    t,
  } = useStore();

  const [nowMs, setNowMs] = useState<number>(0);

  useEffect(() => {
    const t0 = setTimeout(() => setNowMs(Date.now()), 0);
    const interval = setInterval(() => setNowMs(Date.now()), 30000);
    return () => {
      clearTimeout(t0);
      clearInterval(interval);
    };
  }, []);

  const nextSchedule = useMemo(() => {
    if (!courses || courses.length === 0 || !nowMs) return null;
    return getNextScheduledCourse(courses, new Date(nowMs));
  }, [courses, nowMs]);

  const nextCourse = nextSchedule?.course || (courses && courses.length > 0 ? courses[0] : null);
  const minsUntilClass = nextSchedule ? nextSchedule.minutesUntilStart : 0;

  const decodedRoom = nextCourse ? decodeAsuClassroom(nextCourse.classroom) : null;
  const targetBuildingCode = decodedRoom?.isValid ? decodedRoom.buildingCode : '1';

  const walkInfo = estimateWalkingMinutesToBuilding(
    userCoordinates,
    simulatedLocation,
    targetBuildingCode,
    walkingSpeed
  );

  const campusCheck = userCoordinates
    ? isInsideAsuCampus(userCoordinates.lat, userCoordinates.lng)
    : null;

  let arrivalStatus: 'ON TIME' | 'TIGHT' | 'LATE' = 'ON TIME';
  if (nextSchedule?.isOngoing) {
    arrivalStatus = 'LATE';
  } else if (nextSchedule && nextSchedule.dayOffset === 0) {
    if (minsUntilClass < walkInfo.minutes) {
      arrivalStatus = 'LATE';
    } else if (minsUntilClass <= walkInfo.minutes + 3) {
      arrivalStatus = 'TIGHT';
    }
  }

  const statusConfig = {
    'ON TIME': {
      text: t.status.onTime,
      badgeBg: 'bg-emerald-500/20',
      badgeBorder: 'border-emerald-500/40',
      textColor: 'text-emerald-300',
      indicatorColor: 'bg-emerald-400',
    },
    TIGHT: {
      text: t.status.tight,
      badgeBg: 'bg-amber-500/20',
      badgeBorder: 'border-amber-500/40',
      textColor: 'text-amber-300',
      indicatorColor: 'bg-amber-400',
    },
    LATE: {
      text: nextSchedule?.isOngoing ? 'IN PROGRESS' : t.status.late,
      badgeBg: nextSchedule?.isOngoing ? 'bg-cyan-500/20' : 'bg-rose-500/20',
      badgeBorder: nextSchedule?.isOngoing ? 'border-cyan-500/40' : 'border-rose-500/40',
      textColor: nextSchedule?.isOngoing ? 'text-cyan-300' : 'text-rose-300',
      indicatorColor: nextSchedule?.isOngoing ? 'bg-cyan-400' : 'bg-rose-400',
    },
  }[arrivalStatus];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#1A2438] p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-cyan-400">{t.campusMode.title}</span>
              {campusCheck ? (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    campusCheck.inside
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${campusCheck.inside ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {campusCheck.inside
                    ? `Inside ASU (${campusCheck.nearestBuilding.nameEn})`
                    : `Outside ASU (${(campusCheck.distanceFromCenterMeters / 1000).toFixed(1)} km)`}
                </span>
              ) : (
                <button
                  onClick={requestLocationAccess}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 cursor-pointer transition-colors"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>
                    {locationPermissionStatus === 'granted' ? 'Refresh GPS' : 'Enable GPS'}
                  </span>
                </button>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t.campusMode.subtitle}</div>
          </div>
        </div>

        {nextCourse && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${statusConfig.badgeBg} ${statusConfig.badgeBorder} ${statusConfig.textColor} text-xs font-bold`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.indicatorColor}`} />
            <span>{statusConfig.text}</span>
          </div>
        )}
      </div>

      {/* Body */}
      {!nextCourse ? (
        <div className="py-6 text-center space-y-2">
          <p className="text-xs text-slate-300">
            Add your semester courses to track lecture walking times.
          </p>
          <button
            onClick={() => setActiveView('courses')}
            className="px-4 h-9 rounded-xl bg-cyan-500 text-black font-bold text-xs cursor-pointer"
          >
            Add Courses
          </button>
        </div>
      ) : (
        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
          <div className="md:col-span-7 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 flex flex-wrap items-center gap-1.5">
              <span>{t.campusMode.nextClass}</span>
              {nextSchedule && (
                <>
                  <span>·</span>
                  <span className="text-cyan-300 font-bold">{nextSchedule.dayLabel}</span>
                </>
              )}
              <span>·</span>
              <span>
                {formatTime12h(nextCourse.startTime)} - {formatTime12h(nextCourse.endTime)}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex flex-wrap items-center gap-2">
              <span>{nextCourse.courseName}</span>
              {nextCourse.courseCode && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10">
                  {nextCourse.courseCode}
                </span>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold text-white">{nextCourse.classroom}</span>
                {decodedRoom?.isValid && (
                  <span className="text-cyan-300">({decodedRoom.summaryEn})</span>
                )}
              </div>
              {nextCourse.instructorName && (
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                  <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{nextCourse.instructorName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-5 bg-[#0C101C]/85 rounded-2xl p-3.5 border border-white/10 grid grid-cols-2 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{nextSchedule?.isOngoing ? 'Ends in' : t.campusMode.startsIn}</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white font-mono mt-0.5 tabular-nums">
                {!nowMs || !nextSchedule
                  ? '—'
                  : nextSchedule.isOngoing
                  ? formatMinutesToHours(nextSchedule.minutesRemaining)
                  : formatMinutesToHours(minsUntilClass)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Footprints className="w-3 h-3 text-cyan-400" />
                <span>{t.campusMode.walkingTime}</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-cyan-300 font-mono mt-0.5 tabular-nums">
                ~{walkInfo.minutes}m
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <a
          href={ASU_CAMPUS_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold inline-flex items-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>ASU Campus on Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={() => setActiveView('campus-mode')}
          className="w-full sm:w-auto min-h-[42px] px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B14] font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{t.campusMode.navigate}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
