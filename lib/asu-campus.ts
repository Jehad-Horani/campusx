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
  category: 'academic' | 'admin' | 'sports' | 'health';
}

export const ASU_CAMPUS_MAPS_URL = 'https://maps.app.goo.gl/i5XmG6WSvkwFXwPP9';
export const ASU_AERIAL_MAP_IMAGE = '/assets/aistudio/WhatsApp_Image_2026-11-14_at_6.50.59_AM_d4459190.jpeg';

// Applied Science Private University (ASU), Shafa Badran, Amman, Jordan
export const ASU_CAMPUS_CENTER = {
  lat: 32.0403,
  lng: 35.9006,
  radiusMeters: 650,
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
    lat: 32.0409,
    lng: 35.8998,
    category: 'academic',
  },
  {
    code: '2',
    nameEn: 'Faculty of Law & Sciences',
    shortName: 'Law & Sciences',
    description: 'Law classrooms, moot court hall, and foundational science lecture rooms.',
    facilities: ['Moot Court', 'Lecture Halls', 'Faculty Offices'],
    mapX: 77.0,
    mapY: 22.0,
    lat: 32.0414,
    lng: 35.9013,
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
    lat: 32.0406,
    lng: 35.9025,
    category: 'academic',
  },
  {
    code: '4',
    nameEn: 'Faculty of Pharmacy',
    shortName: 'Pharmacy',
    description: 'Ibn Al-Bitar building housing pharmaceutics, pharmacology, and chemistry labs.',
    facilities: ['Pharmaceutical Labs', 'Simulation Pharmacy', 'Research Wing'],
    mapX: 73.5,
    mapY: 41.0,
    lat: 32.0404,
    lng: 35.9012,
    category: 'academic',
  },
  {
    code: '5',
    nameEn: 'Faculty of Business',
    shortName: 'Business',
    description: 'Accounting, finance, marketing, and business analytics departments.',
    facilities: ['Trading Room', 'Case Study Halls', 'Dean Office'],
    mapX: 54.0,
    mapY: 39.5,
    lat: 32.0406,
    lng: 35.8996,
    category: 'academic',
  },
  {
    code: '6',
    nameEn: 'Sports Hall & Arena',
    shortName: 'Sports Hall',
    description: 'Main indoor multi-sport complex, events arena, and athletic facilities.',
    facilities: ['Indoor Arena', 'Gymnasium', 'Graduation Hall'],
    mapX: 63.5,
    mapY: 55.0,
    lat: 32.0397,
    lng: 35.9004,
    category: 'sports',
  },
  {
    code: '7',
    nameEn: 'Faculty of Nursing',
    shortName: 'Nursing',
    description: 'Clinical nursing skills labs, patient simulation wards, and lecture rooms.',
    facilities: ['Clinical Simulation Labs', 'Anatomy Room', 'Lecture Halls'],
    mapX: 89.0,
    mapY: 70.0,
    lat: 32.0389,
    lng: 35.9022,
    category: 'academic',
  },
  {
    code: '8',
    nameEn: 'Faculty of Arts & Design',
    shortName: 'Arts & Design',
    description: 'Graphic design, interior architecture studios, and exhibition galleries.',
    facilities: ['Design Studios', 'CAD Labs', 'Exhibition Hall'],
    mapX: 84.0,
    mapY: 42.5,
    lat: 32.0403,
    lng: 35.9019,
    category: 'academic',
  },
  {
    code: '9',
    nameEn: 'Faculty of Engineering, Arts & Sharia',
    shortName: 'Engineering Complex',
    description: 'Main multi-wing complex for engineering, humanities, and Sharia classrooms.',
    facilities: ['Central Courtyard', 'Engineering Labs', 'Lecture Wings'],
    mapX: 42.5,
    mapY: 31.0,
    lat: 32.0411,
    lng: 35.8991,
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
    lat: 32.0415,
    lng: 35.8977,
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
    lat: 32.0396,
    lng: 35.9021,
    category: 'health',
  },
  {
    code: '14',
    nameEn: 'Faculty of Science',
    shortName: 'Science (14)',
    description: 'Physics, chemistry, biology, and mathematics teaching laboratories.',
    facilities: ['Science Labs', 'Lecture Rooms', 'Study Zone'],
    mapX: 86.5,
    mapY: 29.0,
    lat: 32.0411,
    lng: 35.9021,
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
    lat: 32.0399,
    lng: 35.9021,
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
 * - "14203" -> Building 14 (Faculty of Science), 2nd Floor, Room 03
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
    inside: distCenter <= ASU_CAMPUS_CENTER.radiusMeters,
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
): { minutes: number; meters: number } {
  const target = findAsuBuilding(targetBuildingCode) || ASU_BUILDINGS[0];
  let meters = 200;

  if (fromCoords) {
    meters = calculateDistanceMeters(fromCoords.lat, fromCoords.lng, target.lat, target.lng);
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
  const minutes = Math.max(1, Math.ceil(meters / metersPerMin));
  return { minutes, meters };
}
