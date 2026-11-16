'use client';

import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/lib/store';
import {
  ASU_AERIAL_MAP_IMAGE,
  ASU_BUILDINGS,
  ASU_CAMPUS_MAPS_URL,
  AsuBuilding,
  decodeAsuClassroom,
  estimateWalkingMinutesToBuilding,
  findAsuBuilding,
  formatDistance,
  formatMinutesToHours,
  formatTime12h,
  getNextScheduledCourse,
  isInsideAsuCampus,
  projectGpsToMapXY,
} from '@/lib/asu-campus';
import {
  Navigation,
  MapPin,
  Clock,
  Footprints,
  Compass,
  Search,
  LocateFixed,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Route,
  Sparkles,
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Droplets,
  Wind,
  RefreshCw,
  Radio,
} from 'lucide-react';

type CategoryFilter = 'all' | AsuBuilding['category'];

const SAMPLE_ROOM_CODES = ['7106', '1B12', '14203', '21105', 'G/B12'];

function WeatherStatusIcon({
  code,
  isDay,
  className,
}: {
  code?: number;
  isDay?: boolean;
  className?: string;
}) {
  if (typeof code !== 'number') return <CloudSun className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  if (code >= 71 && code <= 77) return <Snowflake className={className} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
  if (code === 45 || code === 48) return <CloudFog className={className} />;
  if (code === 3) return <Cloud className={className} />;
  if (code === 1 || code === 2) return <CloudSun className={className} />;
  return isDay === false ? <Moon className={className} /> : <Sun className={className} />;
}

