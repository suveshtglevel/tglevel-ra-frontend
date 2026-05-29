import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/common/Sidebar';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Community feed, trade alerts, and research messaging.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
}
