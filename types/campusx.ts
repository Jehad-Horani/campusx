export type UserRole = 'student' | 'admin';

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Student extends User {
  studentId: string;
  universityId: string; // e.g. 202110482
  faculty: string;
  major: string;
  academicYear: number;
  onboardingCompleted?: boolean;
  status?: 'active' | 'suspended';
  passwordHash?: string;
  createdAt?: string;
}

export interface Administrator extends User {
  adminId: string;
  username: string;
  department: string;
  roleLevel: 'super_admin' | 'moderator';
}

export interface AdminAccount {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  department: string;
  createdAt: string;
}

export interface Course {
  courseId: string;
  courseCode: string; // e.g. CS412
  courseName: string;
  creditHours: number;
  instructorName: string;
  instructorEmail: string;
  classroom: string; // e.g. 7106, 1B12, 2-104
  building: string;
  days: string[]; // ['Sun', 'Tue', 'Thu']
  startTime: string; // '10:00'
  endTime: string; // '11:00'
  color: string;
  syllabus?: string;
}

export type ScheduleItemType = 'class' | 'exam' | 'quiz' | 'assignment';

export interface ScheduleItem {
  scheduleId: string;
  courseId: string;
  courseCode?: string;
  title: string;
  date?: string; // YYYY-MM-DD
  dueDateTime?: string; // ISO datetime for quizzes/assignments/exams auto-expiry & reminders
  dayOfWeek?: string; // 'Sun', 'Mon', etc.
  startTime: string;
  endTime: string;
  location: string;
  building: string;
  type: ScheduleItemType;
  description?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

// EXTERNAL AI COURSE RECOMMENDATIONS
export interface ExternalCourseItem {
  title: string;
  provider: string; // e.g. Coursera, Udemy, freeCodeCamp, MIT OCW, YouTube
  level: string;
  duration: string;
  reason: string;
  url: string;
}

export interface CourseRecommendationGroup {
  courseCode: string;
  courseName: string;
  duringSemester: ExternalCourseItem[];
  postSemester: ExternalCourseItem[];
  generatedAt: string;
}

// SMART CAMPUS & WEATHER
export interface CampusWeatherAlert {
  temperatureC: number;
  condition: string;
  advisory?: string;
}

// PROBLEM REPORTING ("Report a Problem")
export type IncidentCategory =
  | 'Maintenance'
  | 'Electrical'
  | 'Cleaning'
  | 'IT Support'
  | 'Facilities'
  | 'Safety'
  | 'Other';

export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';

export interface CampusIncident {
  incidentId: string;
  studentId: string;
  studentName?: string;
  isConfidential: boolean;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  building: string;
  floor: string;
  room: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  submittedAt: string;
  assignedDepartment: string;
  aiClassification?: {
    detectedObject: string;
    confidence: number;
    recommendedDepartment: string;
    reasoning: string;
  };
}

// COMMUNITY HUB (Simple Event Publishing & Direct Contact)
export interface CommunityEvent {
  eventId: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  contactInfo: string;
  category: 'Environment' | 'Health' | 'Education' | 'Charity' | 'Campus Life';
  status: 'approved' | 'pending' | 'rejected';
  submittedByStudentId?: string;
}

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  category: 'Academic' | 'Registration' | 'Campus' | 'Important';
  publishDate: string;
  author: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  dateSent: string;
  category: 'academic' | 'campus' | 'community' | 'system';
  isRead: boolean;
}

export interface NotificationPreferences {
  walkingWarnings: boolean; // Alert 15 mins before lecture with ON TIME / TIGHT status
  examDeadlines: boolean; // Reminders 48h and 2h prior to scheduled evaluations
  permissionStatus: 'default' | 'granted' | 'denied' | 'unsupported';
}
