export interface AsuBuilding {
  code: string;
  nameEn: string;
  shortName: string;
  description: string;
  facilities: string[];
  mapX: number; // % X coordinate matching aerial ASU campus map
  mapY: number; // % Y coordinate matching aerial ASU campus map
  lat: number;
  lng: number;
  mapsUrl: string;
  category: 'academic' | 'admin' | 'sports' | 'health';
}

export const ASU_CAMPUS_MAPS_URL = 'https://maps.app.goo.gl/i5XmG6WSvkwFXwPP9';
export const ASU_AERIAL_MAP_IMAGE = '/assets/aistudio/WhatsApp_Image_2026-11-14_at_6.50.59_AM_d4459190.jpeg';

// Applied Science Private University (ASU), Shafa Badran, Amman, Jordan
// Centroid derived from official Google Maps college & building coordinates
export const ASU_CAMPUS_CENTER = {
  lat: 32.0401,
  lng: 35.9014,
  radiusMeters: 550,
};

export const ASU_BUILDINGS: AsuBuilding[] = [
  {
    code: '1',
    nameEn: 'Faculty of Information Technology',
    shortName: 'IT Faculty',
    description: 'Computer science, software engineering, cybersecurity, and AI labs.',
    facilities: ['Computer Labs', 'Apple Lab', 'Smart Classrooms', 'Auditorium'],
    mapX: 64.0,
    mapY: 39.5,
    lat: 32.0402957,
    lng: 35.9016609,
    mapsUrl: 'https://maps.app.goo.gl/7yeezRZ1gB6rmqZz5',
    category: 'academic',
  },
  {
    code: '2',
    nameEn: 'Faculty of Law and Sciences',
    shortName: 'Law & Sciences',
    description: 'Al-Bayrouni Building housing law classrooms, moot court hall, and foundational science lecture rooms.',
    facilities: ['Moot Court', 'Lecture Halls', 'Faculty Offices'],
    mapX: 77.0,
    mapY: 22.0,
    lat: 32.0411964,
    lng: 35.9025234,
    mapsUrl: 'https://maps.app.goo.gl/KYutVyHw9wPq7Ezk7',
    category: 'academic',
  },
  {
    code: '3',
    nameEn: 'Engineering Workshops',
    shortName: 'Workshops',
    description: 'Mechanical, civil, and industrial fabrication workshops and heavy testing labs.',
    facilities: ['CNC & Metal Labs', 'Material Testing', 'Safety Gear Desk'],
    mapX: 92.5,
    mapY: 43.0,
    lat: 32.039518,
    lng: 35.902958,
    mapsUrl: 'https://maps.app.goo.gl/FHSN75ivqYWACWh68',
    category: 'academic',
  },
  {
    code: '4',
    nameEn: 'Faculty of Pharmacy',
    shortName: 'Pharmacy',
    description: 'Ibn Al-Beetar Building housing pharmaceutics, pharmacology, and chemistry labs.',
    facilities: ['Pharmaceutical Labs', 'Simulation Pharmacy', 'Research Wing'],
    mapX: 73.5,
    mapY: 41.0,
    lat: 32.0402566,
    lng: 35.9019701,
    mapsUrl: 'https://maps.app.goo.gl/wewtK2KFq2wR45eSA',
    category: 'academic',
  },
  {
    code: '5',
    nameEn: 'Faculty of Business',
    shortName: 'Business',
    description: 'Ibn Al-Razi Building housing accounting, finance, marketing, and business analytics departments.',
    facilities: ['Trading Room', 'Case Study Halls', 'Dean Office'],
    mapX: 54.0,
    mapY: 39.5,
    lat: 32.0405615,
    lng: 35.9010336,
    mapsUrl: 'https://maps.app.goo.gl/nYrNWJm3ySMEhb189',
    category: 'academic',
  },
  {
    code: '6',
    nameEn: 'Sports Hall',
    shortName: 'Sports Hall',
    description: 'Main indoor multi-sport complex, events arena, and athletic facilities.',
    facilities: ['Indoor Arena', 'Gymnasium', 'Graduation Hall'],
    mapX: 63.5,
    mapY: 55.0,
    lat: 32.039436,
    lng: 35.901126,
    mapsUrl: 'https://maps.app.goo.gl/iHotTbiSvZYXWNu68',
    category: 'sports',
  },
  {
    code: '7',
    nameEn: 'Faculty of Nursing',
    shortName: 'Nursing',
    description: 'Ibn Al-Nafees Building housing clinical nursing skills labs, patient simulation wards, and lecture rooms.',
    facilities: ['Clinical Simulation Labs', 'Anatomy Room', 'Lecture Halls'],
    mapX: 89.0,
    mapY: 70.0,
    lat: 32.0381434,
    lng: 35.9020552,
    mapsUrl: 'https://maps.app.goo.gl/9ZmQdw9QmXhpQ52CA',
    category: 'academic',
  },
  {
    code: '8',
    nameEn: 'Faculty of Arts',
    shortName: 'Arts & Design',
    description: 'Faculty of Arts and Humanities classrooms, design studios, and exhibition galleries.',
    facilities: ['Design Studios', 'CAD Labs', 'Exhibition Hall'],
    mapX: 84.0,
    mapY: 42.5,
    lat: 32.0399098,
    lng: 35.90247,
    mapsUrl: 'https://maps.app.goo.gl/SqmMBFmfgEPwStax6',
    category: 'academic',
  },
  {
    code: '9',
    nameEn: 'Engineering, Arts and Sharia Colleges',
    shortName: 'Eng / Arts / Sharia',
    description: 'Main multi-wing complex for Engineering, Arts, and Sharia lecture halls and laboratories.',
    facilities: ['Central Courtyard', 'Engineering Labs', 'Lecture Wings'],
    mapX: 42.5,
    mapY: 31.0,
    lat: 32.041155,
    lng: 35.900651,
    mapsUrl: 'https://maps.app.goo.gl/BT6VS5yQVqLfd2WY8',
    category: 'academic',
  },
  {
    code: '10',
    nameEn: 'Deanship of Student Affairs',
    shortName: 'Student Affairs',
    description: 'Student clubs, activities, advising, registration support, and central auditorium.',
    facilities: ['Student Clubs', 'Main Auditorium', 'Student Lounge'],
    mapX: 19.5,
    mapY: 22.0,
    lat: 32.041835,
    lng: 35.899442,
    mapsUrl: 'https://maps.app.goo.gl/Go3YcAkTyh1UoRJk6',
    category: 'admin',
  },
  {
    code: 'G/B',
    nameEn: 'Clinics Building',
    shortName: 'Clinics (G/B)',
    description: 'University medical and dental teaching clinics open to students and visitors.',
    facilities: ['Medical Clinic', 'Dental Clinics', 'Emergency Care'],
    mapX: 85.0,
    mapY: 56.5,
    lat: 32.039154,
    lng: 35.902326,
    mapsUrl: 'https://maps.app.goo.gl/Vd7U9vv7Nf5h5rPZ8',
    category: 'health',
  },
  {
    code: '14',
    nameEn: 'Faculty of Allied Medical Sciences',
    shortName: 'Allied Medical (14)',
    description: 'Ibn Khaldoun Building housing Allied Medical Sciences laboratories and lecture rooms.',
    facilities: ['Medical Labs', 'Lecture Rooms', 'Study Zone'],
    mapX: 86.5,
    mapY: 29.0,
    lat: 32.0406221,
    lng: 35.902864,
    mapsUrl: 'https://maps.app.goo.gl/BsEbkczhprxrgXBe6',
    category: 'academic',
  },
  {
    code: '21',
    nameEn: 'Faculty of Dentistry',
    shortName: 'Dentistry (21)',
    description: 'Dental sciences lecture halls, simulation labs, and pre-clinical training.',
    facilities: ['Dental Simulation Labs', 'Radiology Unit', 'Lecture Halls'],
    mapX: 85.0,
    mapY: 49.5,
    lat: 32.039154,
    lng: 35.902326,
    mapsUrl: 'https://maps.app.goo.gl/Vd7U9vv7Nf5h5rPZ8',
    category: 'academic',
  },
];

