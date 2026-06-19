import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import RequireAuth from '@/components/auth/components/RequireAuth';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Community feed, trade alerts, and research messaging.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-[var(--app-h)] w-[var(--app-w)] bg-[#F8FAFC] overflow-hidden">
        <Sidebar />
        {children}
      </div>
    </RequireAuth>
  );
}
