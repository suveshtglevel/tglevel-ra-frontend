'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  from: string; // ISO yyyy-mm-dd
  to: string; // ISO yyyy-mm-dd
  onChange: (from: string, to: string) => void;
}

type Field = 'from' | 'to';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const formatLabel = (s: string) => {
  const d = fromISO(s);
  return `${pad(d.getDate())} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const DateRangePicker = ({ from, to, onChange }: DateRangePickerProps) => {
  // Which pill's calendar is open (null = closed).
  const [openField, setOpenField] = useState<Field | null>(null);
  const [view, setView] = useState<Date>(() => fromISO(from));
  const [mode, setMode] = useState<'days' | 'months'>('days');
  const ref = useRef<HTMLDivElement>(null);

  const fromDate = fromISO(from);
  const toDate = fromISO(to);

  const viewYear = view.getFullYear();
  const viewMonth = view.getMonth();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const gridStart = new Date(viewYear, viewMonth, 1 - firstWeekday);
  const days = Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenField(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const openCalendar = (field: Field) => {
    setMode('days');
    setView(field === 'from' ? fromDate : toDate);
    setOpenField(field);
  };

  // The start must stay strictly before the end, so the two dates can never
  // collapse to the same day: the "from" calendar disables days >= end, and
  // the "to" calendar disables days <= start.
  const isDisabled = (d: Date) => {
    if (openField === 'from') return d >= toDate;
    if (openField === 'to') return d <= fromDate;
    return false;
  };

  const handleDayClick = (day: Date) => {
    if (isDisabled(day)) return;
    if (openField === 'from') onChange(toISO(day), to);
    else if (openField === 'to') onChange(from, toISO(day));
    setOpenField(null);
  };

  const handlePrev = () =>
    setView(mode === 'months' ? new Date(viewYear - 1, viewMonth, 1) : new Date(viewYear, viewMonth - 1, 1));
  const handleNext = () =>
    setView(mode === 'months' ? new Date(viewYear + 1, viewMonth, 1) : new Date(viewYear, viewMonth + 1, 1));
  const handleMonthSelect = (monthIndex: number) => {
    setView(new Date(viewYear, monthIndex, 1));
    setMode('days');
  };

  const pillClass = (field: Field) =>
    cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer',
      openField === field ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
    );

  return (
    <div ref={ref} className="relative">
      {/* Trigger pills */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => openCalendar('from')} className={pillClass('from')}>
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatLabel(from)}
        </button>
        <span className="text-slate-400">-</span>
        <button type="button" onClick={() => openCalendar('to')} className={pillClass('to')}>
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatLabel(to)}
        </button>
      </div>

      {/* Calendar popover */}
      {openField && (
        <div className="absolute z-50 mt-2 left-0 w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl p-5">
          {/* Active-field hint */}
          <p className="text-[12px] font-medium text-slate-400 mb-2">
            {openField === 'from' ? 'Select start date' : 'Select end date'}
          </p>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrev}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'days' ? 'months' : 'days'))}
              className="text-[16px] font-bold text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mode === 'days' ? `${MONTHS[viewMonth]} ${viewYear}` : viewYear}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {mode === 'months' ? (
            /* Month picker */
            <div className="grid grid-cols-3 gap-2">
              {MONTHS_SHORT.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMonthSelect(idx)}
                  className={cn(
                    'h-12 flex items-center justify-center text-[15px] rounded-xl transition-colors cursor-pointer',
                    idx === viewMonth
                      ? 'bg-emerald-600 text-white font-semibold hover:bg-emerald-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Weekday labels */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="h-9 flex items-center justify-center text-[13px] font-medium text-slate-400">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {days.map((day, i) => {
                  const isCurrentMonth = day.getMonth() === viewMonth;
                  const isFrom = sameDay(day, fromDate);
                  const isTo = sameDay(day, toDate);
                  const mid = day > fromDate && day < toDate;
                  const disabled = isDisabled(day);
                  const endpoint = isFrom || isTo;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'h-10 w-full flex items-center justify-center text-[15px] rounded-xl transition-colors',
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                        endpoint && 'bg-emerald-600 text-white font-semibold',
                        endpoint && !disabled && 'hover:bg-emerald-700',
                        !endpoint && mid && 'bg-emerald-50 text-emerald-700',
                        !endpoint && !mid && disabled && 'text-slate-300',
                        !endpoint && !mid && !disabled && (isCurrentMonth ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-100')
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
