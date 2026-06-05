import axiosInstance from '@/services/axios';

const BASE = '/api/v1/ra/trade-feedback';

// Overall trade-feedback counts for the RA.
export interface TradeFeedbackStats {
  total_feedback: number;
  positive: number;
  negative: number;
  neutral: number;
}

interface GetTradeFeedbackStatsResponse {
  success: boolean;
  data: TradeFeedbackStats;
}

export async function getTradeFeedbackStats(): Promise<TradeFeedbackStats> {
  const { data } = await axiosInstance.get<GetTradeFeedbackStatsResponse>(`${BASE}/stats`);
  if (!data.success) {
    throw new Error('Failed to load trade feedback stats');
  }
  return data.data;
}

// ----- Feedback list --------------------------------------------------------

// A single feedback entry. Fields beyond the core set are kept optional/nullable
// since trade_name and profit can come back null.
export interface BackendFeedback {
  _id: string;
  trade_feedback_id: string;
  user_id: string;
  user_name?: string;
  profile_image?: string | null;
  community_name?: string;
  sub_community_name?: string;
  message_id?: string;
  trade_name?: string | null;
  profit?: string | null;
  feedback?: string;
  rating?: number;
  createdAt?: string;
}

export interface TradeFeedbackPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface GetTradeFeedbackResponse {
  success: boolean;
  feedbacks: BackendFeedback[];
  pagination: TradeFeedbackPagination;
}

export interface TradeFeedbackResult {
  feedbacks: BackendFeedback[];
  pagination: TradeFeedbackPagination;
}

export async function getTradeFeedback(
  params: { page?: number; limit?: number } = {}
): Promise<TradeFeedbackResult> {
  const { data } = await axiosInstance.get<GetTradeFeedbackResponse>(
    `${BASE}/get-trade-feedback`,
    { params: { page: params.page ?? 1, limit: params.limit ?? 1000 } }
  );
  if (!data.success) {
    throw new Error('Failed to load trade feedback');
  }
  return { feedbacks: data.feedbacks ?? [], pagination: data.pagination };
}
