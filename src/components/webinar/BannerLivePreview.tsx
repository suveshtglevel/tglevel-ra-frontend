'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BannerLivePreviewProps {
  image: string;
  title: string;
  description: string;
  date: string;
  time: string;
  ctaText: string;
  ctaColor: string;
  textColor: string;
  bgColor: string;
}

// "2026-06-08" -> "08 Jun 2026" for display; leaves any other string as-is.
const formatDate = (value: string) => {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return value;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const BannerLivePreview = ({
  image,
  title,
  description,
  date,
  time,
  ctaText,
  ctaColor,
  textColor,
  bgColor,
}: BannerLivePreviewProps) => {
  const descriptionRef = React.useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  // Show "Read more" only when the text actually overflows the fixed (2-line)
  // description box — measured, so it adapts to the card width and word wrapping
  // rather than a character count. A ResizeObserver re-measures when the card
  // width changes; while expanded we skip so the toggle stays put.
  React.useEffect(() => {
    const el = descriptionRef.current;
    if (!el || expanded) return;
    const ro = new ResizeObserver(() => {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [description, expanded]);

  return (
    <div className="rounded-[28px] p-2.5 shadow-xl w-full" style={{ backgroundColor: bgColor }}>
      {/* Banner image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
        <Image src={image} alt="Banner preview" fill className="object-cover" unoptimized />
      </div>

      {/* Info */}
      <div className="px-2 pt-3 pb-2">
        <h3 className="text-[16px] font-bold leading-snug" style={{ color: textColor }}>
          {title || 'Banner Title'}
        </h3>
        <p className="text-[12px] mt-1" style={{ color: textColor, opacity: 0.65 }}>
          {formatDate(date)} • {time}
        </p>

        {description && (
          <div className="mt-2">
            <p
              ref={descriptionRef}
              className={cn(
                'text-[12px] leading-relaxed whitespace-pre-line',
                !expanded && 'line-clamp-2'
              )}
              style={{ color: textColor, opacity: 0.8 }}
            >
              {description}
            </p>
            {(isOverflowing || expanded) && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-[12px] font-semibold underline underline-offset-2 cursor-pointer mt-0.5"
                style={{ color: ctaColor }}
              >
                {expanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          className="w-full h-11 rounded-xl mt-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: ctaColor }}
        >
          {ctaText || 'Register'}
        </button>
      </div>
    </div>
  );
};

export default BannerLivePreview;
