// Types + mapping for the User Trade Feedback page. Rows are now built from the
// trade-feedback API (see mapFeedbackToRow); the SEEDS below are kept only as a
// fallback/reference.

import type { BackendFeedback } from '@/lib/api/tradeFeedback';

export type FeedbackSentiment = 'Positive' | 'Neutral' | 'Negative';

export interface FeedbackRow {
  id: string;
  name: string;
  userId: string;
  initials: string;
  avatarColor: string; // tailwind classes for the avatar circle
  profileImage: string | null;
  community: string;
  subCommunity: string;
  tradeName: string | null;
  tradeDate: string; // display, e.g. "12 May 2025"
  profitLoss: number | null; // signed rupees, null when not provided
  sentiment: FeedbackSentiment;
  feedback: string;
}

// Headline stats shown in the cards (design figures).
export const FEEDBACK_STATS = {
  total: 1284,
  positive: 842,
  neutral: 98,
  negative: 156,
};

export const COMMUNITY_OPTIONS = ['All Communities', 'Nifty', 'Equity', 'Commodity'] as const;
export const FEEDBACK_OPTIONS = ['All Feedback', 'Positive', 'Neutral', 'Negative'] as const;
export const TIME_OPTIONS = ['This Month', 'This Week', 'Today', 'All Time'] as const;

export const PAGE_SIZE = 8;

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-pink-100 text-pink-700',
];

interface Seed {
  name: string;
  community: string;
  tradeName: string;
  tradeDate: string;
  profitLoss: number;
  sentiment: FeedbackSentiment;
  feedback: string;
}

