import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SortKey = 'date' | 'points' | 'profit' | 'lotSize';
export type SortDir = 'asc' | 'desc';
// Profit/Loss filter applied to the Profit column header dropdown.
export type PLFilter = 'all' | 'profit' | 'loss';

// Sentinel meaning "show journals from every sub-community combined".
export const ALL_SUBS = 'all';

interface TradeJournalState {
  // The selected sub-community id, or ALL_SUBS for the combined view. Journals
  // from every sub-community are fetched and filtered to this client-side.
  subCommunityId: string;
  dateFrom: string; // ISO yyyy-mm-dd
  dateTo: string; // ISO yyyy-mm-dd
  sortKey: SortKey;
  sortDir: SortDir;
  plFilter: PLFilter;
  page: number; // 1-based
  pageSize: number;
}

const DEFAULT_VIEW = {
  subCommunityId: ALL_SUBS,
  // Wide default window so no rows are hidden until the user narrows the range.
  dateFrom: '2025-01-01',
  dateTo: '2026-12-31',
  sortKey: 'date' as SortKey,
  sortDir: 'desc' as SortDir,
  plFilter: 'all' as PLFilter,
  page: 1,
  pageSize: 10,
};

const initialState: TradeJournalState = {
  ...DEFAULT_VIEW,
};

const tradeJournalSlice = createSlice({
  name: 'tradeJournal',
  initialState,
  reducers: {
    // Accepts a sub-community id or ALL_SUBS for the combined view.
    setSubCommunityId: (state, action: PayloadAction<string>) => {
      state.subCommunityId = action.payload;
      state.page = 1;
    },
    setDateFrom: (state, action: PayloadAction<string>) => {
      state.dateFrom = action.payload;
      state.page = 1;
    },
    setDateTo: (state, action: PayloadAction<string>) => {
      state.dateTo = action.payload;
      state.page = 1;
    },
    toggleSort: (state, action: PayloadAction<SortKey>) => {
      if (state.sortKey === action.payload) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = action.payload;
        state.sortDir = 'desc';
      }
      state.page = 1;
    },
    setPlFilter: (state, action: PayloadAction<PLFilter>) => {
      state.plFilter = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    // Resets the sub-community selection, date range, sort, P/L filter and
    // pagination back to their defaults.
    resetFilters: (state) => {
      Object.assign(state, DEFAULT_VIEW);
    },
  },
});

export const {
  setSubCommunityId,
  setDateFrom,
  setDateTo,
  toggleSort,
  setPlFilter,
  setPage,
  setPageSize,
  resetFilters,
} = tradeJournalSlice.actions;

export default tradeJournalSlice.reducer;
