'use client';

import React from 'react';
import { Pipette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuggestedPalette } from '@/hooks/useSuggestedPalette';
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
  const { data: palette, isLoading } = useSuggestedPalette();

  // The three suggested colors mapped to the form fields they apply to.
  const suggestions = palette
    ? ([
        { label: 'CTA', color: palette.cta_button_color, key: 'ctaColor' },
        { label: 'CTA Text', color: palette.cta_button_text_color, key: 'ctaTextColor' },
        { label: 'Text', color: palette.text_color, key: 'textColor' },
        { label: 'Background', color: palette.background_color, key: 'bgColor' },
      ] as const)
    : [];

  const applyAll = () => {
    if (!palette) return;
    w.set('ctaColor', palette.cta_button_color.toUpperCase());
    w.set('ctaTextColor', palette.cta_button_text_color.toUpperCase());
    w.set('textColor', palette.text_color.toUpperCase());
    w.set('bgColor', palette.background_color.toUpperCase());
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-[16px] font-bold text-slate-800">Banner Theme Colors</h2>
      <p className="text-[13px] text-slate-400 mt-1">
        Adjust CTA and text colors to match your uploaded banner background.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mt-5">
        <ColorField label="CTA Button Color" value={w.ctaColor} onChange={(v) => w.set('ctaColor', v)} />
        <ColorField label="CTA Button Text Color" value={w.ctaTextColor} onChange={(v) => w.set('ctaTextColor', v)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-5 mt-5">
        <ColorField label="Text Color" value={w.textColor} onChange={(v) => w.set('textColor', v)} />
        <ColorField label="Background Color" value={w.bgColor} onChange={(v) => w.set('bgColor', v)} />
      </div>

      {/* Suggested palette — the most-used colors across all banners. */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[13px] text-slate-500">Suggested Palette (Most used across banners)</p>
          {palette && (
            <button
              type="button"
              onClick={applyAll}
              className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Apply all
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="text-[12px] text-slate-400">Loading palette…</p>
        ) : suggestions.length === 0 ? (
          <p className="text-[12px] text-slate-400">No suggested palette available.</p>
        ) : (
          <div className="flex items-center gap-5">
            {suggestions
              .filter(({ color }) => isHex6(color))
              .map(({ label, color, key }) => {
              const selected = color.toUpperCase() === w[key].toUpperCase();
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => w.set(key, color.toUpperCase())}
                  className="flex items-center gap-2 cursor-pointer group"
                  aria-label={`Use ${label} color ${color}`}
                >
                  <span
                    style={{ backgroundColor: color }}
                    className={cn(
                      'w-7 h-7 rounded-full transition-transform group-hover:scale-110',
                      selected ? 'ring-2 ring-offset-2 ring-emerald-500' : 'ring-1 ring-slate-200'
                    )}
                  />
                  <span className="text-[11px] font-medium text-slate-500">{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BannerThemeColors;