export interface DecodedRoom {
  raw: string;
  buildingCode: string;
  buildingNameEn: string;
  floorCode: string;
  floorLabelEn: string;
  roomNumber: string;
  summaryEn: string;
  isValid: boolean;
}

const FLOOR_LABELS_EN: Record<string, string> = {
  B: 'Basement Floor (B)',
  G: 'Ground Floor (G)',
  '0': 'Ground Floor',
  '1': '1st Floor',
  '2': '2nd Floor',
  '3': '3rd Floor',
  '4': '4th Floor',
  '5': '5th Floor',
};

export function findAsuBuilding(code: string): AsuBuilding | undefined {
  const clean = code.trim().toUpperCase();
  if (clean === 'GB' || clean === 'G/B' || clean === 'G') {
    return ASU_BUILDINGS.find((b) => b.code === 'G/B');
  }
  return ASU_BUILDINGS.find((b) => b.code.toUpperCase() === clean);
}

/**
 * Decodes ASU classroom codes such as:
 * - "7106" -> Building 7 (Faculty of Nursing), 1st Floor, Room 06
 * - "1B12" -> Building 1 (Faculty of IT), Basement (B), Room 12
 * - "14203" -> Building 14 (Faculty of Allied Medical Sciences), 2nd Floor, Room 03
 * - "21105" -> Building 21 (Faculty of Dentistry), 1st Floor, Room 05
 * - "G/B12" or "GB12" -> Clinics Building (G/B), Room 12
 */
