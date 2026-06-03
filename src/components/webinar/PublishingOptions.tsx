'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { PublishOption } from '@/constants/webinarData';
import type { UseWebinarBanner } from '@/hooks/useWebinarBanner';
import TimeField from '@/components/webinar/TimeField';

const Radio = ({ active }: { active: boolean }) => (
  <span
    className={cn(
      'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
      active ? 'border-emerald-500' : 'border-slate-300'
    )}
  >
    {active && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
  </span>
);

const scheduleInput =
  'w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 pr-9 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition';

const PublishingOptions = ({ w }: { w: UseWebinarBanner }) => {
  const option = (value: PublishOption, title: string, subtitle: string) => (
    <button
      type="button"
      onClick={() => w.set('publishOption', value)}
      className={cn(
        'w-full text-left flex items-start gap-3 rounded-xl border p-4 transition-colors cursor-pointer',
        w.publishOption === value ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <Radio active={w.publishOption === value} />
      <span>
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-400 mt-0.5">{subtitle}</span>
      </span>
    </button>
  );

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-[16px] font-bold text-slate-800 mb-4">Publishing Options</h2>

      <div className="space-y-3">
        {option('now', 'Publish Now', 'Post immediately to selected communities')}

        {/* Schedule (expands when selected) */}
        <div
          className={cn(
            'rounded-xl border transition-colors',
            w.publishOption === 'schedule' ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200'
          )}
        >
          <button
            type="button"
            onClick={() => w.set('publishOption', 'schedule')}
            className="w-full text-left flex items-start gap-3 p-4 cursor-pointer"
          >
            <Radio active={w.publishOption === 'schedule'} />
            <span>
              <span className="block text-sm font-semibold text-slate-800">Schedule Post</span>
              <span className="block text-xs text-slate-400 mt-0.5">Choose a future date and time</span>
            </span>
          </button>

          {w.publishOption === 'schedule' && (
            <div className="grid sm:grid-cols-2 gap-4 px-4 pb-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Schedule Date</label>
                <input
                  type="date"
                  className={scheduleInput}
                  value={w.scheduleDate}
                  onChange={(e) => w.set('scheduleDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Schedule Time</label>
                <TimeField
                  aria-label="Schedule time"
                  value={w.scheduleTime}
                  onChange={(v) => w.set('scheduleTime', v)}
                />
              </div>
            </div>
          )}
        </div>

        {option('draft', 'Save as Draft', 'Save securely to continue editing later')}
      </div>
    </section>
  );
};

export default PublishingOptions;