export function CampusModeView() {
  const {
    courses,
    schedule,
    userCoordinates,
    locationPermissionStatus,
    requestLocationAccess,
    simulatedLocation,
    setSimulatedLocation,
    walkingSpeed,
    setWalkingSpeed,
    campusWeather,
    refreshCampusWeather,
    t,
  } = useStore();

  const mapSectionRef = useRef<HTMLDivElement>(null);

  const [selectedBuildingCode, setSelectedBuildingCode] = useState<string>('1');
  const [roomQuery, setRoomQuery] = useState('7106');
  const [zoom, setZoom] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [buildingSearch, setBuildingSearch] = useState('');
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  const decodedQuery = decodeAsuClassroom(roomQuery);
  const nextScheduled = useMemo(() => getNextScheduledCourse(courses), [courses]);
  const nextCourse = nextScheduled?.course || courses[0];
  const nextDecoded = nextCourse ? decodeAsuClassroom(nextCourse.classroom) : null;
  const targetBldCode = nextDecoded?.isValid ? nextDecoded.buildingCode : '1';

  const campusCheck = userCoordinates
    ? isInsideAsuCampus(userCoordinates.lat, userCoordinates.lng)
    : null;
  const isInsideCampus = Boolean(campusCheck?.inside);

  const userMapPos = useMemo(() => {
    if (!userCoordinates || !campusCheck?.inside) return null;
    return projectGpsToMapXY(userCoordinates.lat, userCoordinates.lng);
  }, [userCoordinates, campusCheck]);

  const originBuilding = useMemo(() => {
    if (campusCheck?.inside && campusCheck.nearestBuilding) {
      return campusCheck.nearestBuilding;
    }
    return findAsuBuilding(simulatedLocation) || ASU_BUILDINGS[0];
  }, [campusCheck, simulatedLocation]);

  const selectedBuilding =
    ASU_BUILDINGS.find((b) => b.code === selectedBuildingCode) || ASU_BUILDINGS[0];

  const selectedWalkInfo = estimateWalkingMinutesToBuilding(
    userCoordinates,
    originBuilding.code,
    selectedBuilding.code,
    walkingSpeed
  );

  const nextClassWalkInfo = estimateWalkingMinutesToBuilding(
    userCoordinates,
    originBuilding.code,
    targetBldCode,
    walkingSpeed
  );

  const filteredBuildings = useMemo(() => {
    const q = buildingSearch.trim().toLowerCase();
    return ASU_BUILDINGS.filter((b) => {
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        b.code.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.facilities.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [categoryFilter, buildingSearch]);

  const handleRoomInput = (value: string) => {
    setRoomQuery(value);
    const decoded = decodeAsuClassroom(value);
    if (decoded.isValid) {
      setSelectedBuildingCode(decoded.buildingCode);
    }
  };

  const focusBuildingOnMap = (code: string) => {
    setSelectedBuildingCode(code);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(2, Number((z + 0.5).toFixed(1))));
  const handleZoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))));

  const handleRefreshWeather = async () => {
    if (isRefreshingWeather) return;
    setIsRefreshingWeather(true);
    try {
      await refreshCampusWeather();
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  const routeStartX = userMapPos ? userMapPos.mapX : originBuilding.mapX;
  const routeStartY = userMapPos ? userMapPos.mapY : originBuilding.mapY;
  const showWalkingRoute = userMapPos !== null || originBuilding.code !== selectedBuilding.code;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>ASU Real-Time Campus Navigation</span>
            {isInsideCampus && (
              <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ON CAMPUS
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.campusMode.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{t.campusMode.subtitle}</p>
        </div>

        {/* Walking Pace Toggle */}
        <div className="flex items-center gap-1.5 bg-[#141C2D] p-1 rounded-xl border border-white/10 text-xs self-start sm:self-auto">
          <span className="text-slate-400 px-2">Pace:</span>
          <button
            onClick={() => setWalkingSpeed('normal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              walkingSpeed === 'normal' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setWalkingSpeed('brisk')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              walkingSpeed === 'brisk' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Brisk
          </button>
        </div>
      </div>

      {/* Real-Time ASU Campus Weather + Live Inside-Campus Geofence Banner */}
      <motion.div
        animate={
          isInsideCampus
            ? {
                boxShadow: [
                  '0 0 0 1px rgba(16, 185, 129, 0.35), 0 10px 30px -10px rgba(16, 185, 129, 0.2)',
                  '0 0 0 1px rgba(34, 211, 238, 0.55), 0 12px 36px -8px rgba(34, 211, 238, 0.3)',
                  '0 0 0 1px rgba(16, 185, 129, 0.35), 0 10px 30px -10px rgba(16, 185, 129, 0.2)',
                ],
              }
            : undefined
        }
        transition={isInsideCampus ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs ${
          isInsideCampus
            ? 'bg-gradient-to-r from-emerald-950/60 via-[#0E202B] to-cyan-950/60 border-emerald-400/50'
            : 'bg-[#101525] border-cyan-500/25'
        }`}
      >
        {isInsideCampus && (
          <motion.div
            aria-hidden
            animate={{ x: ['-100%', '220%'] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-300/12 to-transparent skew-x-12"
          />
        )}

        <div className="relative z-10 flex items-start sm:items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${
              isInsideCampus
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <WeatherStatusIcon
              code={campusWeather.weatherCode}
              isDay={campusWeather.isDay}
              className="w-5 h-5 text-amber-300 mb-0.5"
            />
            <span className="font-extrabold font-mono text-sm tabular-nums leading-none">
              {campusWeather.temperatureC}°C
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-white font-bold flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span>ASU Campus — Shafa Badran, Amman</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-200 border border-cyan-500/30">
                {campusWeather.condition}
                {campusWeather.isLive ? ' · Live' : ''}
              </span>
              {campusCheck && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    campusCheck.inside
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {campusCheck.inside && <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />}
                  {campusCheck.inside
                    ? 'You Are Inside ASU Campus'
                    : `${(campusCheck.distanceFromCenterMeters / 1000).toFixed(2)} km away`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
              {typeof campusWeather.feelsLikeC === 'number' && (
                <span className="font-mono">Feels like {campusWeather.feelsLikeC}°C</span>
              )}
              {typeof campusWeather.humidity === 'number' && (
                <span className="inline-flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{campusWeather.humidity}% humidity</span>
                </span>
              )}
              {typeof campusWeather.windKmh === 'number' && (
                <span className="inline-flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-400" />
                  <span>{campusWeather.windKmh} km/h wind</span>
                </span>
              )}
            </div>

            <p className="text-slate-400 text-[11px]">
              {campusCheck
                ? campusCheck.inside
                  ? `Live position pinned on map · Nearest building: Bldg ${campusCheck.nearestBuilding.code} (${campusCheck.nearestBuilding.nameEn}, ${campusCheck.distanceToNearestBuildingMeters} m)`
                  : `Nearest ASU point: Bldg ${campusCheck.nearestBuilding.code} (${campusCheck.nearestBuilding.nameEn}) · ${campusWeather.advisory || ''}`
                : campusWeather.advisory ||
                  'Allow location access to pinpoint yourself on the ASU campus map and measure real distances.'}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefreshWeather}
            disabled={isRefreshingWeather}
            title="Refresh live weather"
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshingWeather ? 'animate-spin' : ''}`} />
            <span>Weather</span>
          </button>
          <button
            onClick={requestLocationAccess}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              isInsideCampus
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30'
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{locationPermissionStatus === 'granted' ? 'Update GPS' : 'Detect My Location'}</span>
          </button>
          <a
            href={ASU_CAMPUS_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google Maps</span>
          </a>
        </div>
      </motion.div>

      {/* ASU CLASSROOM & BUILDING DECODER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#101525] via-[#141C2D] to-[#1A2438] border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>ASU Classroom & Building Decoder</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter any ASU room code to decode its building, floor, and highlight it on the aerial campus map.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_ROOM_CODES.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleRoomInput(sample)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                  roomQuery.trim().toUpperCase() === sample
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-[#080B14] text-slate-300 border-white/10 hover:border-cyan-500/40'
                }`}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4">
            <input
              type="text"
              value={roomQuery}
              onChange={(e) => handleRoomInput(e.target.value)}
              placeholder="7106 / 1B12 / 14203 / 21105"
              className="w-full h-12 px-4 rounded-2xl bg-[#080B14] border border-cyan-500/40 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-8 grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-[#080B14]/80 border border-white/10">
              <div className="text-[10px] text-slate-400">Building</div>
              <div className="text-xs sm:text-sm font-bold text-cyan-300 mt-1 line-clamp-2">
                {decodedQuery.isValid
                  ? `${decodedQuery.buildingCode} · ${decodedQuery.buildingNameEn}`
                  : '—'}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#080B14]/80 border border-white/10">
              <div className="text-[10px] text-slate-400">Floor</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">
                {decodedQuery.isValid ? decodedQuery.floorLabelEn : '—'}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#080B14]/80 border border-white/10">
              <div className="text-[10px] text-slate-400">Room</div>
              <div className="text-sm sm:text-base font-mono font-extrabold text-emerald-400 mt-1">
                {decodedQuery.isValid ? decodedQuery.roomNumber : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE AERIAL CAMPUS MAP + DIRECTORY */}
      <div ref={mapSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Aerial Map Card */}
        <div
          className={`lg:col-span-8 rounded-3xl p-4 sm:p-5 border space-y-4 transition-colors ${
            isInsideCampus
              ? 'bg-[#101C2B] border-emerald-400/45 shadow-lg shadow-emerald-500/10'
              : 'bg-[#141C2D] border-white/10'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{t.campusMode.campusMap}</span>
                {userMapPos && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                    GPS Pinned Live
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {userMapPos
                  ? 'Your live GPS dot appears on the aerial map. Tap any building pin for route & distance.'
                  : 'Tap any numbered building pin on the ASU aerial view to inspect facilities & walking route.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!userMapPos && (
                <select
                  value={simulatedLocation}
                  onChange={(e) => setSimulatedLocation(e.target.value)}
                  aria-label="Starting building"
                  className="h-9 px-3 rounded-xl bg-[#080B14] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {ASU_BUILDINGS.map((b) => (
                    <option key={b.code} value={b.code} className="bg-[#101525]">
                      From: Bldg {b.code} ({b.shortName})
                    </option>
                  ))}
                </select>
              )}

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-[#080B14] border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  title="Zoom out"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[11px] font-mono font-bold text-cyan-300 tabular-nums">
                  {zoom.toFixed(1)}x
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 2}
                  title="Zoom in"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoom > 1 && (
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    title="Reset zoom"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Aerial Image Viewport with Numbered Building Pins + Live GPS Dot + Walking Path */}
          <div className="relative w-full rounded-2xl bg-[#090D18] border border-white/10 overflow-auto max-h-[620px]">
            <div
              className="relative transition-[width] duration-200 ease-out"
              style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
            >
              {/* Clean Unnumbered ASU Aerial Photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASU_AERIAL_MAP_IMAGE}
                alt="Applied Science Private University Aerial Campus Map"
                className="w-full h-auto block select-none brightness-95 contrast-105"
                draggable={false}
              />

              {/* Subtle Dark Scrim for Marker Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B14]/35 via-transparent to-[#080B14]/20 pointer-events-none" />

              {/* Walking Route SVG Line */}
              {showWalkingRoute && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                >
                  <line
                    x1={routeStartX}
                    y1={routeStartY}
                    x2={selectedBuilding.mapX}
                    y2={selectedBuilding.mapY}
                    stroke={userMapPos ? '#34d399' : '#22d3ee'}
                    strokeWidth="0.7"
                    strokeDasharray="1.6 1.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Numbered Building Pins */}
              {ASU_BUILDINGS.map((b) => {
                const isSelected = selectedBuildingCode === b.code;
                const isOrigin = !userMapPos && originBuilding.code === b.code;
                const isNextLecture = nextDecoded?.buildingCode === b.code;

                return (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setSelectedBuildingCode(b.code)}
                    style={{ top: `${b.mapY}%`, left: `${b.mapX}%` }}
                    title={`Bldg ${b.code} — ${b.nameEn}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group focus:outline-none ${
                      isSelected ? 'z-30 scale-110' : isOrigin || isNextLecture ? 'z-20' : 'z-10 hover:z-20'
                    }`}
                  >
                    <div
                      className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 rounded-full flex items-center justify-center font-mono text-[11px] sm:text-xs font-black border-2 shadow-lg transition-all ${
                        isSelected
                          ? 'bg-cyan-400 text-[#080B14] border-white ring-4 ring-cyan-400/35'
                          : isOrigin
                          ? 'bg-emerald-500 text-[#080B14] border-white ring-2 ring-emerald-400/30'
                          : isNextLecture
                          ? 'bg-purple-500 text-white border-white ring-2 ring-purple-400/30'
                          : 'bg-[#0C1222]/92 text-white border-white/80 hover:border-cyan-300 hover:bg-[#141F38]'
                      }`}
                    >
                      {b.code}
                    </div>

                    {/* Floating Label on Active or Hover */}
                    <div
                      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded-md bg-[#080B14]/95 border border-white/15 text-[10px] font-bold text-white whitespace-nowrap shadow-md transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {b.shortName}
                    </div>
                  </button>
                );
              })}

              {/* LIVE STUDENT GPS MARKER (when inside ASU campus) */}
              {userMapPos && (
                <div
                  style={{ top: `${userMapPos.mapY}%`, left: `${userMapPos.mapX}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
                >
                  <motion.span
                    animate={{ scale: [1, 2.6], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-emerald-400"
                  />
                  <div className="relative w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-xl shadow-emerald-500/60 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#080B14]" />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-0.5 rounded-md bg-emerald-500 text-[#080B14] font-extrabold text-[10px] whitespace-nowrap shadow-lg">
                    YOU
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Legend & Route Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-slate-300">
            <div className="flex flex-wrap items-center gap-4">
              {userMapPos && (
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 border border-white inline-block animate-pulse" />
                  <span>Your Live GPS</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white inline-block" />
                <span>Selected</span>
              </div>
              {!userMapPos && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block" />
                  <span>Start ({originBuilding.code})</span>
                </div>
              )}
              {nextCourse && nextDecoded?.isValid && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500 border border-white inline-block" />
                  <span>Next Class ({nextDecoded.buildingCode})</span>
                </div>
              )}
            </div>

            {showWalkingRoute && (
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Route className="w-3.5 h-3.5" />
                <span>
                  {userMapPos ? 'Your GPS' : `Bldg ${originBuilding.code}`} → Bldg{' '}
                  {selectedBuilding.code}:{' '}
                  <span className="font-mono tabular-nums">{formatDistance(selectedWalkInfo.meters)}</span> (~
                  {formatMinutesToHours(selectedWalkInfo.minutes)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Building Card */}
          <div className="p-5 rounded-3xl bg-[#141C2D] border border-cyan-500/30 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500 text-[#080B14] flex items-center justify-center font-mono text-base font-black shrink-0 shadow-md shadow-cyan-500/20">
                  {selectedBuilding.code}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    {selectedBuilding.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {selectedBuilding.nameEn}
                  </h3>
                </div>
              </div>
              <a
                href={selectedBuilding.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open Bldg ${selectedBuilding.code} in Google Maps`}
                className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-cyan-300 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedBuilding.description}</p>

            {/* Walk Time & Real Distance */}
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-2.5 rounded-2xl bg-[#080B14] border border-white/10">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Footprints className="w-3 h-3 text-cyan-400" />
                  <span>Walk Time</span>
                </div>
                <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5 tabular-nums">
                  ~{formatMinutesToHours(selectedWalkInfo.minutes)}
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#080B14] border border-white/10">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>{selectedWalkInfo.usedRealGps ? 'Real Distance' : 'Distance'}</span>
                </div>
                <div className="text-sm font-mono font-bold text-emerald-300 mt-0.5 tabular-nums">
                  {formatDistance(selectedWalkInfo.meters)}
                </div>
              </div>
            </div>

            {/* Exact Coordinates Strip */}
            <div className="px-3 py-2 rounded-xl bg-[#080B14]/70 border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>
                {selectedBuilding.lat.toFixed(5)}°N, {selectedBuilding.lng.toFixed(5)}°E
              </span>
              <a
                href={selectedBuilding.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-bold"
              >
                Maps Pin ↗
              </a>
            </div>

            {/* Key Facilities */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400">Key Facilities</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedBuilding.facilities.map((fac) => (
                  <span
                    key={fac}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-200 font-medium"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Room Numbering Guide */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Room Numbering Rule</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {selectedBuilding.code === 'G/B'
                  ? 'Clinics rooms start with G/B followed by clinic or hall number.'
                  : `Prefix "${selectedBuilding.code}" identifies this building, next digit is floor (1, 2, 3 or B for basement), last two digits are the room.`}
              </p>
            </div>
          </div>

          {/* All 13 Buildings Reference Directory with Category Filter */}
          <div className="p-5 rounded-3xl bg-[#141C2D] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{t.campusMode.allBuildings}</h3>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredBuildings.length}/{ASU_BUILDINGS.length}
              </span>
            </div>

            <input
              type="text"
              value={buildingSearch}
              onChange={(e) => setBuildingSearch(e.target.value)}
              placeholder="Search building or lab..."
              className="w-full h-9 px-3 rounded-xl bg-[#080B14] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
            />

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['all', 'academic', 'admin', 'sports', 'health'] as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-cyan-500 text-[#080B14]'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 text-xs">
              {filteredBuildings.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No matching ASU buildings found.
                </div>
              ) : (
                filteredBuildings.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => focusBuildingOnMap(b.code)}
                    className={`w-full p-2.5 rounded-xl border text-start flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      selectedBuildingCode === b.code
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                        : 'bg-[#080B14]/60 border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate font-medium">{b.nameEn}</span>
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded shrink-0">
                      {b.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Next Class Walking Summary */}
          {nextCourse && (
            <div className="p-4 rounded-2xl bg-purple-950/25 border border-purple-500/30 text-xs flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-purple-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Next Lecture</span>
                </div>
                <div className="font-bold text-white truncate mt-0.5">
                  {nextCourse.courseName} ({nextCourse.classroom})
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {formatDistance(nextClassWalkInfo.meters)} away
                </div>
              </div>
              <button
                type="button"
                onClick={() => focusBuildingOnMap(targetBldCode)}
                className="font-mono font-bold text-cyan-300 bg-[#080B14] border border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1 shrink-0 hover:border-cyan-500/40 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>~{formatMinutesToHours(nextClassWalkInfo.minutes)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Today's schedule quick preview */}
      <div className="p-5 rounded-3xl bg-[#141C2D] border border-white/10 space-y-3">
        <h3 className="text-sm font-bold text-white">{t.campusMode.todaySchedule}</h3>
        {schedule.filter((s) => s.type === 'class').length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">
            No enrolled lectures on your schedule yet. Add courses in My Courses to locate rooms on the map.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {schedule
              .filter((s) => s.type === 'class')
              .map((s) => {
                const dec = decodeAsuClassroom(s.location);
                return (
                  <div
                    key={s.scheduleId}
                    className="p-3.5 rounded-2xl bg-[#080B14]/70 border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white">{s.title}</div>
                        <div className="text-cyan-400 font-mono text-[11px] mt-0.5">
                          {formatTime12h(s.startTime)} - {formatTime12h(s.endTime)}
                        </div>
                      </div>
                      {dec.isValid && (
                        <button
                          type="button"
                          onClick={() => focusBuildingOnMap(dec.buildingCode)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] shrink-0 cursor-pointer"
                        >
                          Locate Bldg {dec.buildingCode}
                        </button>
                      )}
                    </div>
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        {s.location} · {dec.summaryEn}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
