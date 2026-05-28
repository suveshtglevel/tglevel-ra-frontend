import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setCommunity,
  setDateFrom,
  setDateTo,
  toggleSort,
  setPage,
  setPageSize,
  resetFilters,
  SortKey,
} from '@/redux/slices/tradeJournalSlice';
import { TradeRow } from '@/constants/tradeJournalData';

type PageItem = number | 'ellipsis';

// Compact pagination list: always show first + last, and a window around
// the current page, collapsing the rest into ellipses.
function buildPageList(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

const csvField = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const useTradeJournal = () => {
  const dispatch = useAppDispatch();
  const { trades, community, dateFrom, dateTo, sortKey, sortDir, page, pageSize } =
    useAppSelector((state) => state.tradeJournal);

  // Filter → sort. Memoised so we only recompute when inputs change.
  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (community !== 'All Communities' && t.community !== community) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [trades, community, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'date') {
        if (a.date !== b.date) return a.date < b.date ? -dir : dir;
        return 0;
      }
      return (a[sortKey] - b[sortKey]) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  // Stats reflect the current filtered set, so they update live with filters.
  const stats = useMemo(() => {
    const totalTrades = filtered.length;
    const totalProfit = filtered.reduce((sum, t) => sum + t.profit, 0);
    const wins = filtered.filter((t) => t.profit > 0).length;
    const winRatio = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const activeTrades = filtered.filter(
      (t) => t.suggestion === 'Hold' || t.suggestion === 'Re-enter'
    ).length;
    return { totalTrades, totalProfit, winRatio, activeTrades };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows: TradeRow[] = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize]
  );
  const pageList = useMemo(() => buildPageList(currentPage, totalPages), [currentPage, totalPages]);

  const rangeStart = sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, sorted.length);

  const downloadReport = () => {
    const header = [
      'Date', 'Time', 'Trade', 'Points', 'Lot Size', 'Profit',
      'Entry', 'Stop Loss', 'Target', 'Exit Price', 'High Of', 'Suggestion', 'Community',
    ];
    const lines = sorted.map((r) =>
      [r.date, r.time, r.trade, r.points, r.lotSize, r.profit, r.entry, r.stopLoss, r.target, r.exitPrice, r.highOf, r.suggestion, r.community]
        .map(csvField)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-journal-${dateFrom}_to_${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${sorted.length} trades`);
  };

  return {
    // data
    pageRows,
    stats,
    // filter state
    community,
    dateFrom,
    dateTo,
    sortKey,
    sortDir,
    // pagination
    page: currentPage,
    pageSize,
    totalPages,
    pageList,
    totalEntries: sorted.length,
    rangeStart,
    rangeEnd,
    // handlers
    onSetCommunity: (v: string) => dispatch(setCommunity(v)),
    onSetDateRange: (from: string, to: string) => {
      dispatch(setDateFrom(from));
      dispatch(setDateTo(to));
    },
    onToggleSort: (key: SortKey) => dispatch(toggleSort(key)),
    onSetPage: (p: number) => dispatch(setPage(p)),
    onSetPageSize: (s: number) => dispatch(setPageSize(s)),
    onReset: () => dispatch(resetFilters()),
    downloadReport,
  };
};
