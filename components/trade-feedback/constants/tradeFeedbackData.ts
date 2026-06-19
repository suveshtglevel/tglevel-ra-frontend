// Types + mapping for the User Trade Feedback page. Rows are built from the
// trade-feedback API (see mapFeedbackToRow).

import type { BackendFeedback } from '@/components/trade-feedback/services/tradeFeedback.service';

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

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

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