const SEEDS: Seed[] = [
  { name: 'Rahul Sharma', community: 'Nifty', tradeName: 'BANKNIFTY 45000 CE', tradeDate: '12 May 2025', profitLoss: 1470, sentiment: 'Positive', feedback: 'Great call, booked profit at target.' },
  { name: 'Priya Iyer', community: 'Equity', tradeName: 'Reliance Industries', tradeDate: '12 May 2025', profitLoss: -850, sentiment: 'Negative', feedback: 'SL hit, market reversed quickly.' },
  { name: 'Amit Varma', community: 'Commodity', tradeName: 'GOLD CE', tradeDate: '11 May 2025', profitLoss: -3200, sentiment: 'Negative', feedback: 'Entry was too aggressive for me.' },
  { name: 'Sneha Nair', community: 'Nifty', tradeName: 'NIFTY 22500 PE', tradeDate: '11 May 2025', profitLoss: 2150, sentiment: 'Positive', feedback: 'Clean setup, followed exactly.' },
  { name: 'Vikram Patel', community: 'Equity', tradeName: 'HDFC Bank', tradeDate: '10 May 2025', profitLoss: 640, sentiment: 'Neutral', feedback: 'Small gain, exited early.' },
  { name: 'Anjali Mehta', community: 'Commodity', tradeName: 'SILVER PE', tradeDate: '10 May 2025', profitLoss: 1890, sentiment: 'Positive', feedback: 'Loved the risk-reward on this one.' },
  { name: 'Karan Singh', community: 'Nifty', tradeName: 'BANKNIFTY 44500 PE', tradeDate: '09 May 2025', profitLoss: -1120, sentiment: 'Negative', feedback: 'Missed the exit, gave back gains.' },
  { name: 'Divya Rao', community: 'Equity', tradeName: 'Infosys', tradeDate: '09 May 2025', profitLoss: 980, sentiment: 'Neutral', feedback: 'Decent trade, nothing special.' },
  { name: 'Rohan Gupta', community: 'Nifty', tradeName: 'NIFTY 22000 CE', tradeDate: '08 May 2025', profitLoss: 3340, sentiment: 'Positive', feedback: 'Best call of the week!' },
  { name: 'Meera Joshi', community: 'Commodity', tradeName: 'CRUDE OIL CE', tradeDate: '08 May 2025', profitLoss: -560, sentiment: 'Negative', feedback: 'Volatile, got stopped out.' },
  { name: 'Arjun Reddy', community: 'Equity', tradeName: 'TCS', tradeDate: '07 May 2025', profitLoss: 1230, sentiment: 'Positive', feedback: 'Held to second target, worked well.' },
  { name: 'Pooja Desai', community: 'Nifty', tradeName: 'BANKNIFTY 45500 CE', tradeDate: '07 May 2025', profitLoss: 410, sentiment: 'Neutral', feedback: 'Marginal profit, ok overall.' },
  { name: 'Sahil Khan', community: 'Equity', tradeName: 'ICICI Bank', tradeDate: '06 May 2025', profitLoss: -2040, sentiment: 'Negative', feedback: 'Wrong direction for my view.' },
  { name: 'Neha Kapoor', community: 'Commodity', tradeName: 'GOLD PE', tradeDate: '06 May 2025', profitLoss: 2670, sentiment: 'Positive', feedback: 'Perfect timing on entry.' },
  { name: 'Manish Tiwari', community: 'Nifty', tradeName: 'NIFTY 21800 PE', tradeDate: '05 May 2025', profitLoss: 1550, sentiment: 'Positive', feedback: 'Followed the plan, good result.' },
  { name: 'Ritika Bose', community: 'Equity', tradeName: 'Axis Bank', tradeDate: '05 May 2025', profitLoss: -730, sentiment: 'Neutral', feedback: 'Flat-ish, closed for the day.' },
  { name: 'Deepak Menon', community: 'Commodity', tradeName: 'SILVER CE', tradeDate: '04 May 2025', profitLoss: 920, sentiment: 'Positive', feedback: 'Nice momentum trade.' },
  { name: 'Tara Shetty', community: 'Nifty', tradeName: 'BANKNIFTY 44000 PE', tradeDate: '04 May 2025', profitLoss: -1980, sentiment: 'Negative', feedback: 'Stopped out near the low.' },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

export const FEEDBACK_ROWS: FeedbackRow[] = SEEDS.map((s, i) => ({
  id: `fb-${i + 1}`,
  name: s.name,
  userId: `TG-${4821 - i * 13}`,
  initials: initialsOf(s.name),
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  profileImage: null,
  community: s.community,
  subCommunity: '',
  tradeName: s.tradeName,
  tradeDate: s.tradeDate,
  profitLoss: s.profitLoss,
  sentiment: s.sentiment,
  feedback: s.feedback,
}));

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-06-04T09:48:21Z" -> "04 Jun 2026" (empty when missing/invalid).
const formatFeedbackDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

// The API has no per-row sentiment, so derive it from the rating (matching how
// the stats endpoint buckets feedback): 4–5 positive, 3 neutral, 1–2 negative.
const ratingToSentiment = (rating?: number): FeedbackSentiment => {
  if (rating === undefined || rating === null) return 'Neutral';
  if (rating >= 4) return 'Positive';
  if (rating === 3) return 'Neutral';
  return 'Negative';
};

export function mapFeedbackToRow(f: BackendFeedback, index: number): FeedbackRow {
  const name = f.user_name?.trim() || 'Unknown user';
  const profit =
    f.profit === null || f.profit === undefined || f.profit === '' ? null : Number(f.profit);
  return {
    id: f.trade_feedback_id || f._id,
    name,
    userId: f.user_id,
    initials: initialsOf(name) || 'U',
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    profileImage: f.profile_image || null,
    community: f.community_name || '',
    subCommunity: f.sub_community_name || '',
    tradeName: f.trade_name ?? null,
    tradeDate: formatFeedbackDate(f.createdAt),
    profitLoss: profit !== null && Number.isNaN(profit) ? null : profit,
    sentiment: ratingToSentiment(f.rating),
    feedback: f.feedback || '',
  };
}
