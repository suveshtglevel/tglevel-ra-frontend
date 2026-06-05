import axiosInstance from '@/services/axios';
import {
  togglePinnedMessage,
  getPinnedMessages,
} from '@/modules/dashboard/services/pinnedMessages.service';

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('togglePinnedMessage', () => {
  it('posts the message_id and returns the resulting pin status', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { status: 'unpinned' } },
    } as never);

    const status = await togglePinnedMessage('msg_1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/v1/pinned-messages/create-pinnedmessage',
      { message_id: 'msg_1' }
    );
    expect(status).toBe('unpinned');
  });

  it('defaults to "pinned" when the response omits data.status', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'ok' },
    } as never);

    await expect(togglePinnedMessage('msg_1')).resolves.toBe('pinned');
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: false, message: 'Not allowed' },
    } as never);

    await expect(togglePinnedMessage('msg_1')).rejects.toThrow('Not allowed');
  });
});

describe('getPinnedMessages', () => {
  it('forwards the community params and returns the data array', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        count: 1,
        data: [
          {
            message_id: 'msg_1',
            community_id: 'com_1',
            sub_community_id: 'sub_1',
            status: 'pinned',
          },
        ],
      },
    } as never);

    const pinned = await getPinnedMessages('com_1', 'sub_1');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/pinned-messages/get-pinnedmessages',
      { params: { community_id: 'com_1', sub_community_id: 'sub_1' } }
    );
    expect(pinned).toHaveLength(1);
    expect(pinned[0].message_id).toBe('msg_1');
  });

  it('returns an empty array when data is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, count: 0 },
    } as never);
    await expect(getPinnedMessages('c', 's')).resolves.toEqual([]);
  });

  it('throws when success is false', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(getPinnedMessages('c', 's')).rejects.toThrow(
      'Failed to load pinned messages'
    );
  });
});
