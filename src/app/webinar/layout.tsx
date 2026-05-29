import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/common/Sidebar';

export const metadata: Metadata = {
  title: 'Webinar Banners',
  description: 'Create, preview, and schedule webinar banners for communities.',
};

export default function WebinarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
}
