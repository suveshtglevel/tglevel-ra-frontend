'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useWebinarBanner } from '@/hooks/useWebinarBanner';
import BannerUpload from '@/components/webinar/BannerUpload';
import BannerDetailsForm from '@/components/webinar/BannerDetailsForm';
import BannerThemeColors from '@/components/webinar/BannerThemeColors';
import PublishingOptions from '@/components/webinar/PublishingOptions';
import BannerLivePreview from '@/components/webinar/BannerLivePreview';
import { PreviousBannersTable, PreviousPostsList } from '@/components/webinar/PreviousBanners';

const headerBtn =
  'h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap';

export default function WebinarPage() {
  const w = useWebinarBanner();
  const hasImage = !!w.image;

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur border-b border-slate-200">
        <div className="px-6 lg:px-10 py-4 max-w-[1400px] mx-auto w-full flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900">Upload Webinar Banner</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Create and publish webinar banners for communities.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button type="button" onClick={w.save} className={headerBtn}>Save Draft</button>
            <button type="button" onClick={w.save} className={headerBtn}>Schedule</button>
            <button type="button" className={headerBtn}>Previous Posted banner</button>
            {/* <button type="button" className={headerBtn}>Preview Banner</button> */}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-6 max-w-[1400px] mx-auto w-full">
        <div className={cn('grid gap-6 items-start', hasImage ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : 'grid-cols-1')}>
          {/* Left: form */}
          <div className="space-y-6 min-w-0">
            <BannerUpload image={w.image} onUpload={w.onImageUpload} onRemove={w.removeImage} />
            <BannerDetailsForm w={w} />
            <BannerThemeColors w={w} />
            <PublishingOptions w={w} />
            {hasImage ? 
            <PreviousPostsList /> : 
            <PreviousBannersTable />}
          </div>

          {/* Right: live preview (only after an image is uploaded) */}
          {hasImage && (
            <div className="hidden lg:block">
              <div className="sticky top-[96px] space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={w.save}
                    className="h-10 px-5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    Publish Banner
                  </button>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live Preview</p>
                <BannerLivePreview
                  image={w.image as string}
                  title={w.title}
                  date={w.webinarDate}
                  time={w.webinarTime}
                  ctaText={w.ctaText}
                  ctaColor={w.ctaColor}
                  textColor={w.textColor}
                  bgColor={w.bgColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
