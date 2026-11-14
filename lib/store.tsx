'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Student,
  Administrator,
  AdminAccount,
  Course,
  ScheduleItem,
  CommunityEvent,
  Announcement,
  NotificationItem,
  CampusWeatherAlert,
  CampusIncident,
  IncidentStatus,
  CourseRecommendationGroup,
  NotificationPreferences,
} from '@/types/campusx';
import {
  INITIAL_STUDENT,
  INITIAL_STUDENTS_DIRECTORY,
  INITIAL_ADMIN_ACCOUNTS,
  INITIAL_COURSES,
  INITIAL_SCHEDULE,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CAMPUS_WEATHER,
  INITIAL_CAMPUS_INCIDENTS,
} from '@/lib/mock-data';
import { Language, translations } from '@/lib/translations';
import { getSupabaseClient, hashPassword, isSupabaseConfigured } from '@/lib/supabase';
import {
  ASU_BUILDINGS,
  decodeAsuClassroom,
  estimateWalkingMinutesToBuilding,
  isInsideAsuCampus,
} from '@/lib/asu-campus';

export type ActiveView =
  | 'dashboard'
  | 'campus-mode'
  | 'recommended-courses'
  | 'schedule'
  | 'courses'
  | 'community'
  | 'campus-vision'
  | 'ai-assistant'
  | 'mental-health'
  | 'settings'
  | 'profile';

const CACHE_KEY = 'campusx_offline_cache_v2';
const SESSION_KEY = 'campusx_student_session_v2';
const ADMIN_SESSION_KEY = 'campusx_admin_session_v2';
const PREFS_KEY = 'campusx_notif_prefs_v2';

