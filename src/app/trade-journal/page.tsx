'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTradeJournal } from '@/hooks/useTradeJournal';
import { COMMUNITY_OPTIONS, PAGE_SIZE_OPTIONS, Suggestion } from '@/constants/tradeJournalData';
import { SortKey } from '@/redux/slices/tradeJournalSlice';
import DateRangePicker from '@/components/trade-journal/DateRangePicker';
import FilterDropdown from '@/components/trade-journal/FilterDropdown';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const suggestionStyles: Record<Suggestion, string> = {
  Hold: 'bg-blue-50 text-blue-600 border-blue-100',
  Exit: 'bg-red-50 text-red-500 border-red-100',
  'Partial Book': 'bg-amber-100 text-amber-700 border-amber-200',
  'Re-enter': 'bg-purple-50 text-purple-600 border-purple-100',
};

const formatNumber = (n: number) => n.toFixed(2);
const formatSigned = (n: number) => `${n > 0 ? '+' : ''}${n.toLocaleString('en-IN')}`;
const formatDate = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS_SHORT[m - 1]}`;
};
const numericClass = (n: number) =>
  n > 0 ? 'text-emerald-600' : n < 0 ? 'text-red-500' : 'text-slate-700';

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: 'asc' | 'desc';
  onToggle: (key: SortKey) => void;
  leadingIcon?: React.ReactNode;
}

const SortHeader = ({ label, sortKey, activeKey, dir, onToggle, leadingIcon }: SortHeaderProps) => {
  const active = activeKey === sortKey;
  return (
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-[11px] cursor-pointer transition-colors',
        active ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
      )}
    >
      {leadingIcon}
      {label}
      {active ? (
        dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronsUpDown className="w-3 h-3" />
      )}
    </button>
  );
};

export default function TradeJournalPage() {
  const tj = useTradeJournal();

  const stats = [
    { label: 'Total Trades', value: tj.stats.totalTrades.toLocaleString('en-IN'), icon: BarChart3, valueClass: 'text-slate-900' },
    { label: 'Total Profit', value: `₹ ${tj.stats.totalProfit.toLocaleString('en-IN')}`, icon: TrendingUp, valueClass: tj.stats.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500' },
    { label: 'Win Ratio', value: `${tj.stats.winRatio.toFixed(1)}%`, icon: Target, valueClass: 'text-slate-900' },
    { label: 'Active Trades', value: String(tj.stats.activeTrades), icon: Activity, valueClass: 'text-slate-900' },
  ];

  return (
    <main className="flex-1 min-w-0 overflow-hidden bg-[#F8FAFC] flex flex-col">
      <div className="px-6 lg:px-10 py-5 max-w-[1600px] mx-auto w-full flex flex-col gap-4 h-full min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap shrink-0">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900">Trade Journal</h1>
            <p className="text-slate-500 text-sm mt-1">Track and analyze all trading activity.</p>
          </div>
          <button
            type="button"
            onClick={tj.downloadReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-slate-500">{stat.label}</p>
                  <p className={cn('text-[24px] leading-tight font-bold mt-0.5', stat.valueClass)}>
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap p-4 border-b border-slate-100 shrink-0">
            <DateRangePicker from={tj.dateFrom} to={tj.dateTo} onChange={tj.onSetDateRange} />
            <FilterDropdown value={tj.community} options={COMMUNITY_OPTIONS} onChange={tj.onSetCommunity} />
            <button
              type="button"
              onClick={tj.onReset}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  <th className="text-left px-6 py-3.5">
                    <SortHeader label="Date" sortKey="date" activeKey={tj.sortKey} dir={tj.sortDir} onToggle={tj.onToggleSort} leadingIcon={<Calendar className="w-3.5 h-3.5" />} />
                  </th>
                  <th className="text-left font-semibold px-4 py-3.5">Time</th>
                  <th className="text-left font-semibold px-4 py-3.5">Trade</th>
                  <th className="text-left px-4 py-3.5"><SortHeader label="Points" sortKey="points" activeKey={tj.sortKey} dir={tj.sortDir} onToggle={tj.onToggleSort} /></th>
                  <th className="text-left px-4 py-3.5"><SortHeader label="Lot Size" sortKey="lotSize" activeKey={tj.sortKey} dir={tj.sortDir} onToggle={tj.onToggleSort} /></th>
                  <th className="text-left px-4 py-3.5"><SortHeader label="Profit" sortKey="profit" activeKey={tj.sortKey} dir={tj.sortDir} onToggle={tj.onToggleSort} /></th>
                  <th className="text-left font-semibold px-4 py-3.5">Entry</th>
                  <th className="text-left font-semibold px-4 py-3.5">Stop Loss</th>
                  <th className="text-left font-semibold px-4 py-3.5">Target</th>
                  <th className="text-left font-semibold px-4 py-3.5">Exit Price</th>
                  <th className="text-left font-semibold px-4 py-3.5">High Of</th>
                  <th className="text-center font-semibold px-6 py-3.5">Suggestion</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tj.pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-16 text-center text-slate-400">
                      No trades match the selected filters.
                    </td>
                  </tr>
                ) : (
                  tj.pageRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(row.date)}</td>
                      <td className="px-4 py-4 text-slate-500 whitespace-nowrap">{row.time}</td>
                      <td className="px-4 py-4 font-semibold text-slate-800 whitespace-nowrap">{row.trade}</td>
                      <td className={cn('px-4 py-4 font-medium whitespace-nowrap', numericClass(row.points))}>
                        {formatSigned(row.points)}
                      </td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{row.lotSize}</td>
                      <td className={cn('px-4 py-4 font-medium whitespace-nowrap', numericClass(row.profit))}>
                        {formatSigned(row.profit)}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">{formatNumber(row.entry)}</td>
                      <td className="px-4 py-4 text-slate-400 whitespace-nowrap">{formatNumber(row.stopLoss)}</td>
                      <td className="px-4 py-4 text-slate-400 whitespace-nowrap">{formatNumber(row.target)}</td>
                      <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">{formatNumber(row.exitPrice)}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{formatNumber(row.highOf)}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium',
                            suggestionStyles[row.suggestion]
                          )}
                        >
                          {row.suggestion}
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
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Showing</span>
              <FilterDropdown
                value={String(tj.pageSize)}
                options={PAGE_SIZE_OPTIONS.map(String)}
                onChange={(v) => tj.onSetPageSize(Number(v))}
                align="up"
              />
              <span>
                {tj.totalEntries === 0
                  ? 'of 0 entries'
                  : `(${tj.rangeStart}–${tj.rangeEnd}) of ${tj.totalEntries.toLocaleString('en-IN')} entries`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={tj.page <= 1}
                onClick={() => tj.onSetPage(tj.page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {tj.pageList.map((p, idx) =>
                p === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-1 text-slate-400">...</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => tj.onSetPage(p)}
                    className={cn(
                      'min-w-9 h-9 px-2 flex items-center justify-center rounded-lg border text-sm transition-colors cursor-pointer',
                      p === tj.page
                        ? 'border-emerald-500 text-emerald-600 font-semibold bg-emerald-50'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={tj.page >= tj.totalPages}
                onClick={() => tj.onSetPage(tj.page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
