// Row shape + mapping for the Customer Trade Journal view. Rows are populated
// from the get-user-trade-journals API (see mapUserJournalToRow).

import type { BackendUserTradeJournal } from '@/components/trade-journal/services/tradeJournals.service';

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

export const CUSTOMER_PAGE_SIZE = 10;

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

const initialsOf = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

// Pick a stable avatar colour from a key (user id) so a customer keeps the same
// bubble colour across renders.
const colorFor = (key: string): string => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

// Map a backend user trade journal to a table row. The API does not return a
// community name, so that field is left blank (the community filter only
// narrows when a name is present).
export function mapUserJournalToRow(j: BackendUserTradeJournal): CustomerTradeRow {
  const name = j.user_name || j.phone_number || 'Unknown';
  return {
    id: j._id,
    name,
    initials: initialsOf(name),
    avatarColor: colorFor(j.user_id || j._id),
    mobile: j.phone_number || '—',
    community: '',
    date: (j.trade_date ?? '').slice(0, 10),
    entry: j.entry ?? 0,
    qty: j.qty ?? 0,
    exit: j.exit ?? 0,
    points: j.points ?? 0,
    pnl: j.pnl ?? 0,
  };
}
