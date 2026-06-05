import axiosInstance from '@/services/axios';
import {
  getTradeFeedbackStats,
  getTradeFeedback,
} from '@/modules/trade-feedback/services/tradeFeedback.service';

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const pagination = {
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getTradeFeedbackStats', () => {
  it('calls the stats endpoint and returns the data object', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { total_feedback: 10, positive: 6, negative: 2, neutral: 2 },
      },
    } as never);

    const stats = await getTradeFeedbackStats();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/ra/trade-feedback/stats');
    expect(stats.positive).toBe(6);
  });

  it('throws a fixed message when success is false', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(getTradeFeedbackStats()).rejects.toThrow(
      'Failed to load trade feedback stats'
    );
  });
});

describe('getTradeFeedback', () => {
  it('defaults page to 1 and limit to 1000 when not provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, feedbacks: [], pagination },
    } as never);

    await getTradeFeedback();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/ra/trade-feedback/get-trade-feedback',
      { params: { page: 1, limit: 1000 } }
    );
  });

  it('forwards explicit pagination and returns feedbacks + pagination', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        feedbacks: [{ _id: 'f1', trade_feedback_id: 'tf_1', user_id: 'u1' }],
        pagination,
      },
    } as never);

    const res = await getTradeFeedback({ page: 2, limit: 25 });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/ra/trade-feedback/get-trade-feedback',
      { params: { page: 2, limit: 25 } }
    );
    expect(res.feedbacks).toHaveLength(1);
    expect(res.pagination.total).toBe(1);
  });

  it('falls back to an empty feedbacks array when the field is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, pagination },
    } as never);

    const res = await getTradeFeedback();
    expect(res.feedbacks).toEqual([]);
  });

  it('throws a fixed message when success is false', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(getTradeFeedback()).rejects.toThrow('Failed to load trade feedback');
  });
});
