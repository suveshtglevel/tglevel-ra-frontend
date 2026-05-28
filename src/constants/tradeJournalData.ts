import { COMMUNITIES } from './mockData';

export type Suggestion = 'Hold' | 'Exit' | 'Partial Book' | 'Re-enter';

export interface TradeRow {
  id: string;
  date: string; // ISO yyyy-mm-dd (used for sorting + range filtering)
  time: string; // display, e.g. "10:15 AM"
  trade: string;
  points: number;
  lotSize: number;
  profit: number; // points * lotSize
  entry: number;
  stopLoss: number;
  target: number;
  exitPrice: number;
  highOf: number;
  suggestion: Suggestion;
  community: string; // a sub-community name (e.g. "NF1")
}

// Sub-communities (not the parent communities) drive the filter dropdown.
export const SUB_COMMUNITIES: string[] = COMMUNITIES.flatMap(
  (c) => c.subCommunities ?? []
).map((s) => s.name);

export const COMMUNITY_OPTIONS = ['All Communities', ...SUB_COMMUNITIES] as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface Instrument {
  trade: string;
  base: number;
}

const INSTRUMENTS: Instrument[] = [
  { trade: 'BANKNIFTY 44000 CE', base: 210.5 },
  { trade: 'RELIANCE EQ', base: 2450 },
  { trade: 'NIFTY 18500 PE', base: 85 },
  { trade: 'TCS EQ', base: 3200 },
  { trade: 'HDFCBANK EQ', base: 1605 },
  { trade: 'BANKNIFTY 43800 PE', base: 150 },
  { trade: 'INFY EQ', base: 1280 },
  { trade: 'NIFTY FUT', base: 18450 },
  { trade: 'SBIN EQ', base: 590 },
  { trade: 'BANKNIFTY FUT', base: 44200 },
  { trade: 'NIFTY 18700 CE', base: 120 },
  { trade: 'ICICIBANK EQ', base: 940 },
];

const TIMES = ['09:25 AM', '09:30 AM', '10:05 AM', '10:15 AM', '11:30 AM', '12:40 PM', '01:45 PM', '02:10 PM', '03:05 PM'];
const POINTS_SEQ = [45, -12, 82, 15, -8, 120, 22, -5, 60, -20, 95, 33, 18, -15, 70, 40];
const LOTS = [100, 200, 250, 300, 400, 500];
const NON_EXIT: Suggestion[] = ['Hold', 'Partial Book', 'Re-enter'];

const round2 = (n: number) => Math.round(n * 100) / 100;

// Deterministic dataset (no Math.random) so SSR and reloads stay stable.
function generateTrades(count: number): TradeRow[] {
  const rows: TradeRow[] = [];
  for (let i = 0; i < count; i++) {
    const inst = INSTRUMENTS[i % INSTRUMENTS.length];
    const points = POINTS_SEQ[i % POINTS_SEQ.length];
    const lotSize = LOTS[i % LOTS.length];
    const profit = points * lotSize;
    const day = (i % 8) + 1; // spread across 01–08 Jun 2023
    const date = `2023-06-${String(day).padStart(2, '0')}`;
    const time = TIMES[i % TIMES.length];
    const base = inst.base;
    const tick = base > 1000 ? 0.5 : 1;

    const entry = round2(base);
    const stopLoss = round2(points >= 0 ? base * 0.96 : base * 0.99);
    const target = round2(points >= 0 ? base * 1.12 : base * 1.02);
    const exitPrice = round2(base + points * tick);
    const highOf = round2(Math.max(exitPrice, target) * 1.03);
    const suggestion: Suggestion = points < 0 ? 'Exit' : NON_EXIT[i % NON_EXIT.length];
    const community = SUB_COMMUNITIES[i % SUB_COMMUNITIES.length];

    rows.push({
      id: `tj-${i + 1}`,
      date,
      time,
      trade: inst.trade,
      points,
      lotSize,
      profit,
      entry,
      stopLoss,
      target,
      exitPrice,
      highOf,
      suggestion,
      community,
    });
  }
  return rows;
}

export const TRADE_ROWS: TradeRow[] = generateTrades(48);
