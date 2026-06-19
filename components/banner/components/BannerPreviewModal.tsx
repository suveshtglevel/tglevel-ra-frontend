'use client';

import React from 'react';
import { X } from 'lucide-react';
import BannerLivePreview from './BannerLivePreview';
import { to12Hour } from '@/lib/time';
import type { Banner } from '@/components/banner/services/banners.service';

// Normalize an ISO or "YYYY-MM-DD" date to "YYYY-MM-DD" so the preview's date
// formatter renders it nicely; falls back to the raw value.
const normalizeDate = (v?: string) => {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10);
};

// Read-only modal that renders a saved banner with the same designed card used
// in the live preview. Times come back 24-hour, so convert to AM/PM (older
// records may already be 12-hour — those pass through).
const BannerPreviewModal = ({ banner, onClose }: { banner: Banner; onClose: () => void }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative w-full max-w-[340px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <BannerLivePreview
          image={banner.image_url}
          title={banner.title}
          description={banner.description ?? ''}
          date={normalizeDate(banner.webinar_date)}
          time={to12Hour(banner.webinar_time ?? '') || banner.webinar_time || ''}
          ctaText={banner.cta_text ?? ''}
          ctaColor={banner.theme?.cta_button_color ?? '#10B981'}
          ctaTextColor={banner.theme?.cta_button_text_color ?? '#FFFFFF'}
          textColor={banner.theme?.text_color ?? '#F8FAFC'}
          bgColor={banner.theme?.background_color ?? '#0B1F33'}
        />
      </div>
    </div>
  );
};

export default BannerPreviewModal;
