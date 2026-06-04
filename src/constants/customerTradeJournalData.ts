// Mock data for the Customer Trade Journal view. The real data will come from a
// backend API later; this is shaped to make that swap straightforward.

export interface CustomerTradeRow {
  id: string;
  name: string;
  initials: string;
  avatarColor: string; // tailwind classes for the avatar bubble
  mobile: string;
  community: string;
  date: string; // ISO yyyy-mm-dd (drives the From/To date filter)
  entry: number;
  qty: number;
  exit: number;
  points: number;
  pnl: number;
}

// Top-line stats shown above the table (placeholder values pending the API).
export const CUSTOMER_STATS = {
  totalTrades: 1248,
  totalProfit: 482500,
  winRatio: 68.4,
  activeTrades: 12,
};

export const CUSTOMER_COMMUNITY_OPTIONS = [
  'All Communities',
  'Nifty',
  'Equity',
  'Commodity',
] as const;

export const CUSTOMER_PAGE_SIZE = 10;

const NAMES = [
  'Rohit Sharma', 'Priya Shah', 'Amit Mishra', 'Vikram Khanna', 'Sneha Patil',
  'Arjun Mehta', 'Kavya Nair', 'Rahul Verma', 'Pooja Reddy', 'Karan Singh',
  'Divya Iyer', 'Manish Gupta', 'Neha Joshi', 'Suresh Rao', 'Anjali Desai',
  'Vivek Kumar', 'Ritu Agarwal', 'Sanjay Pillai', 'Meera Bose', 'Gaurav Malhotra',
];

const AVATAR_COLORS = [
  'bg-rose-100 text-rose-600',
  'bg-pink-100 text-pink-600',
  'bg-violet-100 text-violet-600',
  'bg-blue-100 text-blue-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-cyan-100 text-cyan-600',
  'bg-indigo-100 text-indigo-600',
];

const COMMUNITIES = ['Nifty', 'Equity', 'Commodity'];
const BASES = [210.5, 2450, 422.1, 18900, 85, 1605, 590, 940];
const POINTS_SEQ = [45, -12, 8.4, -50, 30, -8, 60, 22, -15, 95, 18, -20];
const QTYS = [100, 500, 250, 25, 300, 75, 150, 200];

const initialsOf = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const round2 = (n: number) => Math.round(n * 100) / 100;

// Deterministic dataset (no Math.random) so SSR and reloads stay stable.
function generate(count: number): CustomerTradeRow[] {
  const rows: CustomerTradeRow[] = [];
  for (let i = 0; i < count; i++) {
    const name = NAMES[i % NAMES.length];
    const base = BASES[i % BASES.length];
    const points = POINTS_SEQ[i % POINTS_SEQ.length];
    const qty = QTYS[i % QTYS.length];
    const exit = round2(base + points);
    const day = (i % 28) + 1; // spread across May–Jun 2026
    const month = i % 2 === 0 ? '06' : '05';
    rows.push({
      id: `cust-${i + 1}`,
      name,
      initials: initialsOf(name),
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      mobile: String(9000000000 + i * 1234567).slice(0, 10),
      community: COMMUNITIES[i % COMMUNITIES.length],
      date: `2026-${month}-${String(day).padStart(2, '0')}`,
      entry: round2(base),
      qty,
      exit,
      points,
      pnl: Math.round(points * qty),
    });
  }
  return rows;
}

export const CUSTOMER_TRADE_ROWS: CustomerTradeRow[] = generate(36);
