'use client';

import React from 'react';
import { Pipette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUGGESTED_PALETTE } from '@/constants/webinarData';
import type { UseWebinarBanner } from '@/hooks/useWebinarBanner';

const isHex6 = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorField = ({ label, value, onChange }: ColorFieldProps) => {
  const safe = isHex6(value) ? value : '#000000';
  return (
    <div>
      <label className="block text-[13px] font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {/* Swatch = native color picker */}
        <label
          className="relative w-9 h-9 rounded-full border border-slate-200 shrink-0 cursor-pointer overflow-hidden"
          style={{ backgroundColor: safe }}
        >
          <input
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={`${label} picker`}
          />
        </label>
        {/* Hex input + eyedropper */}
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          />
          <label className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <Pipette className="w-4 h-4" />
            <input
              type="color"
              value={safe}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label={`${label} eyedropper`}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

const BannerThemeColors = ({ w }: { w: UseWebinarBanner }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-[16px] font-bold text-slate-800">Banner Theme Colors</h2>
      <p className="text-[13px] text-slate-400 mt-1">
        Adjust CTA and text colors to match your uploaded banner background.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mt-5">
        <ColorField label="CTA Button Color" value={w.ctaColor} onChange={(v) => w.set('ctaColor', v)} />
        <ColorField label="Text Color" value={w.textColor} onChange={(v) => w.set('textColor', v)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-5 mt-5">
        <ColorField label="Background Color" value={w.bgColor} onChange={(v) => w.set('bgColor', v)} />
      </div>

      {/* Suggested palette */}
      <div className="mt-6">
        <p className="text-[13px] text-slate-500 mb-2.5">Suggested Palette (Extracted from image)</p>
        <div className="flex items-center gap-2.5">
          {SUGGESTED_PALETTE.map((c) => {
            const selected = c.toUpperCase() === w.ctaColor.toUpperCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => w.set('ctaColor', c.toUpperCase())}
                style={{ backgroundColor: c }}
                className={cn(
                  'w-7 h-7 rounded-full transition-transform cursor-pointer hover:scale-110',
                  selected ? 'ring-2 ring-offset-2 ring-emerald-500' : 'ring-1 ring-slate-200'
                )}
                aria-label={`Use ${c}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BannerThemeColors;
