'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  align?: 'down' | 'up';
}

const FilterDropdown = ({ value, options, onChange, align = 'down' }: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-w-[140px] justify-between',
          open ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
        )}
      >
        {value}
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 left-0 min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-lg p-1.5',
            align === 'up' ? 'bottom-full mb-2' : 'mt-2'
          )}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer',
                opt === value ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {opt}
              {opt === value && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
