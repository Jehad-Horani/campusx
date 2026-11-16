'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/lib/store';
import {
  decodeAsuClassroom,
  estimateWalkingMinutesToBuilding,
  findAsuBuilding,
  formatDistance,
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
  Ruler,
  Radio,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
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
    campusWeather,
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
  const targetBuilding = findAsuBuilding(targetBuildingCode);

  const walkInfo = estimateWalkingMinutesToBuilding(
    userCoordinates,
    simulatedLocation,
    targetBuildingCode,
    walkingSpeed
  );

  const campusCheck = userCoordinates
    ? isInsideAsuCampus(userCoordinates.lat, userCoordinates.lng)
    : null;
  const isInsideCampus = Boolean(campusCheck?.inside);

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

  const WeatherIcon =
    (campusWeather.weatherCode ?? 0) >= 51
      ? CloudRain
      : (campusWeather.weatherCode ?? 0) === 3
      ? Cloud
      : (campusWeather.weatherCode ?? 0) >= 1
      ? CloudSun
      : Sun;

  return (
    <motion.div
      animate={
        isInsideCampus
          ? {
              boxShadow: [
                '0 0 0 1px rgba(16, 185, 129, 0.35), 0 14px 40px -12px rgba(6, 182, 212, 0.25)',
                '0 0 0 1px rgba(6, 182, 212, 0.6), 0 18px 48px -10px rgba(16, 185, 129, 0.35)',
                '0 0 0 1px rgba(16, 185, 129, 0.35), 0 14px 40px -12px rgba(6, 182, 212, 0.25)',
              ],
            }
          : undefined
      }
      transition={isInsideCampus ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 shadow-xl transition-colors ${
        isInsideCampus
          ? 'border border-emerald-400/50 bg-gradient-to-br from-[#0B1B26] via-[#10212E] to-[#132A38]'
          : 'border border-cyan-500/30 bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#1A2438]'
      }`}
    >
      {/* Animated Campus Atmosphere Shimmer when inside ASU */}
      {isInsideCampus && (
        <>
          <motion.div
            aria-hidden
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent skew-x-12"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl"
          />
        </>
      )}

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            {isInsideCampus && (
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.75], opacity: [0.65, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-xl bg-emerald-400/40"
              />
            )}
            <div
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center border ${
                isInsideCampus
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              }`}
            >
              {isInsideCampus ? <Radio className="w-4 h-4 animate-pulse" /> : <Compass className="w-4 h-4" />}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-cyan-400">{t.campusMode.title}</span>
              {campusCheck ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    campusCheck.inside
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      campusCheck.inside ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  {campusCheck.inside
                    ? `LIVE IN ASU · Near Bldg ${campusCheck.nearestBuilding.code}`
                    : `Outside ASU (${(campusCheck.distanceFromCenterMeters / 1000).toFixed(1)} km)`}
                </span>
              ) : (
                <button
                  onClick={requestLocationAccess}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 cursor-pointer transition-colors"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>
                    {locationPermissionStatus === 'granted' ? 'Refresh GPS' : 'Enable Live GPS'}
                  </span>
                </button>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t.campusMode.subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Compact Real ASU Weather Pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-200 font-semibold"
            title={campusWeather.advisory || campusWeather.condition}
          >
            <WeatherIcon className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-mono font-bold tabular-nums">{campusWeather.temperatureC}°C</span>
            <span className="text-slate-400">· {campusWeather.condition}</span>
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
      </div>

      {/* Body */}
      {!nextCourse ? (
        <div className="relative z-10 py-6 text-center space-y-2">
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
        <div className="relative z-10 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center">
          <div className="lg:col-span-6 space-y-2.5">
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

            {/* Live GPS Comparison Readout */}
            <div className="text-[11px] flex flex-wrap items-center gap-1.5 pt-0.5">
              {userCoordinates ? (
                <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                  <LocateFixed className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    From your GPS
                    {campusCheck?.inside ? ` (near Bldg ${campusCheck.nearestBuilding.code})` : ''} to Bldg{' '}
                    {targetBuildingCode}:{' '}
                    <strong className="font-mono text-white">
                      {formatDistance(walkInfo.meters)}
                    </strong>
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={requestLocationAccess}
                  className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>Allow GPS to measure exact distance from your current location</span>
                </button>
              )}
            </div>
          </div>

          {/* 3-Metric Real Comparison Grid: Starts In | Real Distance | Walk Time */}
          <div className="lg:col-span-6 bg-[#0C101C]/85 rounded-2xl p-3 border border-white/10 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{nextSchedule?.isOngoing ? 'Ends in' : t.campusMode.startsIn}</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-1 tabular-nums">
                {!nowMs || !nextSchedule
                  ? '—'
                  : nextSchedule.isOngoing
                  ? formatMinutesToHours(nextSchedule.minutesRemaining)
                  : formatMinutesToHours(minsUntilClass)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Ruler className="w-3 h-3 text-emerald-400" />
                <span>{walkInfo.usedRealGps ? 'Real Distance' : 'Est. Distance'}</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-300 font-mono mt-1 tabular-nums">
                {formatDistance(walkInfo.meters)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Footprints className="w-3 h-3 text-cyan-400" />
                <span>{t.campusMode.walkingTime}</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-cyan-300 font-mono mt-1 tabular-nums">
                ~{formatMinutesToHours(walkInfo.minutes)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={targetBuilding?.mapsUrl || ASU_CAMPUS_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold inline-flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>
              {targetBuilding ? `Bldg ${targetBuilding.code} on Google Maps` : 'ASU Campus on Google Maps'}
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <button
          onClick={() => setActiveView('campus-mode')}
          className="w-full sm:w-auto min-h-[42px] px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B14] font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{t.campusMode.navigate}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