export function decodeAsuClassroom(input: string): DecodedRoom {
  const raw = (input || '').trim();
  const normalized = raw.toUpperCase().replace(/\s+/g, '').replace(/^(ROOM|HALL|LAB)/i, '');

  if (normalized.startsWith('G/B') || normalized.startsWith('GB')) {
    const bld = findAsuBuilding('G/B')!;
    const rest = normalized.replace(/^G\/?B-?/, '');
    const floorChar = rest.length >= 3 ? rest[0] : 'G';
    const roomNum = rest.length >= 3 ? rest.slice(1) : rest || '01';
    const floorLabelEn = FLOOR_LABELS_EN[floorChar] || `Floor ${floorChar}`;
    return {
      raw,
      buildingCode: bld.code,
      buildingNameEn: bld.nameEn,
      floorCode: floorChar,
      floorLabelEn,
      roomNumber: roomNum,
      summaryEn: `Bldg ${bld.code} (${bld.nameEn}) · ${floorLabelEn} · Room ${roomNum}`,
      isValid: true,
    };
  }

  const compact = normalized.replace(/-/g, '');
  let buildingCode = '';
  let remainder = '';

  const twoDigitPrefixes = ['21', '14', '10'];
  for (const prefix of twoDigitPrefixes) {
    if (compact.startsWith(prefix) && compact.length >= 4) {
      buildingCode = prefix;
      remainder = compact.slice(prefix.length);
      break;
    }
  }

  if (!buildingCode && /^[1-9]/.test(compact) && compact.length >= 3) {
    buildingCode = compact[0];
    remainder = compact.slice(1);
  }

  const building = buildingCode ? findAsuBuilding(buildingCode) : undefined;
  if (building && remainder.length >= 2) {
    const floorChar = remainder[0];
    const roomNum = remainder.slice(1);
    const floorLabelEn = FLOOR_LABELS_EN[floorChar] || `Floor ${floorChar}`;
    return {
      raw,
      buildingCode: building.code,
      buildingNameEn: building.nameEn,
      floorCode: floorChar,
      floorLabelEn,
      roomNumber: roomNum,
      summaryEn: `Bldg ${building.code} (${building.nameEn}) · ${floorLabelEn} · Room ${roomNum}`,
      isValid: true,
    };
  }

  return {
    raw,
    buildingCode: '—',
    buildingNameEn: 'ASU Campus',
    floorCode: '—',
    floorLabelEn: '',
    roomNumber: raw || '—',
    summaryEn: raw || 'Not specified',
    isValid: false,
  };
}

export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Calibrated affine projection mapping real GPS (lat, lng) inside ASU campus
 * to the percentage coordinates (mapX, mapY) on the ASU aerial campus image.
 */