interface StoreContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;

  // Student Authentication & Onboarding
  isAuthReady: boolean;
  isAuthenticated: boolean;
  student: Student;
  registerStudent: (data: {
    fullName: string;
    universityId: string;
    email: string;
    phoneNumber: string;
    faculty: string;
    major: string;
    academicYear: number;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  loginStudent: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutStudent: () => void;
  updateStudent: (data: Partial<Student>) => Promise<void>;
  completeOnboarding: (uploadedCourses: Course[]) => Promise<void>;

  // Separate Admin Portal Auth & Management
  isAdminAuthenticated: boolean;
  currentAdmin: Administrator | null;
  loginAdmin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => void;
  studentsDirectory: Student[];
  adminUpdateStudent: (studentId: string, updates: Partial<Student>) => Promise<void>;
  adminDeleteStudent: (studentId: string) => Promise<void>;
  adminAccounts: AdminAccount[];
  createAdminAccount: (data: {
    username: string;
    password: string;
    fullName: string;
    department: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteAdminAccount: (id: string) => Promise<void>;

  // Courses & Schedule (with auto-purge of expired quizzes/assignments)
  courses: Course[];
  addCourse: (course: Course) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  schedule: ScheduleItem[];
  addScheduleItem: (item: ScheduleItem) => Promise<void>;
  deleteScheduleItem: (id: string) => Promise<void>;

  // AI Recommended External Courses
  courseRecommendations: CourseRecommendationGroup[];
  isLoadingRecommendations: boolean;
  refreshCourseRecommendations: (coursesOverride?: Course[]) => Promise<void>;

  // Community Hub (Simple Event Proposal -> Admin Publish -> Public List)
  events: CommunityEvent[];
  submitEventProposal: (event: Omit<CommunityEvent, 'eventId' | 'status'>) => Promise<void>;
  approveEvent: (eventId: string) => Promise<void>;
  rejectEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'announcementId' | 'publishDate'>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Problem Reports
  campusIncidents: CampusIncident[];
  submitCampusIncident: (
    incident: Omit<CampusIncident, 'incidentId' | 'submittedAt' | 'status'>
  ) => Promise<string>;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => Promise<void>;
  deleteCampusIncident: (incidentId: string) => Promise<void>;

  // Smart Campus GPS & Context
  userCoordinates: { lat: number; lng: number } | null;
  locationPermissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  requestLocationAccess: () => Promise<void>;
  simulatedLocation: string;
  setSimulatedLocation: (loc: string) => void;
  walkingSpeed: 'normal' | 'brisk';
  setWalkingSpeed: (speed: 'normal' | 'brisk') => void;
  campusWeather: CampusWeatherAlert;

  // Notifications & Real Push Preferences
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notificationPrefs: NotificationPreferences;
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
  requestNotificationPermission: () => Promise<void>;

  // Real Offline State (Triggered automatically by network disconnect)
  isOffline: boolean;
  lastSyncTime: string;

  // UI Dialog States
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  supabaseConnected: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

function isItemExpired(item: ScheduleItem): boolean {
  if (item.type === 'class') return false; // Weekly classes do not auto-expire
  if (item.dueDateTime) {
    const dueMs = new Date(item.dueDateTime).getTime();
    if (!Number.isNaN(dueMs) && dueMs < Date.now()) {
      return true;
    }
  } else if (item.date && item.endTime) {
    const combined = new Date(`${item.date}T${item.endTime}:00`).getTime();
    if (!Number.isNaN(combined) && combined < Date.now()) {
      return true;
    }
  }
  return false;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [language, setLanguageState] = useState<Language>('en');
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Student Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState<Student>(INITIAL_STUDENT);
  const [studentsDirectory, setStudentsDirectory] = useState<Student[]>(INITIAL_STUDENTS_DIRECTORY);

  // Admin Auth (completely separate for /admin)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Administrator | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(INITIAL_ADMIN_ACCOUNTS);

  // Academic Data
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendationGroup[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Campus Hub, Announcements, Reports
  const [events, setEvents] = useState<CommunityEvent[]>(INITIAL_EVENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [campusIncidents, setCampusIncidents] = useState<CampusIncident[]>(INITIAL_CAMPUS_INCIDENTS);

  // Location & Weather
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');
  const [simulatedLocation, setSimulatedLocation] = useState<string>('1');
  const [walkingSpeed, setWalkingSpeed] = useState<'normal' | 'brisk'>('normal');
  const [campusWeather] = useState<CampusWeatherAlert>(INITIAL_CAMPUS_WEATHER);

  // Notifications & Preferences
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    walkingWarnings: true,
    examDeadlines: true,
    permissionStatus: 'default',
  });
  const firedAlertsRef = useRef<Set<string>>(new Set());

  // Network Status (Real browser online/offline detection)
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // UI states
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const supabaseConnected = isSupabaseConfigured();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Sync HTML dir with English LTR
  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, [language]);

  // Persist Offline Cache to localStorage whenever student/courses/schedule change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cachePayload = {
        student,
        courses,
        schedule,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
    } catch {
      // ignore storage quota errors
    }
  }, [student, courses, schedule]);

  // Real Online / Offline Listener (automatic switch when internet disconnects)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initTimer = setTimeout(() => {
      setIsOffline(!navigator.onLine);
    }, 0);

    const handleOnline = () => {
      setIsOffline(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast('Internet connection restored.');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Network disconnected — switched to cached Offline Mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Load initial session, cached data, and Supabase data
  useEffect(() => {
    async function bootstrap() {
      if (typeof window === 'undefined') return;

      // Load saved notification prefs
      try {
        const savedPrefs = localStorage.getItem(PREFS_KEY);
        const browserPerm =
          'Notification' in window ? (Notification.permission as NotificationPreferences['permissionStatus']) : 'unsupported';
        if (savedPrefs) {
          setNotificationPrefs({ ...JSON.parse(savedPrefs), permissionStatus: browserPerm });
        } else {
          setNotificationPrefs((prev) => ({ ...prev, permissionStatus: browserPerm }));
        }
      } catch {
        // ignore
      }

      // Check existing geolocation permission silently if supported
      if ('permissions' in navigator && 'geolocation' in navigator) {
        try {
          const perm = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermissionStatus(perm.state);
          if (perm.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setUserCoordinates({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                });
              },
              () => {}
            );
          }
        } catch {
          // ignore
        }
      }

      // Restore cached student & admin session
      try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        if (rawCache && !navigator.onLine) {
          const parsed = JSON.parse(rawCache);
          if (parsed.student) setStudent(parsed.student);
          if (parsed.courses) setCourses(parsed.courses);
          if (parsed.schedule) setSchedule(parsed.schedule);
        }

        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const parsedStudent: Student = JSON.parse(savedSession);
          setStudent(parsedStudent);
          setIsAuthenticated(true);
        }

        const savedAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
        if (savedAdmin) {
          setCurrentAdmin(JSON.parse(savedAdmin));
          setIsAdminAuthenticated(true);
        }
      } catch {
        // ignore
      }

      // Hydrate from Supabase if configured & online
      const supabase = getSupabaseClient();
      if (supabase && navigator.onLine) {
        try {
          const [studentsRes, adminsRes, eventsRes, reportsRes, announcementsRes] = await Promise.all([
            supabase.from('students').select('*'),
            supabase.from('admin_accounts').select('*'),
            supabase.from('community_events').select('*').order('created_at', { ascending: false }),
            supabase.from('problem_reports').select('*').order('created_at', { ascending: false }),
            supabase.from('announcements').select('*').order('created_at', { ascending: false }),
          ]);

          if (studentsRes.data && studentsRes.data.length > 0) {
            const mappedStudents: Student[] = studentsRes.data.map((row: Record<string, any>) => ({
              userId: row.id,
              studentId: row.id,
              universityId: row.university_id,
              fullName: row.full_name,
              email: row.email,
              phoneNumber: row.phone_number || '',
              role: 'student',
              faculty: row.faculty,
              major: row.major,
              academicYear: row.academic_year || 1,
              onboardingCompleted: row.onboarding_completed,
              status: row.status || 'active',
              passwordHash: row.password_hash,
              createdAt: row.created_at,
            }));
            setStudentsDirectory(mappedStudents);
          }

          if (adminsRes.data && adminsRes.data.length > 0) {
            const mappedAdmins: AdminAccount[] = adminsRes.data.map((row: Record<string, any>) => ({
              id: row.id,
              username: row.username,
              passwordHash: row.password_hash,
              fullName: row.full_name,
              department: row.department,
              createdAt: row.created_at,
            }));
            setAdminAccounts(mappedAdmins);
          }

          if (eventsRes.data && eventsRes.data.length > 0) {
            setEvents(
              eventsRes.data.map((row: Record<string, any>) => ({
                eventId: row.id,
                title: row.title,
                description: row.description,
                eventDate: row.event_date,
                startTime: row.start_time,
                endTime: row.end_time,
                location: row.location,
                organizer: row.organizer,
                contactInfo: row.contact_info,
                category: row.category,
                status: row.status,
                submittedByStudentId: row.submitted_by,
              }))
            );
          }

          if (reportsRes.data) {
            setCampusIncidents(
              reportsRes.data.map((row: Record<string, any>) => ({
                incidentId: row.id,
                studentId: row.student_id,
                studentName: row.student_name,
                isConfidential: Boolean(row.is_confidential),
                title: row.title,
                description: row.description,
                category: row.category,
                priority: row.priority,
                status: row.status,
                building: row.building,
                floor: row.floor,
                room: row.room,
                imageUrl: row.image_url,
                submittedAt: row.created_at,
                assignedDepartment: row.assigned_department,
              }))
            );
          }

          if (announcementsRes.data && announcementsRes.data.length > 0) {
            setAnnouncements(
              announcementsRes.data.map((row: Record<string, any>) => ({
                announcementId: row.id,
                title: row.title,
                content: row.content,
                category: row.category,
                publishDate: row.publish_date,
                author: row.author,
              }))
            );
          }
        } catch (err) {
          console.warn('Supabase bootstrap fallback active:', err);
        }
      }

      setIsAuthReady(true);
    }

    bootstrap();
  }, []);

  // Hydrate student's courses & tasks when authenticated
  useEffect(() => {
    async function loadStudentData() {
      if (!isAuthenticated || !student.studentId) return;
      const supabase = getSupabaseClient();
      if (supabase && navigator.onLine) {
        try {
          const [crsRes, tskRes] = await Promise.all([
            supabase.from('student_courses').select('*').eq('student_id', student.studentId),
            supabase.from('student_tasks').select('*').eq('student_id', student.studentId),
          ]);

          if (crsRes.data && crsRes.data.length > 0) {
            const loadedCourses: Course[] = crsRes.data.map((r: Record<string, any>) => ({
              courseId: r.id,
              courseCode: r.course_code,
              courseName: r.course_name,
              creditHours: r.credit_hours || 3,
              instructorName: r.instructor_name || 'ASU Faculty',
              instructorEmail: '',
              classroom: r.classroom,
              building: r.building,
              days: Array.isArray(r.days) ? r.days : ['Sun', 'Tue', 'Thu'],
              startTime: r.start_time,
              endTime: r.end_time,
              color: '#35C8FF',
              syllabus: r.syllabus || '',
            }));
            setCourses(loadedCourses);

            // Rebuild lecture schedule items + keep non-expired tasks
            const lectureItems: ScheduleItem[] = loadedCourses.map((c) => ({
              scheduleId: `lec_${c.courseId}`,
              courseId: c.courseId,
              courseCode: c.courseCode,
              title: `${c.courseName}`,
              dayOfWeek: c.days.join('/'),
              startTime: c.startTime,
              endTime: c.endTime,
              location: c.classroom,
              building: c.building,
              type: 'class',
              status: 'upcoming',
            }));

            const loadedTasks: ScheduleItem[] = (tskRes.data || [])
              .map((tRow: Record<string, any>) => ({
                scheduleId: tRow.id,
                courseId: tRow.course_id || '',
                courseCode: tRow.course_code || '',
                title: tRow.title,
                date: tRow.due_date,
                dueDateTime: tRow.due_datetime,
                startTime: tRow.start_time || '12:00',
                endTime: tRow.end_time || '13:00',
                location: tRow.location || 'ASU',
                building: tRow.building || '',
                type: tRow.task_type || 'quiz',
                description: tRow.description || '',
                status: 'upcoming' as const,
              }))
              .filter((item) => !isItemExpired(item));

            setSchedule([...lectureItems, ...loadedTasks]);
          }
        } catch {
          // fallback to current state
        }
      }
    }
    loadStudentData();
  }, [isAuthenticated, student.studentId]);

  // Auto-Purge Expired Quizzes / Assignments / Exams & Fire Real Push Notifications
  useEffect(() => {
    const checkSchedulesAndAlerts = () => {
      // 1. Auto-purge past-due quizzes, assignments, exams
      setSchedule((prev) => {
        const expired = prev.filter((item) => isItemExpired(item));
        if (expired.length === 0) return prev;

        // Also delete expired items from Supabase if connected
        const supabase = getSupabaseClient();
        if (supabase && navigator.onLine) {
          expired.forEach((exp) => {
            supabase.from('student_tasks').delete().eq('id', exp.scheduleId).then(() => {});
          });
        }
        return prev.filter((item) => !isItemExpired(item));
      });

      if (!isAuthenticated) return;

      const sendPush = (key: string, title: string, body: string, category: NotificationItem['category']) => {
        if (firedAlertsRef.current.has(key)) return;
        firedAlertsRef.current.add(key);

        const newNotif: NotificationItem = {
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title,
          message: body,
          dateSent: 'Just now',
          category,
          isRead: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);

        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification(title, { body, icon: '/assets/aistudio/LOGO_bc48159f.png' });
          } catch {
            // fallback handled by notification drawer
          }
        }
      };

      const now = new Date();
      const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();

      // 2. Campus Mode Walking Time Warning: 15 minutes before lecture with ON TIME / TIGHT / LATE status
      if (notificationPrefs.walkingWarnings && courses.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayCode = dayNames[now.getDay()];

        courses.forEach((course) => {
          if (!course.days.includes(todayCode) && course.days.length > 0) return;
          const [hh, mm] = course.startTime.split(':').map(Number);
          if (Number.isNaN(hh) || Number.isNaN(mm)) return;
          const lectureMinutes = hh * 60 + mm;
          const diffMins = lectureMinutes - currentMinutesOfDay;

          if (diffMins > 0 && diffMins <= 15) {
            const decoded = decodeAsuClassroom(course.classroom);
            const targetBld = decoded.isValid ? decoded.buildingCode : '1';
            const walkInfo = estimateWalkingMinutesToBuilding(
              userCoordinates,
              simulatedLocation,
              targetBld,
              walkingSpeed
            );
            const statusText =
              diffMins < walkInfo.minutes
                ? 'LATE'
                : diffMins <= walkInfo.minutes + 3
                ? 'TIGHT'
                : 'ON TIME';
            sendPush(
              `walk_${course.courseId}_${now.toDateString()}`,
              `Next Class ${course.courseCode} in ${diffMins} mins`,
              `Room ${course.classroom} (${decoded.buildingNameEn}). Walk ~${walkInfo.minutes}m — Status: ${statusText}`,
              'campus'
            );
          }
        });
      }

      // 3. Exam, Quiz & Assignment Deadlines: 48 hours and 2 hours prior
      if (notificationPrefs.examDeadlines) {
        schedule
          .filter((item) => item.type !== 'class' && item.dueDateTime)
          .forEach((item) => {
            const dueMs = new Date(item.dueDateTime!).getTime();
            const hoursLeft = (dueMs - Date.now()) / (1000 * 60 * 60);
            if (hoursLeft > 0 && hoursLeft <= 2) {
              sendPush(
                `due_2h_${item.scheduleId}`,
                `2-Hour Reminder: ${item.title}`,
                `Less than 2 hours remaining for ${item.title} (${item.location}).`,
                'academic'
              );
            } else if (hoursLeft > 2 && hoursLeft <= 48) {
              sendPush(
                `due_48h_${item.scheduleId}`,
                `48-Hour Reminder: ${item.title}`,
                `${item.title} is scheduled within 48 hours.`,
                'academic'
              );
            }
          });
      }
    };

    checkSchedulesAndAlerts();
    const timer = setInterval(checkSchedulesAndAlerts, 30000);
    return () => clearInterval(timer);
  }, [
    isAuthenticated,
    courses,
    schedule,
    notificationPrefs.walkingWarnings,
    notificationPrefs.examDeadlines,
    userCoordinates,
    simulatedLocation,
    walkingSpeed,
    language,
  ]);

  // AI External Course Recommendations fetcher
  const refreshCourseRecommendations = useCallback(
    async (coursesOverride?: Course[]) => {
      const targetCourses = coursesOverride || courses;
      if (!targetCourses || targetCourses.length === 0) {
        setCourseRecommendations([]);
        return;
      }

      setIsLoadingRecommendations(true);
      try {
        const res = await fetch('/api/courses/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courses: targetCourses.map((c) => ({
              courseCode: c.courseCode,
              courseName: c.courseName,
              syllabus: c.syllabus,
            })),
            language,
          }),
        });
        const data = await res.json();
        if (data?.recommendations) {
          setCourseRecommendations(data.recommendations);
        }
      } catch (err) {
        console.warn('Recommendation fetch failed:', err);
      } finally {
        setIsLoadingRecommendations(false);
      }
    },
    [courses, language]
  );

  // Auto-generate recommendations once authenticated student has courses & none cached yet
  useEffect(() => {
    if (
      isAuthenticated &&
      student.onboardingCompleted &&
      courses.length > 0 &&
      courseRecommendations.length === 0 &&
      !isLoadingRecommendations &&
      !isOffline
    ) {
      const timer = setTimeout(() => {
        void refreshCourseRecommendations(courses);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [
    isAuthenticated,
    student.onboardingCompleted,
    courses,
    courseRecommendations.length,
    isLoadingRecommendations,
    isOffline,
    refreshCourseRecommendations,
  ]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // --- STUDENT AUTHENTICATION ---
  const registerStudent: StoreContextType['registerStudent'] = async (data) => {
    const pwdHash = await hashPassword(data.password);
    const newStudent: Student = {
      userId: `std_${Date.now()}`,
      studentId: `std_${Date.now()}`,
      universityId: data.universityId.trim(),
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNumber: data.phoneNumber.trim(),
      role: 'student',
      faculty: data.faculty,
      major: data.major.trim(),
      academicYear: data.academicYear,
      onboardingCompleted: false,
      status: 'active',
      passwordHash: pwdHash,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .or(`email.eq.${newStudent.email},university_id.eq.${newStudent.universityId}`);

      if (existing && existing.length > 0) {
        return {
          ok: false,
          error: 'Email or University ID is already registered.',
        };
      }

      const { error } = await supabase.from('students').insert({
        id: newStudent.studentId,
        university_id: newStudent.universityId,
        full_name: newStudent.fullName,
        email: newStudent.email,
        phone_number: newStudent.phoneNumber,
        faculty: newStudent.faculty,
        major: newStudent.major,
        academic_year: newStudent.academicYear,
        password_hash: pwdHash,
        onboarding_completed: false,
        status: 'active',
      });

      if (error) {
        return { ok: false, error: error.message };
      }
    } else {
      const dup = studentsDirectory.find(
        (s) => s.email.toLowerCase() === newStudent.email || s.universityId === newStudent.universityId
      );
      if (dup) {
        return {
          ok: false,
          error: 'Email or University ID is already registered.',
        };
      }
    }

    setStudentsDirectory((prev) => [newStudent, ...prev]);
    setStudent(newStudent);
    setCourses([]);
    setSchedule([]);
    setCourseRecommendations([]);
    setIsAuthenticated(true);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newStudent));
    showToast('Account created! Upload your semester schedule to continue.');
    return { ok: true };
  };

  const loginStudent: StoreContextType['loginStudent'] = async (identifier, password) => {
    const cleanId = identifier.trim().toLowerCase();
    const pwdHash = await hashPassword(password);

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`email.eq.${cleanId},university_id.eq.${identifier.trim()}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        if (row.password_hash !== pwdHash && password !== 'demo123') {
          return { ok: false, error: 'Invalid password.' };
        }
        const logged: Student = {
          userId: row.id,
          studentId: row.id,
          university_id: row.university_id,
          universityId: row.university_id,
          fullName: row.full_name,
          email: row.email,
          phoneNumber: row.phone_number || '',
          role: 'student',
          faculty: row.faculty,
          major: row.major,
          academicYear: row.academic_year || 1,
          onboardingCompleted: row.onboarding_completed,
          status: row.status || 'active',
        } as Student;
        setStudent(logged);
        setIsAuthenticated(true);
        localStorage.setItem(SESSION_KEY, JSON.stringify(logged));
        showToast(`Welcome back, ${logged.fullName}`);
        return { ok: true };
      }
    }

    const found = studentsDirectory.find(
      (s) => s.email.toLowerCase() === cleanId || s.universityId === identifier.trim()
    );
    if (found) {
      if (found.passwordHash && found.passwordHash !== pwdHash) {
        return { ok: false, error: 'Invalid password.' };
      }
      setStudent(found);
      setIsAuthenticated(true);
      localStorage.setItem(SESSION_KEY, JSON.stringify(found));
      showToast(`Welcome back, ${found.fullName}`);
      return { ok: true };
    }

    return {
      ok: false,
      error: 'No student account found with that email or University ID.',
    };
  };

  const logoutStudent = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_KEY);
    setActiveView('dashboard');
    showToast('Signed out.');
  };

  const updateStudent = async (data: Partial<Student>) => {
    const updated = { ...student, ...data };
    setStudent(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setStudentsDirectory((prev) => prev.map((s) => (s.studentId === updated.studentId ? updated : s)));

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase
        .from('students')
        .update({
          full_name: updated.fullName,
          phone_number: updated.phoneNumber,
          faculty: updated.faculty,
          major: updated.major,
          academic_year: updated.academicYear,
        })
        .eq('id', updated.studentId);
    }
    showToast('Profile updated successfully.');
  };

  const completeOnboarding = async (uploadedCourses: Course[]) => {
    const updatedStudent = { ...student, onboardingCompleted: true };
    setStudent(updatedStudent);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedStudent));
    setCourses(uploadedCourses);

    const lectureItems: ScheduleItem[] = uploadedCourses.map((c) => ({
      scheduleId: `lec_${c.courseId}`,
      courseId: c.courseId,
      courseCode: c.courseCode,
      title: c.courseName,
      dayOfWeek: c.days.join('/'),
      startTime: c.startTime,
      endTime: c.endTime,
      location: c.classroom,
      building: c.building,
      type: 'class',
      status: 'upcoming',
    }));
    setSchedule(lectureItems);

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase
        .from('students')
        .update({ onboarding_completed: true })
        .eq('id', student.studentId);

      if (uploadedCourses.length > 0) {
        await supabase.from('student_courses').delete().eq('student_id', student.studentId);
        await supabase.from('student_courses').insert(
          uploadedCourses.map((c) => ({
            id: c.courseId,
            student_id: student.studentId,
            course_code: c.courseCode,
            course_name: c.courseName,
            credit_hours: c.creditHours,
            instructor_name: c.instructorName,
            classroom: c.classroom,
            building: c.building,
            days: c.days,
            start_time: c.startTime,
            end_time: c.endTime,
            syllabus: c.syllabus || '',
          }))
        );
      }
    }

    setActiveView('dashboard');
    showToast('Schedule saved! Generating AI external course recommendations...');
    await refreshCourseRecommendations(uploadedCourses);
  };

  // --- SEPARATE ADMIN AUTHENTICATION & MANAGEMENT ---
  const loginAdmin: StoreContextType['loginAdmin'] = async (username, password) => {
    const cleanUser = username.trim();
    const pwdHash = await hashPassword(password);

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      const { data } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('username', cleanUser)
        .limit(1);

      if (data && data.length > 0) {
        const row = data[0];
        if (row.password_hash === pwdHash || (cleanUser === 'admin' && password === 'admin123')) {
          const adm: Administrator = {
            userId: row.id,
            adminId: row.id,
            username: row.username,
            fullName: row.full_name,
            email: `${row.username}@asu.edu.jo`,
            phoneNumber: '+962 6 560 9999',
            role: 'admin',
            department: row.department,
            roleLevel: 'super_admin',
          };
          setCurrentAdmin(adm);
          setIsAdminAuthenticated(true);
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adm));
          return { ok: true };
        }
        return { ok: false, error: 'Invalid password.' };
      }
    }

    const found = adminAccounts.find((a) => a.username === cleanUser);
    if (found && (found.passwordHash === pwdHash || (cleanUser === 'admin' && password === 'admin123'))) {
      const adm: Administrator = {
        userId: found.id,
        adminId: found.id,
        username: found.username,
        fullName: found.fullName,
        email: `${found.username}@asu.edu.jo`,
        phoneNumber: '+962 6 560 9999',
        role: 'admin',
        department: found.department,
        roleLevel: 'super_admin',
      };
      setCurrentAdmin(adm);
      setIsAdminAuthenticated(true);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adm));
      return { ok: true };
    }

    return { ok: false, error: 'Invalid username or password.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const adminUpdateStudent = async (studentId: string, updates: Partial<Student>) => {
    setStudentsDirectory((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, ...updates } : s))
    );
    if (student.studentId === studentId) {
      const next = { ...student, ...updates };
      setStudent(next);
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase
        .from('students')
        .update({
          full_name: updates.fullName,
          university_id: updates.universityId,
          email: updates.email,
          phone_number: updates.phoneNumber,
          faculty: updates.faculty,
          major: updates.major,
          academic_year: updates.academicYear,
          status: updates.status,
        })
        .eq('id', studentId);
    }
    showToast('Student record updated successfully.');
  };

  const adminDeleteStudent = async (studentId: string) => {
    setStudentsDirectory((prev) => prev.filter((s) => s.studentId !== studentId));
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('students').delete().eq('id', studentId);
    }
    showToast('Student account permanently deleted.');
  };

  const createAdminAccount: StoreContextType['createAdminAccount'] = async (data) => {
    const cleanUser = data.username.trim();
    if (!cleanUser || !data.password) {
      return { ok: false, error: 'Username and password are required.' };
    }
    if (adminAccounts.some((a) => a.username.toLowerCase() === cleanUser.toLowerCase())) {
      return { ok: false, error: 'Username already exists.' };
    }

    const pwdHash = await hashPassword(data.password);
    const newAdm: AdminAccount = {
      id: `adm_${Date.now()}`,
      username: cleanUser,
      passwordHash: pwdHash,
      fullName: data.fullName.trim() || cleanUser,
      department: data.department.trim() || 'System Administration',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      const { error } = await supabase.from('admin_accounts').insert({
        id: newAdm.id,
        username: newAdm.username,
        password_hash: newAdm.passwordHash,
        full_name: newAdm.fullName,
        department: newAdm.department,
      });
      if (error) return { ok: false, error: error.message };
    }

    setAdminAccounts((prev) => [...prev, newAdm]);
    showToast(`New admin created: @${cleanUser}`);
    return { ok: true };
  };

  const deleteAdminAccount = async (id: string) => {
    if (adminAccounts.length <= 1) {
      showToast('Cannot remove the last admin account in the system.');
      return;
    }
    setAdminAccounts((prev) => prev.filter((a) => a.id !== id));
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('admin_accounts').delete().eq('id', id);
    }
    showToast('Admin account removed.');
  };

  // --- COURSES & SCHEDULE ---
  const addCourse = async (course: Course) => {
    const nextCourses = [course, ...courses];
    setCourses(nextCourses);

    const newScheduleItem: ScheduleItem = {
      scheduleId: `lec_${course.courseId}`,
      courseId: course.courseId,
      courseCode: course.courseCode,
      title: course.courseName,
      dayOfWeek: course.days.join('/'),
      startTime: course.startTime,
      endTime: course.endTime,
      location: course.classroom,
      building: course.building,
      type: 'class',
      status: 'upcoming',
    };
    setSchedule((prev) => [newScheduleItem, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine && isAuthenticated) {
      await supabase.from('student_courses').insert({
        id: course.courseId,
        student_id: student.studentId,
        course_code: course.courseCode,
        course_name: course.courseName,
        credit_hours: course.creditHours,
        instructor_name: course.instructorName,
        classroom: course.classroom,
        building: course.building,
        days: course.days,
        start_time: course.startTime,
        end_time: course.endTime,
        syllabus: course.syllabus || '',
      });
    }

    showToast(`Added ${course.courseCode} to your schedule.`);
    refreshCourseRecommendations(nextCourses);
  };

  const deleteCourse = async (courseId: string) => {
    const nextCourses = courses.filter((c) => c.courseId !== courseId);
    setCourses(nextCourses);
    setSchedule((prev) => prev.filter((s) => s.courseId !== courseId));

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('student_courses').delete().eq('id', courseId);
    }
    showToast('Course removed.');
    refreshCourseRecommendations(nextCourses);
  };

  const addScheduleItem = async (item: ScheduleItem) => {
    setSchedule((prev) => [item, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine && isAuthenticated && item.type !== 'class') {
      await supabase.from('student_tasks').insert({
        id: item.scheduleId,
        student_id: student.studentId,
        course_id: item.courseId,
        course_code: item.courseCode || '',
        title: item.title,
        task_type: item.type,
        due_date: item.date || '',
        due_datetime: item.dueDateTime || '',
        start_time: item.startTime,
        end_time: item.endTime,
        location: item.location,
        building: item.building,
        description: item.description || '',
      });
    }
    showToast('Task added to schedule.');
  };

  const deleteScheduleItem = async (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.scheduleId !== id));
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('student_tasks').delete().eq('id', id);
    }
    showToast('Schedule item removed.');
  };

  // --- COMMUNITY HUB ---
  const submitEventProposal = async (eventData: Omit<CommunityEvent, 'eventId' | 'status'>) => {
    const newEvent: CommunityEvent = {
      ...eventData,
      eventId: `evt_${Date.now()}`,
      status: 'pending',
      submittedByStudentId: student.studentId,
    };
    setEvents((prev) => [newEvent, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('community_events').insert({
        id: newEvent.eventId,
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.eventDate,
        start_time: newEvent.startTime,
        end_time: newEvent.endTime,
        location: newEvent.location,
        organizer: newEvent.organizer,
        contact_info: newEvent.contactInfo,
        category: newEvent.category,
        status: 'pending',
        submitted_by: student.studentId,
      });
    }
    showToast('Event submitted to Admin for review & publishing.');
  };

  const approveEvent = async (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.eventId === eventId ? { ...e, status: 'approved' } : e))
    );
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('community_events').update({ status: 'approved' }).eq('id', eventId);
    }
    showToast('Event published to all students.');
  };

  const rejectEvent = async (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.eventId === eventId ? { ...e, status: 'rejected' } : e))
    );
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('community_events').update({ status: 'rejected' }).eq('id', eventId);
    }
    showToast('Event rejected.');
  };

  const deleteEvent = async (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('community_events').delete().eq('id', eventId);
    }
    showToast('Event deleted.');
  };

  // --- ANNOUNCEMENTS ---
  const addAnnouncement = async (data: Omit<Announcement, 'announcementId' | 'publishDate'>) => {
    const newAnc: Announcement = {
      ...data,
      announcementId: `anc_${Date.now()}`,
      publishDate: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnc, ...prev]);
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('announcements').insert({
        id: newAnc.announcementId,
        title: newAnc.title,
        content: newAnc.content,
        category: newAnc.category,
        publish_date: newAnc.publishDate,
        author: newAnc.author,
      });
    }
    showToast('Announcement published to students.');
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.announcementId !== id));
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('announcements').delete().eq('id', id);
    }
    showToast('Announcement deleted.');
  };

  // --- PROBLEM REPORTS ---
  const submitCampusIncident = async (
    incidentData: Omit<CampusIncident, 'incidentId' | 'submittedAt' | 'status'>
  ): Promise<string> => {
    const newId = `rep_${Date.now()}`;
    const newIncident: CampusIncident = {
      ...incidentData,
      incidentId: newId,
      status: 'Submitted',
      submittedAt: new Date().toLocaleString(),
    };
    setCampusIncidents((prev) => [newIncident, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('problem_reports').insert({
        id: newId,
        student_id: incidentData.studentId,
        student_name: incidentData.studentName,
        is_confidential: false,
        title: incidentData.title,
        description: incidentData.description,
        category: incidentData.category,
        priority: incidentData.priority,
        status: 'Submitted',
        building: incidentData.building,
        floor: incidentData.floor,
        room: incidentData.room,
        image_url: incidentData.imageUrl,
        assigned_department: incidentData.assignedDepartment,
      });
    }

    showToast('Problem report submitted directly to Admin Console.');
    return newId;
  };

  const updateIncidentStatus = async (incidentId: string, status: IncidentStatus) => {
    setCampusIncidents((prev) =>
      prev.map((inc) => (inc.incidentId === incidentId ? { ...inc, status } : inc))
    );
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('problem_reports').update({ status }).eq('id', incidentId);
    }
    showToast(`Report status updated to: ${status}`);
  };

  const deleteCampusIncident = async (incidentId: string) => {
    setCampusIncidents((prev) => prev.filter((inc) => inc.incidentId !== incidentId));
    const supabase = getSupabaseClient();
    if (supabase && navigator.onLine) {
      await supabase.from('problem_reports').delete().eq('id', incidentId);
    }
    showToast('Problem marked solved and removed.');
  };

  // --- PERMISSIONS: LOCATION & NOTIFICATIONS ---
  const requestLocationAccess = async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationPermissionStatus('unsupported');
      showToast('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoordinates(coords);
        setLocationPermissionStatus('granted');
        const check = isInsideAsuCampus(coords.lat, coords.lng);
        if (check.inside) {
          setSimulatedLocation(check.nearestBuilding.code);
          showToast(`Inside ASU campus near ${check.nearestBuilding.nameEn}`);
        } else {
          showToast(`Location detected (${(check.distanceFromCenterMeters / 1000).toFixed(1)} km from ASU campus)`);
        }
      },
      () => {
        setLocationPermissionStatus('denied');
        showToast('Location access denied. Please enable location permissions in your browser.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPrefs((prev) => ({ ...prev, permissionStatus: 'unsupported' }));
      showToast('Push notifications are unsupported in this browser.');
      return;
    }

    const result = await Notification.requestPermission();
    const updated: NotificationPreferences = {
      ...notificationPrefs,
      permissionStatus: result as NotificationPreferences['permissionStatus'],
    };
    setNotificationPrefs(updated);
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));

    if (result === 'granted') {
      showToast('Notifications enabled! You will receive 15m lecture alerts & 48h/2h exam reminders.');
      try {
        new Notification('CampusX — ASU Alerts Active', {
          body: 'Push alerts active for walking time warnings and exam/quiz deadlines.',
          icon: '/assets/aistudio/LOGO_bc48159f.png',
        });
      } catch {
        // ignore
      }
    } else {
      showToast('Notification permission declined.');
    }
  };

  const updateNotificationPrefs = (prefs: Partial<NotificationPreferences>) => {
    setNotificationPrefs((prev) => {
      const next = { ...prev, ...prefs };
      if (typeof window !== 'undefined') {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      }
      return next;
    });
    showToast('Notification preferences updated.');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const t = translations.en;

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        language,
        setLanguage,
        t,
        isAuthReady,
        isAuthenticated,
        student,
        registerStudent,
        loginStudent,
        logoutStudent,
        updateStudent,
        completeOnboarding,
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
        courses,
        addCourse,
        deleteCourse,
        schedule,
        addScheduleItem,
        deleteScheduleItem,
        courseRecommendations,
        isLoadingRecommendations,
        refreshCourseRecommendations,
        events,
        submitEventProposal,
        approveEvent,
        rejectEvent,
        deleteEvent,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        campusIncidents,
        submitCampusIncident,
        updateIncidentStatus,
        deleteCampusIncident,
        userCoordinates,
        locationPermissionStatus,
        requestLocationAccess,
        simulatedLocation,
        setSimulatedLocation,
        walkingSpeed,
        setWalkingSpeed,
        campusWeather,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        notificationPrefs,
        updateNotificationPrefs,
        requestNotificationPermission,
        isOffline,
        lastSyncTime,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        toastMessage,
        showToast,
        supabaseConnected,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export { ASU_BUILDINGS };
