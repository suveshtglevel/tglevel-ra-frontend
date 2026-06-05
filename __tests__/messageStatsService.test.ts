import axiosInstance from '@/services/axios';
import {
  getMessageStats,
  type MessageStats,
} from '@/modules/dashboard/services/messageStats.service';

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getMessageStats', () => {
  const stats: MessageStats = {
    total_seen: 2,
    message_info: {
      message_id: 'msg_1',
      content: 'hello',
      type: 3,
      community_id: 'com_1',
      message_created_at: '2026-06-01T00:00:00Z',
    },
    seen_by: [
      {
        user_id: 'u1',
        name: 'Alice',
        email: 'a@example.com',
        seen_at: '2026-06-01T01:00:00Z',
        created_at: '2026-06-01T00:00:00Z',
      },
    ],
  };

  it('requests the message id in the path and returns the raw stats object', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: stats } as never);

    const res = await getMessageStats('msg_1');

    // This endpoint has no success envelope — the body IS the stats object.
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/message-stats/msg_1');
    expect(res.total_seen).toBe(2);
    expect(res.seen_by[0].name).toBe('Alice');
  });

  it('propagates a rejected request', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(getMessageStats('msg_1')).rejects.toThrow('Network error');
  });
});
