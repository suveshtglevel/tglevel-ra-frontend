'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, X } from 'lucide-react';

interface BannerLivePreviewProps {
  image: string;
  title: string;
  date: string;
  time: string;
  ctaText: string;
  ctaColor: string;
  textColor: string;
  bgColor: string;
}

const BannerLivePreview = ({
  image,
  title,
  date,
  time,
  ctaText,
  ctaColor,
  textColor,
  bgColor,
}: BannerLivePreviewProps) => {
  return (
    <div className="rounded-[28px] p-2.5 shadow-xl max-w-[320px] w-full" style={{ backgroundColor: bgColor }}>
      {/* App chrome */}
      <div className="flex items-center justify-between px-1.5 pt-1 pb-2.5">
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-black/25 flex items-center justify-center text-white"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-black/25 flex items-center justify-center text-white"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

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
          {date} • {time}
        </p>

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
