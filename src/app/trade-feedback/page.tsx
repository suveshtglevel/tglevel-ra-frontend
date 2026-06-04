'use client';

import React, { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import FilterDropdown from '@/components/trade-journal/FilterDropdown';
import {
  FEEDBACK_ROWS,
  FEEDBACK_STATS,
  COMMUNITY_OPTIONS,
  FEEDBACK_OPTIONS,
  TIME_OPTIONS,
  PAGE_SIZE,
} from '@/constants/tradeFeedbackData';

const formatSigned = (n: number) =>
  `${n > 0 ? '+' : '-'}₹${Math.abs(n).toLocaleString('en-IN')}`;

export default function TradeFeedbackPage() {
  const [query, setQuery] = useState('');
  const [community, setCommunity] = useState<string>('All Communities');
  const [feedback, setFeedback] = useState<string>('All Feedback');
  const [time, setTime] = useState<string>('This Month');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 250);

  const stats = [
    { label: 'Total Feedback', value: FEEDBACK_STATS.total.toLocaleString('en-IN'), valueClass: 'text-slate-900' },
    { label: 'Positive', value: FEEDBACK_STATS.positive.toLocaleString('en-IN'), valueClass: 'text-emerald-600' },
    { label: 'Neutral', value: FEEDBACK_STATS.neutral.toLocaleString('en-IN'), valueClass: 'text-blue-500' },
    { label: 'Negative', value: FEEDBACK_STATS.negative.toLocaleString('en-IN'), valueClass: 'text-red-500' },
  ];

  // Filter by search (name / user id), community and sentiment.
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return FEEDBACK_ROWS.filter((r) => {
      const matchesQuery =
        !q || r.name.toLowerCase().includes(q) || r.userId.toLowerCase().includes(q);
      const matchesCommunity = community === 'All Communities' || r.community === community;
      const matchesFeedback = feedback === 'All Feedback' || r.sentiment === feedback;
      return matchesQuery && matchesCommunity && matchesFeedback;
    });
  }, [debouncedQuery, community, feedback]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (safePage - 1) * PAGE_SIZE + rows.length;

  // Any filter change resets to the first page.
  const resetTo = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  return (
    <main className="flex-1 min-w-0 overflow-hidden bg-[#F8FAFC] flex flex-col">
      <div className="px-6 lg:px-10 py-5 max-w-[1600px] mx-auto w-full flex flex-col gap-4 h-full min-h-0">
        {/* Header */}
        <div className="shrink-0">
          <h1 className="text-[26px] font-bold text-slate-900">User Trade Feedback</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review customer trade feedback and track the pulse of the community trading experience.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className={cn('text-[26px] leading-tight font-bold mt-1.5', stat.valueClass)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap p-4 border-b border-slate-100 shrink-0">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name / user ID"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
              />
            </div>
            <FilterDropdown value={community} options={COMMUNITY_OPTIONS} onChange={resetTo(setCommunity)} />
            <FilterDropdown value={feedback} options={FEEDBACK_OPTIONS} onChange={resetTo(setFeedback)} />
            <FilterDropdown value={time} options={TIME_OPTIONS} onChange={resetTo(setTime)} />
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-[11px] font-bold tracking-wide text-slate-500 uppercase border-b border-slate-200">
                  <th className="text-left px-6 py-4">User Profile</th>
                  <th className="text-left px-4 py-4">Community</th>
                  <th className="text-left px-4 py-4">Trade Name</th>
                  <th className="text-left px-4 py-4">Profit / Loss</th>
                  <th className="text-left px-6 py-4">Feedback</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      No feedback matches the selected filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                              row.avatarColor
                            )}
                          >
                            {row.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 whitespace-nowrap">{row.name}</p>
                            <p className="text-[11px] text-slate-400 whitespace-nowrap">#{row.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-medium">
                          {row.community}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{row.tradeName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">({row.tradeDate})</span>
                      </td>
                      <td
                        className={cn(
                          'px-4 py-4 font-bold whitespace-nowrap',
                          row.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-500'
                        )}
                      >
                        {formatSigned(row.profitLoss)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="block text-slate-600 truncate max-w-[280px]" title={row.feedback}>
                          {row.feedback}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex items-center justify-between gap-4 flex-wrap p-4 border-t border-slate-100 shrink-0">
            <p className="text-sm text-slate-500">
              {filtered.length === 0
                ? 'No entries'
                : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} entries`}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 px-1">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
