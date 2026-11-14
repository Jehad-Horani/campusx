'use client';

import React from 'react';
import { AdminDashboardView } from '@/components/views/AdminDashboardView';
import { ToastNotification } from '@/components/ToastNotification';

export default function AdminPortalPage() {
  return (
    <>
      <AdminDashboardView />
      <ToastNotification />
    </>
  );
}
