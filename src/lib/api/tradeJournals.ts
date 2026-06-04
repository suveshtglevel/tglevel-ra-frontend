import axiosInstance from '@/lib/axios';

const BASE = '/api/v1/trade-journals';

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
  return data.data;
}
