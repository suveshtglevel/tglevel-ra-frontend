import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setSubCommunityId,
  setDateFrom,
  setDateTo,
  toggleSort,
  setPlFilter,
  setPage,
  setPageSize,
  resetFilters,
  ALL_SUBS,
  PLFilter,
  SortKey,
} from '@/redux/slices/tradeJournalSlice';
import { mapJournalToRow, TradeRow } from '@/constants/tradeJournalData';
import { useCommunities } from '@/hooks/useCommunities';
import { useAllTradeJournals } from '@/hooks/useAllTradeJournals';
import { getApiErrorMessage } from '@/lib/api/errors';

type PageItem = number | 'ellipsis';

// Label for the combined "every sub-community" option in the dropdown.
const ALL_SUBS_LABEL = 'All sub-communities';

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

const csvField = (v: string | number | null) => {
  const s = v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const useTradeJournal = () => {
  const dispatch = useAppDispatch();
  const { subCommunityId, dateFrom, dateTo, sortKey, sortDir, plFilter, page, pageSize } =
    useAppSelector((state) => state.tradeJournal);

  const communitiesQuery = useCommunities();
  const communities = useMemo(() => communitiesQuery.data ?? [], [communitiesQuery.data]);

  // Flat list of every sub-community across all communities, each carrying its
  // parent community_id (needed to fetch, since the API requires both ids).
  const allSubs = useMemo(
    () =>
      communities.flatMap((c) =>
        (c.sub_communities ?? []).map((s) => ({
          name: s.name,
          subCommunityId: s.sub_community_id,
          communityId: c.community_id,
        }))
      ),
    [communities]
  );

  // Fetch every sub-community's journals in parallel and merge them. The
  // dropdown selection then filters this set client-side.
  const journalsQuery = useAllTradeJournals(allSubs);

  // Map → filter (sub-community, date range, P/L) → sort. All client-side, so
  // the counts and pagination below stay consistent with what's shown. Only the
  // date sort is meaningful today — the numeric fields (incl. profit) aren't
  // returned yet, so a Profit/Loss filter currently hides every row.
  const filteredRows: TradeRow[] = useMemo(() => {
    const rows = journalsQuery.journals
      .filter((j) => subCommunityId === ALL_SUBS || j.sub_community_id === subCommunityId)
      .map(mapJournalToRow)
      .filter((r) => {
        if (dateFrom && r.date && r.date < dateFrom) return false;
        if (dateTo && r.date && r.date > dateTo) return false;
        if (plFilter === 'profit') return r.profit !== null && r.profit > 0;
        if (plFilter === 'loss') return r.profit !== null && r.profit < 0;
        return true;
      });
    const dir = sortDir === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      if (sortKey === 'date') {
        if (a.date !== b.date) return a.date < b.date ? -dir : dir;
        return 0;
      }
      return ((a[sortKey] ?? 0) - (b[sortKey] ?? 0)) * dir;
    });
  }, [journalsQuery.journals, subCommunityId, dateFrom, dateTo, sortKey, sortDir, plFilter]);

  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRows, currentPage, pageSize]
  );
  const pageList = useMemo(() => buildPageList(currentPage, totalPages), [currentPage, totalPages]);

  const rangeStart = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalEntries);

  // Total Trades reflects the current filter set; the rest depend on fields the
  // backend doesn't return yet, so they're null and shown as a dash.
  const stats = {
    totalTrades: totalEntries,
    totalProfit: null as number | null,
    winRatio: null as number | null,
    activeTrades: null as number | null,
  };

  const downloadReport = () => {
    if (filteredRows.length === 0) {
      toast.error('No trades to export');
      return;
    }
    const header = [
      'Date', 'Time', 'Trade', 'Points', 'Lot Size', 'Profit',
      'Entry', 'Stop Loss', 'Target1', 'Target2', 'Exit Price', 'High Of',
    ];
    const lines = filteredRows.map((r) =>
      [r.date, r.time, r.trade, r.points, r.lotSize, r.profit, r.entry, r.stopLoss, r.target1, r.target2, r.exitPrice, r.highOf]
        .map(csvField)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trade-journal.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredRows.length} trades`);
  };

  // "All sub-communities" first, then every individual sub-community.
  const subCommunityOptions = [ALL_SUBS_LABEL, ...allSubs.map((s) => s.name)];
  const selectedSubName =
    subCommunityId === ALL_SUBS
      ? ALL_SUBS_LABEL
      : allSubs.find((s) => s.subCommunityId === subCommunityId)?.name ?? ALL_SUBS_LABEL;

  return {
    // data
    pageRows,
    stats,
    // loading / error
    isLoading: communitiesQuery.isLoading || journalsQuery.isLoading,
    isError: communitiesQuery.isError || journalsQuery.isError,
    errorMessage: journalsQuery.error
      ? getApiErrorMessage(journalsQuery.error)
      : communitiesQuery.error
        ? getApiErrorMessage(communitiesQuery.error)
        : '',
    hasScope: allSubs.length > 0,
    // sub-community scope
    subCommunityOptions,
    selectedSubName,
    // date range
    dateFrom,
    dateTo,
    // sort
    sortKey,
    sortDir,
    // profit/loss filter
    plFilter,
    // pagination
    page: currentPage,
    pageSize,
    totalPages,
    pageList,
    totalEntries,
    rangeStart,
    rangeEnd,
    // handlers
    onSetSubCommunity: (name: string) => {
      if (name === ALL_SUBS_LABEL) {
        dispatch(setSubCommunityId(ALL_SUBS));
        return;
      }
      const match = allSubs.find((s) => s.name === name);
      if (match) dispatch(setSubCommunityId(match.subCommunityId));
    },
    onSetDateRange: (from: string, to: string) => {
      dispatch(setDateFrom(from));
      dispatch(setDateTo(to));
    },
    onToggleSort: (key: SortKey) => dispatch(toggleSort(key)),
    onSetPlFilter: (v: PLFilter) => dispatch(setPlFilter(v)),
    onSetPage: (p: number) => dispatch(setPage(p)),
    onSetPageSize: (s: number) => dispatch(setPageSize(s)),
    onReset: () => dispatch(resetFilters()),
    downloadReport,
  };
};
