import axiosInstance from '@/services/axios';
import {
  createBundle,
  getBundles,
  type CreateBundlePayload,
} from '@/components/dashboard/services/bundle.service';

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createBundle', () => {
  const payload: CreateBundlePayload = {
    name: 'Premium',
    status: 'active',
    subCommunities_Ids: ['sub_1', 'sub_2'],
    community_id: 'com_1',
  };

  it('posts the payload verbatim and resolves with no value', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'created' },
    } as never);

    await expect(createBundle(payload)).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/v1/ra/bundle/create-bundle',
      payload
    );
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: false, message: 'Duplicate name' },
    } as never);
    await expect(createBundle(payload)).rejects.toThrow('Duplicate name');
  });
});

describe('getBundles', () => {
  it('returns the bundles array from the response', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        bundles: [
          {
            bundle_id: 'bnd_1',
            name: 'Premium',
            status: 'active',
            community_id: 'com_1',
            sub_communities: ['sub_1', 'sub_2'],
          },
        ],
      },
    } as never);

    const bundles = await getBundles();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/ra/bundle/get-bundles');
    expect(bundles).toHaveLength(1);
    expect(bundles[0].sub_communities).toEqual(['sub_1', 'sub_2']);
  });

  it('returns an empty array when bundles is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, message: 'ok' },
    } as never);
    await expect(getBundles()).resolves.toEqual([]);
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: false, message: 'Server error' },
    } as never);
    await expect(getBundles()).rejects.toThrow('Server error');
  });
});
