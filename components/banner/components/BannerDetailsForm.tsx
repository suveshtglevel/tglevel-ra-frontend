'use client';

import React from 'react';
import { Link2, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { BANNER_CATEGORIES } from '@/components/banner/constants/bannerData';
import TimeField from '@/components/banner/components/TimeField';
import type { UseBannerForm } from '@/components/banner/hooks/useBannerForm';

const labelClass = 'block text-[13px] font-medium text-slate-600 mb-1.5';
const inputClass =
  'w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition';

const BannerDetailsForm = ({ w }: { w: UseBannerForm }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Title */}
      <div>
        <label className={labelClass}>Banner Title</label>
        <input
          className={inputClass}
          value={w.title}
          onChange={(e) => w.set('title', e.target.value)}
          placeholder="Banner title"
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={`${inputClass} h-20 py-2.5 resize-none`}
          value={w.description}
          onChange={(e) => w.set('description', e.target.value)}
          placeholder="Short webinar description"
        />
      </div>

      {/* CTA + URL */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>CTA Button Text</label>
          <input
            className={inputClass}
            value={w.ctaText}
            onChange={(e) => w.set('ctaText', e.target.value)}
            placeholder="Register"
          />
        </div>
        <div>
          <label className={labelClass}>Redirect URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              value={w.redirectUrl}
              onChange={(e) => w.set('redirectUrl', e.target.value)}
              placeholder="https://"
            />
          </div>
        </div>
      </div>

      {/* Date + Time */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Webinar Date</label>
          <input
            type="date"
            className={inputClass}
            value={w.webinarDate}
            onChange={(e) => w.set('webinarDate', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Webinar Time</label>
          <TimeField
            aria-label="Webinar time"
            value={w.webinarTime}
            onChange={(v) => w.set('webinarTime', v)}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Banner Category</label>
        <div className="relative">
          <select
            className={`${inputClass} appearance-none pr-9 cursor-pointer`}
            value={w.category}
            onChange={(e) => w.set('category', e.target.value)}
          >
            {BANNER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Notification toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[13px] font-medium text-slate-700">Notification Toggle</p>
          <p className="text-xs text-slate-400 mt-0.5">Notify Users</p>
        </div>
        <Switch checked={w.notify} onCheckedChange={(v) => w.set('notify', v)} />
      </div>
    </section>
  );
};

export default BannerDetailsForm;
