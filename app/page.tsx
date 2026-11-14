'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { OfflineBanner } from '@/components/OfflineBanner';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { ToastNotification } from '@/components/ToastNotification';

// Views
import { StudentAuthView } from '@/components/views/StudentAuthView';
import { ScheduleOnboardingView } from '@/components/views/ScheduleOnboardingView';
import { OfflineCachedView } from '@/components/views/OfflineCachedView';
import { StudentDashboardView } from '@/components/views/StudentDashboardView';
import { CampusModeView } from '@/components/views/CampusModeView';
import { RecommendedCoursesView } from '@/components/views/RecommendedCoursesView';
import { CourseManagerView } from '@/components/views/CourseManagerView';
import { ScheduleView } from '@/components/views/ScheduleView';
import { CommunityHubView } from '@/components/views/CommunityHubView';
import CampusVisionView from '@/components/views/CampusVisionView';
import { AIAssistantView } from '@/components/views/AIAssistantView';
import { MentalHealthView } from '@/components/views/MentalHealthView';
import { StudentProfileView } from '@/components/views/StudentProfileView';
import { SettingsView } from '@/components/views/SettingsView';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const {
    isAuthReady,
    isAuthenticated,
    student,
    isOffline,
    activeView,
  } = useStore();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center gap-3 text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-semibold text-slate-300">Loading CampusX ASU...</span>
      </div>
    );
  }

  // Real Offline Mode: flips entire UI automatically to cached view on actual disconnect
  if (isOffline && isAuthenticated) {
    return (
      <>
        <OfflineCachedView />
        <ToastNotification />
      </>
    );
  }

  // Student Authentication Gate
  if (!isAuthenticated) {
    return (
      <>
        <StudentAuthView />
        <ToastNotification />
      </>
    );
  }

  // Post-registration Semester Schedule Onboarding Gate
  if (!student.onboardingCompleted) {
    return (
      <>
        <ScheduleOnboardingView />
        <ToastNotification />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <StudentDashboardView />;
      case 'campus-mode':
        return <CampusModeView />;
      case 'recommended-courses':
        return <RecommendedCoursesView />;
      case 'courses':
        return <CourseManagerView />;
      case 'schedule':
        return <ScheduleView />;
      case 'community':
        return <CommunityHubView />;
      case 'campus-vision':
        return <CampusVisionView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'mental-health':
        return <MentalHealthView />;
      case 'profile':
        return <StudentProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <StudentDashboardView />;
    }
  };

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-[#080B14] text-[#F5F7FF] flex flex-col antialiased selection:bg-cyan-500 selection:text-black"
    >
      <Navbar />
      <OfflineBanner />

      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 sm:pb-32 lg:pb-12 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderCurrentView()}
        </main>
      </div>

      <MobileBottomNav />
      <NotificationDrawer />
      <ToastNotification />
    </div>
  );
}
