'use client';

import React, { useState } from 'react';
import { Search, Filter, Eye, Pencil, Trash2, ChevronDown, MoreVertical, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PREVIOUS_BANNERS,
  PREVIOUS_POSTS,
  TOTAL_BANNERS,
  BannerStatus,
} from '@/constants/webinarData';

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

export const PreviousBannersTable = () => {
  const [query, setQuery] = useState('');
  const rows = PREVIOUS_BANNERS.filter((b) =>
    b.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <h2 className="text-[18px] font-bold text-slate-800">Previously Posted Banners</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-10 w-44 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
          <button
            type="button"
            className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <th className="text-left font-semibold px-3 py-3">Preview</th>
              <th className="text-left font-semibold px-3 py-3">Name</th>
              <th className="text-left font-semibold px-3 py-3">Group Sent</th>
              <th className="text-left font-semibold px-3 py-3">Date</th>
              <th className="text-left font-semibold px-3 py-3">
                <span className="inline-flex items-center gap-1">Status <ChevronDown className="w-3 h-3" /></span>
              </th>
              <th className="text-right font-semibold px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate-400">
                  No banners found.
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-3">
                    <BannerThumb />
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap">{b.name}</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{b.groupSent}</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{b.date}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        statusBadge[b.status]
                      )}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button type="button" className="hover:text-slate-600 cursor-pointer" aria-label="View"><Eye className="w-4 h-4" /></button>
                      <button type="button" className="hover:text-emerald-600 cursor-pointer" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                      <button type="button" className="hover:text-red-500 cursor-pointer" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-center text-sm text-slate-400 mt-5">
        Showing 1-{rows.length} of {TOTAL_BANNERS} banners
      </p>
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
