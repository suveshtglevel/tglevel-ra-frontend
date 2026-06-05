'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import FilterDropdown from '@/components/trade-journal/FilterDropdown';
import JournalTabs, { type JournalTab } from '@/components/trade-journal/JournalTabs';
import {
  CUSTOMER_PAGE_SIZE,
  mapUserJournalToRow,
  type CustomerTradeRow,
} from '@/constants/customerTradeJournalData';
import { useUserTradeJournals } from '@/hooks/useUserTradeJournals';
import { getApiErrorMessage } from '@/lib/api/errors';

interface CustomerTradeJournalProps {
  tab: JournalTab;
  onTab: (tab: JournalTab) => void;
}

type SortKey = 'name' | 'points';

const formatNumber = (n: number) => n.toFixed(2);
const formatSignedPoints = (n: number) => `${n > 0 ? '+' : ''}${n}`;
const formatPnl = (n: number) => `${n >= 0 ? '+' : '-'}₹${Math.abs(n).toLocaleString('en-IN')}`;
const csvField = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function CustomerTradeJournal({ tab, onTab }: CustomerTradeJournalProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [community, setCommunity] = useState<string>('All Communities');
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const journalsQuery = useUserTradeJournals();
  const isLoading = journalsQuery.isLoading;
  const isError = journalsQuery.isError;
  const errorMessage = journalsQuery.error ? getApiErrorMessage(journalsQuery.error) : '';

  // Map the API journals to table rows once per fetch.
  const allRows = useMemo<CustomerTradeRow[]>(
    () => (journalsQuery.data?.journals ?? []).map(mapUserJournalToRow),
    [journalsQuery.data]
  );

  // Community options derived from the data ("All" + any names present).
  const communityOptions = useMemo(() => {
    const names = Array.from(new Set(allRows.map((r) => r.community).filter(Boolean)));
    return ['All Communities', ...names];
  }, [allRows]);

  // Stats computed from the fetched journals. Active trades aren't exposed by
  // this endpoint, so that card shows a count of break-even (pnl === 0) trades.
  const stats = useMemo(() => {
    const totalTrades = allRows.length;
    const totalProfit = allRows.reduce((s, r) => s + r.pnl, 0);
    const wins = allRows.filter((r) => r.pnl > 0).length;
    const winRatio = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const activeTrades = allRows.filter((r) => r.pnl === 0).length;
    return [
      { label: 'Total Trades', value: totalTrades.toLocaleString('en-IN'), icon: BarChart3, valueClass: 'text-slate-900' },
      { label: 'Total Profit', value: `₹ ${totalProfit.toLocaleString('en-IN')}`, icon: TrendingUp, valueClass: totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500' },
      { label: 'Win Ratio', value: `${winRatio.toFixed(1)}%`, icon: Target, valueClass: 'text-slate-900' },
      { label: 'Active Trades', value: String(activeTrades), icon: Activity, valueClass: 'text-slate-900' },
    ];
  }, [allRows]);

  const filtered = useMemo(() => {
    const rows = allRows.filter((r) => {
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (community !== 'All Communities' && r.community !== community) return false;
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      return (a.points - b.points) * dir;
    });
  }, [allRows, from, to, community, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CUSTOMER_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows: CustomerTradeRow[] = filtered.slice(
    (currentPage - 1) * CUSTOMER_PAGE_SIZE,
    currentPage * CUSTOMER_PAGE_SIZE
  );
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * CUSTOMER_PAGE_SIZE + 1;
  const rangeEnd = (currentPage - 1) * CUSTOMER_PAGE_SIZE + rows.length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const onReset = () => {
    setFrom('');
    setTo('');
    setCommunity('All Communities');
    setPage(1);
  };

  const downloadReport = () => {
    if (filtered.length === 0) {
      toast.error('No trades to export');
      return;
    }
    const header = ['Name', 'Mobile Number', 'Community', 'Date', 'Entry', 'Qty', 'Exit', 'Points', 'P&L'];
    const lines = filtered.map((r) =>
      [r.name, r.mobile, r.community, r.date, r.entry, r.qty, r.exit, r.points, r.pnl].map(csvField).join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-trade-journal.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} trades`);
  };

  const renderCaret = (active: boolean) =>
    active ? (
      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : (
      <ChevronsUpDown className="w-3 h-3" />
    );

  return (
    <main className="flex-1 min-w-0 overflow-hidden bg-[#F8FAFC] flex flex-col">
      <div className="px-6 lg:px-10 py-5 max-w-[1600px] mx-auto w-full flex flex-col gap-4 h-full min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap shrink-0">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900">Customer Trade Journal</h1>
            <p className="text-slate-500 text-sm mt-1">Track and analyze all trading activity.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <JournalTabs value={tab} onChange={onTab} />
            <button
              type="button"
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
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
          <div className="flex items-end gap-4 flex-wrap p-4 border-b border-slate-100 shrink-0">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">From Date</label>
              <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">To Date</label>
              <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Community</label>
              <FilterDropdown
                value={community}
                options={communityOptions}
                onChange={(v) => { setCommunity(v); setPage(1); }}
              />
            </div>
            <button
              type="button"
              onClick={onReset}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-[11px] font-bold tracking-wide text-slate-500 uppercase border-b border-slate-200">
                  <th className="text-left px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className={cn(
                        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-[11px] cursor-pointer transition-colors',
                        sortKey === 'name' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      Name
                      {renderCaret(sortKey === 'name')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-4">Mobile Number</th>
                  <th className="text-left px-4 py-4">Entry</th>
                  <th className="text-left px-4 py-4">Qty</th>
                  <th className="text-left px-4 py-4">Exit</th>
                  <th className="text-left px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('points')}
                      className={cn(
                        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-[11px] cursor-pointer transition-colors',
                        sortKey === 'points' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      Points
                      {renderCaret(sortKey === 'points')}
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">P&amp;L</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      Loading trade journals…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-red-500">
                      {errorMessage || 'Failed to load trade journals.'}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      No trades match the selected filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', row.avatarColor)}>
                            {row.initials}
                          </div>
                          <span className="font-semibold text-slate-800 whitespace-nowrap">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{row.mobile}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{formatNumber(row.entry)}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{row.qty}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{formatNumber(row.exit)}</td>
                      <td className={cn('px-4 py-4 font-semibold whitespace-nowrap', row.points >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {formatSignedPoints(row.points)}
                      </td>
                      <td className={cn('px-6 py-4 text-right font-bold whitespace-nowrap', row.pnl >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {formatPnl(row.pnl)}
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
                : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length.toLocaleString('en-IN')} entries`}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
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
