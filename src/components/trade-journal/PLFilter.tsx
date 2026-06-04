'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PLFilter as PLFilterValue } from '@/redux/slices/tradeJournalSlice';

interface PLFilterProps {
  value: PLFilterValue;
  onChange: (value: PLFilterValue) => void;
}

const OPTIONS: { value: PLFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'profit', label: 'Profit' },
  { value: 'loss', label: 'Loss' },
];

// Compact dropdown rendered inside the Profit column header. Sits in place of the
// old sortable header and filters rows by profit / loss.
const PLFilter = ({ value, onChange }: PLFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = value !== 'all';

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-[11px] cursor-pointer transition-colors',
          active ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
        )}
      >
        P / L
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 mt-2 min-w-[140px] bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 normal-case">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer tracking-normal',
                opt.value === value
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {opt.label}
              {opt.value === value && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PLFilter;
