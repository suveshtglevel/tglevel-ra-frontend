import type { BackendTradeJournal } from '@/components/trade-journal/services/tradeJournals.service';

// A row rendered in the Trade Journal table. The backend currently returns only
// date/time/trade/entry/stopLoss/target; the remaining numeric fields are being
// added on the backend, so they are nullable and rendered as a dash until the
// API provides them.
export interface TradeRow {
  id: string;
  date: string; // ISO yyyy-mm-dd (used for sorting + range filtering)
  time: string; // display, e.g. "11:34:30 AM"
  trade: string;
  entry: number | null;
  stopLoss: number | null;
  target1: number | null;
  target2: number | null;
  // Not yet provided by the API.
  points: number | null;
  lotSize: number | null;
  profit: number | null;
  exitPrice: number | null;
  highOf: number | null;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

// Backend sends numeric values as strings (e.g. "175") or numbers; parse to a
// number, or null when the field is absent/blank so the UI can show a dash.
const toNum = (v?: string | number | null): number | null => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export function mapJournalToRow(j: BackendTradeJournal): TradeRow {
  return {
    id: j.journal_id || j._id,
    date: j.date ?? '',
    time: j.time ?? '',
    trade: j.trade,
    entry: toNum(j.entry),
    stopLoss: toNum(j.stop_loss),
    // Prefer the API's target1/target2; fall back to older field names.
    target1: toNum(j.target1 ?? j.target_1 ?? j.target),
    target2: toNum(j.target2 ?? j.target_2),
    // RA-filled fields (null until set via update-trade-journal).
    points: toNum(j.points),
    lotSize: toNum(j.quantity),
    profit: toNum(j.profit),
    exitPrice: toNum(j.exit_price),
    highOf: toNum(j.high_of),
  };
}
