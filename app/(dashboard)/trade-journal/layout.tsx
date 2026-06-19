import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Trade Journal',
  description: 'Track, filter, and analyze all trading activity.',
};

export default function TradeJournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[var(--app-h)] w-[var(--app-w)] bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
}
