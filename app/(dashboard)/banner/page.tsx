'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBannerForm } from '@/components/banner/hooks/useBannerForm';
import BannerUpload from '@/components/banner/components/BannerUpload';
import BannerDetailsForm from '@/components/banner/components/BannerDetailsForm';
import BannerThemeColors from '@/components/banner/components/BannerThemeColors';
import PublishingOptions from '@/components/banner/components/PublishingOptions';
import BannerLivePreview from '@/components/banner/components/BannerLivePreview';
import { PreviousBannersTable } from '@/components/banner/components/PreviousBanners';

const headerBtn =
  'h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap';

export default function WebinarPage() {
  const w = useBannerForm();
  const hasImage = !!w.image;

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur border-b border-slate-200">
        <div className="px-6 lg:px-10 py-3 max-w-[1400px] mx-auto w-full flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[17px] font-bold text-slate-900">
              {w.isEditing ? 'Edit Webinar Banner' : 'Upload Webinar Banner'}
            </h1>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {w.isEditing
                ? 'Update this banner and save your changes.'
                : 'Create and publish webinar banners for communities.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {w.isEditing && (
              <button type="button" onClick={w.cancelEdit} className={headerBtn}>
                Cancel edit
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('previous-banners')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className={headerBtn}
            >
              Previous Posted banner
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-6 max-w-[1400px] mx-auto w-full">
        <div className={cn('grid gap-6 items-stretch', hasImage ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : 'grid-cols-1')}>
          {/* Left: form */}
          <div className="space-y-6 min-w-0">
            <div id="banner-form" className="scroll-mt-24 space-y-6">
              <BannerUpload image={w.image} onUpload={w.onImageUpload} onRemove={w.removeImage} />
              <BannerDetailsForm w={w} />
              <BannerThemeColors w={w} />
              <PublishingOptions w={w} />
            </div>
            <div id="previous-banners" className="scroll-mt-24">
              <PreviousBannersTable
                onEdit={(banner) => {
                  w.loadForEdit(banner);
                  document
                    .getElementById('banner-form')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            </div>
          </div>

          {/* Right: live preview (only after an image is uploaded) */}
          {hasImage && (
            <div className="hidden lg:block">
              {/* -mt-6 cancels the content's py-6 top padding so the preview's
                  natural top lines up with the sticky line (top-[80px] = header
                  height): no upward travel on scroll and no gap above the label. */}
              <div className="sticky top-[80px] -mt-6 space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live Preview</p>
                <BannerLivePreview
                  image={w.image as string}
                  title={w.title}
                  description={w.description}
                  date={w.webinarDate}
                  time={w.webinarTime}
                  ctaText={w.ctaText}
                  ctaColor={w.ctaColor}
                  ctaTextColor={w.ctaTextColor}
                  textColor={w.textColor}
                  bgColor={w.bgColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer: stays pinned to the bottom of the viewport while the page
          scrolls. Always shown, but the action stays disabled until a banner
          image is selected and a publishing option is chosen. */}
      <div className="sticky bottom-0 z-30 bg-[#F8FAFC]/95 backdrop-blur border-t border-slate-200">
        <div className="px-6 lg:px-10 py-2 max-w-[1400px] mx-auto w-full flex items-center justify-end">
          <button
            type="button"
            onClick={() => w.save()}
            disabled={w.saving || !hasImage || !w.publishOption}
            className="h-9 px-5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {w.saving
              ? 'Saving…'
              : w.isEditing
                ? 'Update Banner'
                : w.publishOption === 'schedule'
                  ? 'Schedule Banner'
                  : w.publishOption === 'draft'
                    ? 'Save Draft'
                    : 'Publish Banner'}
          </button>
        </div>
      </div>
    </main>
  );
}
