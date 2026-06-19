import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Webinar Banners',
  description: 'Create, preview, and schedule webinar banners for communities.',
};

export default function WebinarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[var(--app-h)] w-[var(--app-w)] bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
}
