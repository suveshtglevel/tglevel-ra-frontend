'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PREVIOUS_POSTS, BANNER_CATEGORIES, BannerStatus } from '@/modules/banner/constants/webinarData';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useBanners } from '@/modules/banner/hooks/useBanners';
import { useDeleteBanner } from '@/modules/banner/hooks/useBannerMutations';
import BannerPreviewModal from './BannerPreviewModal';
import type { Banner, BannerStatusApi } from '@/modules/banner/services/banners.service';

const statusBadge: Record<BannerStatus, string> = {
  Published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
  Draft: 'bg-amber-50 text-amber-600 border-amber-100',
};

const statusText: Record<BannerStatus, string> = {
  Published: 'text-emerald-600',
  Scheduled: 'text-blue-600',
  Draft: 'text-amber-600',
};

// Placeholder thumbnail (no real asset) that hints at a dark trading banner.
const BannerThumb = ({ size = 'sm' }: { size?: 'sm' | 'xs' }) => (
  <div
    className={cn(
      'rounded-lg bg-gradient-to-br from-[#0b2a1f] via-[#0a1626] to-[#06121f] flex items-center justify-center shrink-0',
      size === 'sm' ? 'w-12 h-9' : 'w-11 h-11'
    )}
  >
    <ImageIcon className="w-4 h-4 text-emerald-400/70" />
  </div>
);

const STATUS_FILTERS = ['All', 'Published', 'Scheduled', 'Draft'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

// Backend lowercase status -> the capitalized label used by the badge maps.
const API_TO_DISPLAY_STATUS: Record<BannerStatusApi, BannerStatus> = {
  published: 'Published',
  scheduled: 'Scheduled',
  draft: 'Draft',
};

const PAGE_SIZE = 10;

// A banner's date can come back as ISO ("2026-06-20T00:00:00.000Z") or plain
// "YYYY-MM-DD"; render either as "08 Jun 2026". Falls back to the raw value.
const formatBannerDate = (value?: string) => {
  if (!value) return '—';
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

export const PreviousBannersTable = ({ onEdit }: { onEdit?: (banner: Banner) => void }) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const deleteBanner = useDeleteBanner();

  const { data, isLoading, isError } = useBanners({
    search: debouncedQuery.trim() || undefined,
    status: status === 'All' ? undefined : (status.toLowerCase() as BannerStatusApi),
    category: category === 'All' ? undefined : category,
    page,
    limit: PAGE_SIZE,
  });

  const banners = data?.banners ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * PAGE_SIZE + banners.length;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <h2 className="text-[18px] font-bold text-slate-800">Previously Posted Banners</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Status' : s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {BANNER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              className="h-10 w-44 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <th className="text-left font-semibold px-3 py-3">Preview</th>
              <th className="text-left font-semibold px-3 py-3">Name</th>
              <th className="text-left font-semibold px-3 py-3">Category</th>
              <th className="text-left font-semibold px-3 py-3">Date</th>
              <th className="text-left font-semibold px-3 py-3">Status</th>
              <th className="text-right font-semibold px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate-400">
                  Loading banners…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-red-400">
                  Couldn&apos;t load banners.
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate-400">
                  No banners found.
                </td>
              </tr>
            ) : (
              banners.map((b) => {
                const displayStatus = API_TO_DISPLAY_STATUS[b.status] ?? 'Draft';
                return (
                  <tr key={b.banner_id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-3 py-3">
                      {b.image_url ? (
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <Image src={b.image_url} alt={b.title} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <BannerThumb />
                      )}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800 max-w-[220px] truncate">{b.title}</td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{b.category || '—'}</td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                      {formatBannerDate(b.status === 'scheduled' ? b.scheduled_date : b.webinar_date)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          statusBadge[displayStatus]
                        )}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button type="button" onClick={() => setPreviewBanner(b)} className="hover:text-slate-600 cursor-pointer" aria-label="View"><Eye className="w-4 h-4" /></button>
                        <button
                          type="button"
                          onClick={() => onEdit?.(b)}
                          disabled={b.status === 'published'}
                          title={b.status === 'published' ? "Published banners can't be edited" : 'Edit'}
                          className="hover:text-emerald-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${b.title}"? This can't be undone.`)) {
                              deleteBanner.mutate(b.banner_id);
                            }
                          }}
                          disabled={deleteBanner.isPending}
                          className="hover:text-red-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: range summary + pagination */}
      <div className="flex items-center justify-between gap-4 flex-wrap mt-5">
        <p className="text-sm text-slate-400">
          {total === 0 ? 'No banners' : `Showing ${rangeStart}-${rangeEnd} of ${total} banners`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600 px-1">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {previewBanner && (
        <BannerPreviewModal banner={previewBanner} onClose={() => setPreviewBanner(null)} />
      )}
    </section>
  );
};

export const PreviousPostsList = () => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-bold text-slate-800">Previous Posts &amp; Drafts</h2>
        <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer">
          View All
        </button>
      </div>

      <div className="space-y-2">
        {PREVIOUS_POSTS.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/60 transition-colors"
          >
            <BannerThumb size="xs" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>{p.meta}</span>
                <span className="text-slate-300">•</span>
                <span className={cn('font-medium', statusText[p.status])}>{p.status}</span>
              </p>
            </div>
            <button type="button" className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="More">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
