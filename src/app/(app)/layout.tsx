import React from 'react';
import Sidebar from '@/components/common/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
}
