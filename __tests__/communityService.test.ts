import axiosInstance from '@/services/axios';
import {
  getCommunities,
  toCommunityVM,
  type Community,
} from '@/modules/dashboard/services/community.service';

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const community: Community = {
  community_id: 'com_1',
  name: 'Nifty Traders',
  description: 'desc',
  icon_url: 'icon',
  status: 'active',
  total_users: 1234,
  sub_communities: [
    {
      sub_community_id: 'sub_1',
      name: 'Intraday',
      status: 'active',
      users: 500,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getCommunities', () => {
  it('calls the RA communities endpoint and returns the data array', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: [community] },
    } as never);

    const res = await getCommunities();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/ra/community/get-communities');
    expect(res).toHaveLength(1);
    expect(res[0].community_id).toBe('com_1');
  });

  it('returns an empty array when data is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, message: 'ok' },
    } as never);
    await expect(getCommunities()).resolves.toEqual([]);
  });

  it('throws with the backend message on failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: false, message: 'Forbidden' },
    } as never);
    await expect(getCommunities()).rejects.toThrow('Forbidden');
  });
});

describe('toCommunityVM', () => {
  it('maps a community to the view-model and formats large counts compactly', () => {
    const vm = toCommunityVM(community, ['com_1']);

    expect(vm.id).toBe('com_1');
    expect(vm.name).toBe('Nifty Traders');
    // 1234 -> "1.2k"
    expect(vm.members).toBe('1.2k');
    // The community is in the assigned list, so it is sendable.
    expect(vm.sendable).toBe(true);
    // The community icon is mapped through, and sub-communities reuse it.
    expect(vm.iconUrl).toBe('icon');
    expect(vm.subCommunities).toEqual([
      { id: 'sub_1', name: 'Intraday', members: '500', type: 'active', iconUrl: 'icon' },
    ]);
  });

  it('marks a community as non-sendable when it is not assigned', () => {
    const vm = toCommunityVM(community, ['com_other']);
    expect(vm.sendable).toBe(false);
  });

  it('drops the trailing .0 on round-thousand counts', () => {
    const vm = toCommunityVM({ ...community, total_users: 2000 }, []);
    expect(vm.members).toBe('2k');
  });

  it('renders sub-thousand counts as plain numbers', () => {
    const vm = toCommunityVM({ ...community, total_users: 42 }, []);
    expect(vm.members).toBe('42');
  });
});
