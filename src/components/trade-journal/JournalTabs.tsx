'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type JournalTab = 'ra' | 'customer';

interface JournalTabsProps {
  value: JournalTab;
  onChange: (value: JournalTab) => void;
}

const TABS: { value: JournalTab; label: string }[] = [
  { value: 'ra', label: 'RA Trade Journal' },
  { value: 'customer', label: 'Customer Trade Journal' },
];

// Toggle between the RA and Customer trade-journal views. Shared by both views
// so the switch is available from either side.
const JournalTabs = ({ value, onChange }: JournalTabsProps) => (
  <div className="flex items-center gap-2">
    {TABS.map((t) => {
      const active = t.value === value;
      return (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            'px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
            active
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          )}
        >
          {t.label}
        </button>
      );
    })}
  </div>
);

export default JournalTabs;