export function projectGpsToMapXY(
  lat: number,
  lng: number
): { mapX: number; mapY: number; inBounds: boolean } {
  const dLat = (lat - 32.04) * 1000;
  const dLng = (lng - 35.901) * 1000;
  const rawX = 57.2398 + -6.4126 * dLat + 17.2799 * dLng;
  const rawY = 46.2266 + -15.1476 * dLat + -4.0073 * dLng;
  const inBounds = rawX >= 2 && rawX <= 98 && rawY >= 2 && rawY <= 98;
  return {
    mapX: Math.max(3, Math.min(97, Number(rawX.toFixed(2)))),
    mapY: Math.max(3, Math.min(97, Number(rawY.toFixed(2)))),
    inBounds,
  };
}

export function isInsideAsuCampus(lat: number, lng: number): {
  inside: boolean;
  distanceFromCenterMeters: number;
  nearestBuilding: AsuBuilding;
  distanceToNearestBuildingMeters: number;
} {
  const distCenter = calculateDistanceMeters(
    lat,
    lng,
    ASU_CAMPUS_CENTER.lat,
    ASU_CAMPUS_CENTER.lng
  );

  let nearest = ASU_BUILDINGS[0];
  let minDist = Infinity;
  for (const b of ASU_BUILDINGS) {
    const d = calculateDistanceMeters(lat, lng, b.lat, b.lng);
    if (d < minDist) {
      minDist = d;
      nearest = b;
    }
  }

  return {
    inside: distCenter <= ASU_CAMPUS_CENTER.radiusMeters || minDist <= 180,
    distanceFromCenterMeters: distCenter,
    nearestBuilding: nearest,
    distanceToNearestBuildingMeters: minDist,
  };
}

export function estimateWalkingMinutesToBuilding(
  fromCoords: { lat: number; lng: number } | null,
  fromBuildingCode: string | null,
  targetBuildingCode: string,
  speed: 'normal' | 'brisk' = 'normal'
): { minutes: number; meters: number; usedRealGps: boolean } {
  const target = findAsuBuilding(targetBuildingCode) || ASU_BUILDINGS[0];
  let meters = 200;
  let usedRealGps = false;

  if (fromCoords) {
    meters = calculateDistanceMeters(fromCoords.lat, fromCoords.lng, target.lat, target.lng);
    usedRealGps = true;
  } else if (fromBuildingCode) {
    const fromBld = findAsuBuilding(fromBuildingCode);
    if (fromBld) {
      meters =
        fromBld.code === target.code
          ? 25
          : Math.max(45, calculateDistanceMeters(fromBld.lat, fromBld.lng, target.lat, target.lng));
    }
  }

  const metersPerMin = speed === 'brisk' ? 100 : 75;
  const minutes = meters < 15 ? 1 : Math.max(1, Math.ceil(meters / metersPerMin));
  return { minutes, meters, usedRealGps };
}

