import * as z from 'zod';
import axiosInstance from '@/services/axios';
import { parseResponse } from '@/lib/validate';

const BASE = '/api/v1/trade-journals';

// Lenient runtime schemas: assert the envelope + the `data` container shape the
// UI consumes. Element fields stay loose (the backend is still adding fields).
const journalsResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({ journals: z.array(z.object({}).loose()) }).loose(),
  })
  .loose();

const tradeStatsResponseSchema = z
  .object({ success: z.boolean(), data: z.object({}).loose() })
  .loose();

const updateJournalResponseSchema = z
  .object({ success: z.boolean(), data: z.object({}).loose() })
  .loose();

// A trade journal as returned by get-trade-journals. The backend currently
// returns only a subset of the fields the UI shows; richer fields (points, lot
// size, profit, exit price, etc.) are being added on the backend, so anything
// the UI consumes beyond the core set is kept optional here.
export interface BackendTradeJournal {
  _id: string;
  journal_id: string;
  community_id: string;
  sub_community_id: string;
  message_id?: string;
  trade: string;
  // Numeric values arrive as strings (e.g. "175").
  entry?: string;
  stop_loss?: string;
  // Split targets returned by the API.
  target1?: string;
  target2?: string;
  // Fallbacks for older field names.
  target?: string;
  target_1?: string;
  target_2?: string;
  // RA-filled fields (set via update-trade-journal). May be string or number.
  points?: string | number;
  quantity?: string | number;
  profit?: string | number;
  exit_price?: string | number;
  high_of?: string | number;
  date?: string; // "YYYY-MM-DD"
  time?: string; // e.g. "11:34:30 AM"
  createdAt?: string;
  updatedAt?: string;
}

export interface TradeJournalPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface GetTradeJournalsResponse {
  success: boolean;
  message: string;
  data: {
    journals: BackendTradeJournal[];
    pagination: TradeJournalPagination;
  };
}

export interface GetTradeJournalsParams {
  communityId: string;
  subCommunityId: string;
  page: number;
  limit: number;
}

export interface TradeJournalsResult {
  journals: BackendTradeJournal[];
  pagination: TradeJournalPagination;
}

export async function getTradeJournals(
  params: GetTradeJournalsParams
): Promise<TradeJournalsResult> {
  const { data } = await axiosInstance.get<GetTradeJournalsResponse>(
    `${BASE}/get-trade-journals`,
    {
      params: {
        community_id: params.communityId,
        sub_community_id: params.subCommunityId,
        page: params.page,
        limit: params.limit,
      },
    }
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to load trade journals');
  }
  parseResponse(journalsResponseSchema, data, 'trade journals');
  return data.data;
}

// ----- User (customer) trade journals --------------------------------------

// A trade journal logged by an end user (customer), returned by
// get-user-trade-journals. Numeric values arrive as numbers here. phone_number
// and the community id arrays are not present on every record.
export interface BackendUserTradeJournal {
  _id: string;
  user_id: string;
  user_name: string;
  phone_number?: string;
  community_ids?: string[];
  sub_community_ids?: string[];
  entry: number;
  exit: number;
  qty: number;
  points: number;
  pnl: number;
  trade_date: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GetUserTradeJournalsResponse {
  success: boolean;
  message: string;
  data: {
    journals: BackendUserTradeJournal[];
    pagination: TradeJournalPagination;
  };
}

export interface UserTradeJournalsResult {
  journals: BackendUserTradeJournal[];
  pagination: TradeJournalPagination;
}

export async function getUserTradeJournals(
  params: { page?: number; limit?: number } = {}
): Promise<UserTradeJournalsResult> {
  const { data } = await axiosInstance.get<GetUserTradeJournalsResponse>(
    `${BASE}/get-user-trade-journals`,
    { params: { page: params.page ?? 1, limit: params.limit ?? 1000 } }
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to load user trade journals');
  }
  parseResponse(journalsResponseSchema, data, 'user trade journals');
  return data.data;
}

// ----- Trade stats ----------------------------------------------------------

// Aggregate stats for one sub-community. winRatio is returned as a string with
// a percent sign (e.g. "16.7%").
export interface TradeStats {
  totalTrades: number;
  totalProfit: number;
  winRatio: string;
  activeTrades: number;
}

interface GetTradeStatsResponse {
  success: boolean;
  message: string;
  data: TradeStats;
}

export async function getTradeStats(params: {
  communityId: string;
  subCommunityId: string;
}): Promise<TradeStats> {
  const { data } = await axiosInstance.get<GetTradeStatsResponse>(
    `${BASE}/get-trade-stats`,
    {
      params: {
        community_id: params.communityId,
        sub_community_id: params.subCommunityId,
      },
    }
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to load trade stats');
  }
  parseResponse(tradeStatsResponseSchema, data, 'trade stats');
  return data.data;
}

// ----- Update (RA fills the analysis fields) --------------------------------

// The only fields update-trade-journal accepts. Sent as JSON; the backend takes
// strings for most values and a number for quantity (matching the API example).
export interface UpdateTradeJournalInput {
  points?: string;
  quantity?: number;
  profit?: string;
  exit_price?: string;
  high_of?: string;
}

interface UpdateTradeJournalResponse {
  success: boolean;
  message: string;
  data: BackendTradeJournal;
}

export async function updateTradeJournal(
  journalId: string,
  input: UpdateTradeJournalInput
): Promise<BackendTradeJournal> {
  const { data } = await axiosInstance.patch<UpdateTradeJournalResponse>(
    `${BASE}/update-trade-journal/${journalId}`,
    input
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to update trade journal');
  }
  parseResponse(updateJournalResponseSchema, data, 'update trade journal');
  return data.data;
}
