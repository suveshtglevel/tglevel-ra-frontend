import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TRADE_ROWS, TradeRow } from '@/constants/tradeJournalData';

export type SortKey = 'date' | 'points' | 'profit' | 'lotSize';
export type SortDir = 'asc' | 'desc';

interface TradeJournalState {
  trades: TradeRow[];
  community: string;
  dateFrom: string; // ISO yyyy-mm-dd
  dateTo: string; // ISO yyyy-mm-dd
  sortKey: SortKey;
  sortDir: SortDir;
  page: number; // 1-based
  pageSize: number;
}

const DEFAULT_FILTERS = {
  community: 'All Communities',
  dateFrom: '2023-06-01',
  dateTo: '2023-06-08',
  sortKey: 'date' as SortKey,
  sortDir: 'desc' as SortDir,
  page: 1,
  pageSize: 10,
};

const initialState: TradeJournalState = {
  trades: TRADE_ROWS,
  ...DEFAULT_FILTERS,
};

const tradeJournalSlice = createSlice({
  name: 'tradeJournal',
  initialState,
  reducers: {
    setCommunity: (state, action: PayloadAction<string>) => {
      state.community = action.payload;
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
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    resetFilters: (state) => {
      Object.assign(state, DEFAULT_FILTERS);
    },
  },
});

export const {
  setCommunity,
  setDateFrom,
  setDateTo,
  toggleSort,
  setPage,
  setPageSize,
  resetFilters,
} = tradeJournalSlice.actions;

export default tradeJournalSlice.reducer;
