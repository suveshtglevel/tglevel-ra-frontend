import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import RequireAuth from '@/modules/auth/components/RequireAuth';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Community feed, trade alerts, and research messaging.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
        <Sidebar />
        {children}
      </div>
    </RequireAuth>
  );
}
