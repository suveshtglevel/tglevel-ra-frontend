import axiosInstance from '@/services/axios';
import {
  getTradeJournals,
  getUserTradeJournals,
  getTradeStats,
  updateTradeJournal,
} from '@/modules/trade-journal/services/tradeJournals.service';

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const pagination = { total: 1, page: 1, limit: 10, total_pages: 1 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getTradeJournals', () => {
  it('maps camelCase params onto the snake_case query the backend expects', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { journals: [], pagination },
      },
    } as never);

    await getTradeJournals({
      communityId: 'com_1',
      subCommunityId: 'sub_1',
      page: 2,
      limit: 10,
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/trade-journals/get-trade-journals',
      {
        params: {
          community_id: 'com_1',
          sub_community_id: 'sub_1',
          page: 2,
          limit: 10,
        },
      }
    );
  });

  it('returns the inner data (journals + pagination) on success', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { journals: [{ _id: 'j1' }], pagination },
      },
    } as never);

    const res = await getTradeJournals({
      communityId: 'c',
      subCommunityId: 's',
      page: 1,
      limit: 10,
    });
    expect(res.journals).toHaveLength(1);
    expect(res.pagination.total).toBe(1);
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: false, message: 'Bad request' },
    } as never);
    await expect(
      getTradeJournals({ communityId: 'c', subCommunityId: 's', page: 1, limit: 10 })
    ).rejects.toThrow('Bad request');
  });
});

describe('getUserTradeJournals', () => {
  it('defaults page to 1 and limit to 1000 when not provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { journals: [], pagination } },
    } as never);

    await getUserTradeJournals();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/trade-journals/get-user-trade-journals',
      { params: { page: 1, limit: 1000 } }
    );
  });

  it('forwards explicit pagination params', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { journals: [], pagination } },
    } as never);

    await getUserTradeJournals({ page: 3, limit: 50 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/trade-journals/get-user-trade-journals',
      { params: { page: 3, limit: 50 } }
    );
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: false, message: 'Nope' },
    } as never);
    await expect(getUserTradeJournals()).rejects.toThrow('Nope');
  });
});

describe('getTradeStats', () => {
  it('forwards the community params and returns the stats object', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { totalTrades: 12, totalProfit: 340, winRatio: '16.7%', activeTrades: 3 },
      },
    } as never);

    const stats = await getTradeStats({ communityId: 'com_1', subCommunityId: 'sub_1' });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/trade-journals/get-trade-stats',
      { params: { community_id: 'com_1', sub_community_id: 'sub_1' } }
    );
    expect(stats.winRatio).toBe('16.7%');
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: false, message: 'No data' },
    } as never);
    await expect(
      getTradeStats({ communityId: 'c', subCommunityId: 's' })
    ).rejects.toThrow('No data');
  });
});

describe('updateTradeJournal', () => {
  it('PATCHes the analysis fields to the journal id path', async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { _id: 'j1', journal_id: 'jr_1' } },
    } as never);

    const input = { points: '12', quantity: 50, profit: '600', exit_price: '187' };
    const res = await updateTradeJournal('jr_1', input);

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      '/api/v1/trade-journals/update-trade-journal/jr_1',
      input
    );
    expect(res.journal_id).toBe('jr_1');
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: { success: false, message: 'Invalid points' },
    } as never);
    await expect(updateTradeJournal('jr_1', { points: 'x' })).rejects.toThrow(
      'Invalid points'
    );
  });
});