export function formatMinutesToHours(totalMinutes: number): string {
  if (totalMinutes <= 0) return 'Now';
  const days = Math.floor(totalMinutes / 1440);
  const remAfterDays = totalMinutes % 1440;
  const hrs = Math.floor(remAfterDays / 60);
  const mins = remAfterDays % 60;

  if (days > 0) {
    if (hrs === 0) return `${days}d`;
    return `${days}d ${hrs}h`;
  }
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function parseTimeToMinutes(timeStr: string): number {
  const raw = (timeStr || '').trim().toUpperCase();
  if (!raw) return -1;

  const amPmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
  if (amPmMatch) {
    let hh = Number(amPmMatch[1]);
    const mm = Number(amPmMatch[2]);
    const period = amPmMatch[3];
    if (Number.isNaN(hh) || Number.isNaN(mm) || hh < 1 || hh > 12 || mm < 0 || mm > 59) return -1;
    if (period === 'AM' && hh === 12) hh = 0;
    if (period === 'PM' && hh < 12) hh += 12;
    return hh * 60 + mm;
  }

  const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmmMatch) {
    const hh = Number(hhmmMatch[1]);
    const mm = Number(hhmmMatch[2]);
    if (Number.isNaN(hh) || Number.isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return -1;
    return hh * 60 + mm;
  }

  return -1;
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hh = Math.floor(clamped / 60);
  const mm = clamped % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function formatTime12h(timeStr: string): string {
  const mins = parseTimeToMinutes(timeStr);
  if (mins < 0) return timeStr || '—';
  const hh24 = Math.floor(mins / 60);
  const mm = mins % 60;
  const period = hh24 >= 12 ? 'PM' : 'AM';
  const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
  return `${hh12}:${String(mm).padStart(2, '0')} ${period}`;
}

export function normalizeTimeHHMM(timeStr: string): string {
  const mins = parseTimeToMinutes(timeStr);
  return mins >= 0 ? formatMinutesToHHMM(mins) : timeStr;
}

export interface CourseTimeConflict {
  conflictingCourse: string;
  overlappingDays: string[];
  timeRange: string;
}

export function findCourseTimeConflict(
  candidate: { days: string[]; startTime: string; endTime: string },
  existingCourses: Array<{ courseName: string; days: string[]; startTime: string; endTime: string }>
): CourseTimeConflict | null {
  const candStart = parseTimeToMinutes(candidate.startTime);
  const candEnd = parseTimeToMinutes(candidate.endTime);
  if (candStart < 0 || candEnd < 0 || candEnd <= candStart) return null;

  for (const existing of existingCourses) {
    const exDays = Array.isArray(existing.days) ? existing.days : [];
    const overlappingDays = candidate.days.filter((d) => exDays.includes(d));
    if (overlappingDays.length === 0) continue;

    const exStart = parseTimeToMinutes(existing.startTime);
    const exEnd = parseTimeToMinutes(existing.endTime);
    if (exStart < 0 || exEnd < 0) continue;

    if (candStart < exEnd && candEnd > exStart) {
      return {
        conflictingCourse: existing.courseName,
        overlappingDays,
        timeRange: `${formatTime12h(existing.startTime)} - ${formatTime12h(existing.endTime)}`,
      };
    }
  }
  return null;
}

export interface BlockedTimeInterval {
  start: number;
  end: number;
  courseName: string;
  startTime: string;
  endTime: string;
}

export function getBlockedIntervalsForDays(
  days: string[],
  existingCourses: Array<{ courseName: string; days: string[]; startTime: string; endTime: string }>
): BlockedTimeInterval[] {
  const intervals: BlockedTimeInterval[] = [];
  for (const c of existingCourses) {
    const cDays = Array.isArray(c.days) ? c.days : [];
    if (!days.some((d) => cDays.includes(d))) continue;
    const start = parseTimeToMinutes(c.startTime);
    const end = parseTimeToMinutes(c.endTime);
    if (start >= 0 && end > start) {
      intervals.push({
        start,
        end,
        courseName: c.courseName,
        startTime: formatMinutesToHHMM(start),
        endTime: formatMinutesToHHMM(end),
      });
    }
  }
  return intervals.sort((a, b) => a.start - b.start);
}

export interface TimeSlotOption {
  value: string;
  label: string;
  minutes: number;
  disabled: boolean;
  blockedBy?: string;
}

const CAMPUS_DAY_START = 8 * 60; // 08:00 AM
const CAMPUS_DAY_END = 21 * 60; // 09:00 PM
const SLOT_STEP = 30; // 30-minute (half-hour) increments
const MIN_LECTURE_MINUTES = 30;

export function getStartTimeSlots(
  days: string[],
  existingCourses: Array<{ courseName: string; days: string[]; startTime: string; endTime: string }>
): TimeSlotOption[] {
  const blocked = getBlockedIntervalsForDays(days, existingCourses);
  const slots: TimeSlotOption[] = [];

  for (let m = CAMPUS_DAY_START; m <= CAMPUS_DAY_END - MIN_LECTURE_MINUTES; m += SLOT_STEP) {
    const inside = blocked.find((b) => m >= b.start && m < b.end);
    const tooCloseToNext = blocked.find(
      (b) => b.start > m && b.start < m + MIN_LECTURE_MINUTES
    );
    const blocker = inside || tooCloseToNext;
    const hhmm = formatMinutesToHHMM(m);
    slots.push({
      value: hhmm,
      label: formatTime12h(hhmm),
      minutes: m,
      disabled: Boolean(blocker),
      blockedBy: blocker?.courseName,
    });
  }
  return slots;
}

export function getEndTimeSlots(
  startTime: string,
  days: string[],
  existingCourses: Array<{ courseName: string; days: string[]; startTime: string; endTime: string }>
): TimeSlotOption[] {
  const startMins = parseTimeToMinutes(startTime);
  if (startMins < 0) return [];

  const blocked = getBlockedIntervalsForDays(days, existingCourses);
  const startInsideBlock = blocked.find((b) => startMins >= b.start && startMins < b.end);
  const nextBlock = blocked.find((b) => b.start > startMins);
  const slots: TimeSlotOption[] = [];

  for (let m = startMins + SLOT_STEP; m <= CAMPUS_DAY_END; m += SLOT_STEP) {
    if (m - startMins < MIN_LECTURE_MINUTES) continue;

    const blocker = startInsideBlock || (nextBlock && m > nextBlock.start ? nextBlock : undefined);
    const hhmm = formatMinutesToHHMM(m);
    slots.push({
      value: hhmm,
      label: formatTime12h(hhmm),
      minutes: m,
      disabled: Boolean(blocker),
      blockedBy: blocker?.courseName,
    });
  }
  return slots;
}

export function findFirstAvailableSlot(
  days: string[],
  existingCourses: Array<{ courseName: string; days: string[]; startTime: string; endTime: string }>,
  preferredDurationMins: number = 60
): { startTime: string; endTime: string } | null {
  const startSlots = getStartTimeSlots(days, existingCourses);
  const blocked = getBlockedIntervalsForDays(days, existingCourses);

  for (const passDuration of [preferredDurationMins, MIN_LECTURE_MINUTES]) {
    for (const s of startSlots) {
      if (s.disabled) continue;
      const nextBlock = blocked.find((b) => b.start > s.minutes);
      const maxEnd = nextBlock ? nextBlock.start : CAMPUS_DAY_END;
      const rawEnd = Math.min(s.minutes + preferredDurationMins, maxEnd);
      const snappedEnd = Math.floor(rawEnd / SLOT_STEP) * SLOT_STEP;
      if (snappedEnd - s.minutes >= passDuration) {
        return {
          startTime: s.value,
          endTime: formatMinutesToHHMM(snappedEnd),
        };
      }
    }
  }
  return null;
}

const WEEK_DAY_CODES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface NextScheduledCourseResult<T> {
  course: T;
  minutesUntilStart: number;
  minutesRemaining: number;
  isOngoing: boolean;
  dayOffset: number;
  dayLabel: string;
}

export function getNextScheduledCourse<
  T extends { days: string[]; startTime: string; endTime: string }
>(courses: T[], nowDate: Date = new Date()): NextScheduledCourseResult<T> | null {
  if (!courses || courses.length === 0) return null;

  const todayIdx = nowDate.getDay();
  const currentMins = nowDate.getHours() * 60 + nowDate.getMinutes();

  let best: NextScheduledCourseResult<T> | null = null;

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const dayCode = WEEK_DAY_CODES[(todayIdx + dayOffset) % 7];

    for (const course of courses) {
      const hasDays = Array.isArray(course.days) && course.days.length > 0;
      if (hasDays && !course.days.includes(dayCode)) continue;

      const startMins = parseTimeToMinutes(course.startTime);
      const endMins = parseTimeToMinutes(course.endTime);
      if (startMins < 0) continue;
      const effectiveEnd = endMins > startMins ? endMins : startMins + 60;

      if (dayOffset === 0) {
        if (currentMins >= startMins && currentMins < effectiveEnd) {
          // Lecture currently in progress!
          return {
            course,
            minutesUntilStart: 0,
            minutesRemaining: effectiveEnd - currentMins,
            isOngoing: true,
            dayOffset: 0,
            dayLabel: 'Now',
          };
        }
        if (startMins > currentMins) {
          const diff = startMins - currentMins;
          if (!best || diff < best.minutesUntilStart) {
            best = {
              course,
              minutesUntilStart: diff,
              minutesRemaining: effectiveEnd - startMins,
              isOngoing: false,
              dayOffset: 0,
              dayLabel: 'Today',
            };
          }
        }
      } else {
        const diff = dayOffset * 1440 + (startMins - currentMins);
        if (!best || diff < best.minutesUntilStart) {
          best = {
            course,
            minutesUntilStart: diff,
            minutesRemaining: effectiveEnd - startMins,
            isOngoing: false,
            dayOffset,
            dayLabel: dayOffset === 1 ? 'Tomorrow' : dayCode,
          };
        }
      }
    }

    if (best) break;
  }

  return best;
}
