'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Explicit hour / minute / AM-PM dropdowns so the value is always a valid
// "h:mm AM/PM" string (the format the form state uses) and AM/PM is shown
// regardless of the browser's locale — unlike <input type="time">, whose 12h/24h
// display is locale-dependent. (Conversion to the API's 24-hour format happens
// at the API boundary; see lib/time.)

const selectClass =
  'h-11 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition cursor-pointer';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'] as const;
type Period = (typeof PERIODS)[number];

interface Parts {
  hour: string;
  minute: string;
  period: Period;
}

function parse(value: string): Parts {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return { hour: '', minute: '', period: 'AM' };
  return { hour: String(parseInt(m[1], 10)), minute: m[2], period: m[3].toUpperCase() as Period };
}

interface TimeFieldProps {
  value: string; // "h:mm AM/PM"
  onChange: (value: string) => void; // emits "h:mm AM/PM" (or '' until complete)
  className?: string; // wrapper layout (e.g. w-full)
  'aria-label'?: string;
}

const TimeField = ({ value, onChange, className, 'aria-label': ariaLabel }: TimeFieldProps) => {
  // Fully controlled: the parts are derived from `value` on each render. When a
  // dropdown changes, any missing part falls back to a sensible default so the
  // emitted value is always a complete "h:mm AM/PM".
  const parts = parse(value);

  const update = (patch: Partial<Parts>) => {
    const next = { ...parts, ...patch };
    onChange(`${next.hour || '12'}:${next.minute || '00'} ${next.period}`);
  };

  return (
    <div className={cn('flex items-center gap-2', className)} role="group" aria-label={ariaLabel}>
      <select
        className={selectClass}
        aria-label="Hour"
        value={parts.hour}
        onChange={(e) => update({ hour: e.target.value })}
      >
        <option value="" disabled>
          HH
        </option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-slate-400">:</span>
      <select
        className={selectClass}
        aria-label="Minute"
        value={parts.minute}
        onChange={(e) => update({ minute: e.target.value })}
      >
        <option value="" disabled>
          MM
        </option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        aria-label="AM or PM"
        value={parts.period}
        onChange={(e) => update({ period: e.target.value as Period })}
      >
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeField;
