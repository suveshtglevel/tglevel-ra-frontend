import axiosInstance from '@/services/axios';
import {
  createBanner,
  updateBanner,
  listBanners,
  getSuggestedPalette,
  deleteBanner,
  type Banner,
  type BannerTheme,
} from '@/components/banner/services/banners.service';

// The banners API talks through the shared axios instance; mock it so we can
// assert on the multipart payloads and feed back canned responses.
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const theme: BannerTheme = {
  cta_button_color: '#10B981',
  text_color: '#F8FAFC',
  background_color: '#0B1F33',
  cta_button_text_color: '#FFFFFF',
};

const sampleBanner: Banner = {
  banner_id: 'bnr_a1b2c3d4',
  title: 'Smart Trading MasterClass',
  image_url: 'https://cdn.example.com/banner.png',
  status: 'draft',
  theme,
};

// Pull the FormData passed to the mocked axios call and read a field out of it.
const formField = (mock: jest.Mock, field: string): string | null => {
  const form = mock.mock.calls[0][1] as FormData;
  const value = form.get(field);
  return typeof value === 'string' ? value : null;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createBanner', () => {
  const imageFile = new File(['img'], 'banner.png', { type: 'image/png' });

  it('serializes the full theme — including cta_button_text_color — into the form', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'created', data: sampleBanner },
    } as never);

    await createBanner({ title: 'My Banner', imageFile, status: 'draft', theme });

    expect(formField(mockedAxios.post as jest.Mock, 'theme')).toBe(JSON.stringify(theme));
    const parsed = JSON.parse(formField(mockedAxios.post as jest.Mock, 'theme') as string);
    expect(parsed.cta_button_text_color).toBe('#FFFFFF');
  });

  it('sends the required title, image and status fields', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'created', data: sampleBanner },
    } as never);

    await createBanner({ title: 'My Banner', imageFile, status: 'published' });

    const form = (mockedAxios.post as jest.Mock).mock.calls[0][1] as FormData;
    expect(form.get('title')).toBe('My Banner');
    expect(form.get('status')).toBe('published');
    expect(form.get('image_url')).toBe(imageFile);
  });

  it('converts a 12-hour webinar time to 24-hour before sending', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'created', data: sampleBanner },
    } as never);

    await createBanner({ title: 'T', imageFile, status: 'draft', webinarTime: '10:00 AM' });

    expect(formField(mockedAxios.post as jest.Mock, 'webinar_time')).toBe('10:00');
  });

  it('only sends schedule fields when status is scheduled', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { success: true, message: 'created', data: sampleBanner },
    } as never);

    await createBanner({
      title: 'T',
      imageFile,
      status: 'draft',
      scheduledDate: '2026-06-15',
      scheduledTime: '09:30 AM',
    });
    expect(formField(mockedAxios.post as jest.Mock, 'scheduled_date')).toBeNull();

    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({
      data: { success: true, message: 'created', data: sampleBanner },
    } as never);

    await createBanner({
      title: 'T',
      imageFile,
      status: 'scheduled',
      scheduledDate: '2026-06-15',
      scheduledTime: '09:30 AM',
    });
    expect(formField(mockedAxios.post as jest.Mock, 'scheduled_date')).toBe('2026-06-15');
    expect(formField(mockedAxios.post as jest.Mock, 'scheduled_time')).toBe('09:30');
  });

  it('throws when the API responds with success: false', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: false, message: 'Validation error' },
    } as never);

    await expect(
      createBanner({ title: 'T', imageFile, status: 'draft' })
    ).rejects.toThrow('Validation error');
  });
});

describe('updateBanner', () => {
  it('includes cta_button_text_color in the theme and only sends cta_text with redirect_url', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: { success: true, message: 'updated', data: sampleBanner },
    } as never);

    await updateBanner('bnr_a1b2c3d4', {
      theme,
      ctaText: 'Register Now',
      redirectUrl: 'https://example.com',
    });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/api/v1/banners/bnr_a1b2c3d4',
      expect.any(FormData),
      expect.anything()
    );
    const parsed = JSON.parse(formField(mockedAxios.put as jest.Mock, 'theme') as string);
    expect(parsed.cta_button_text_color).toBe('#FFFFFF');
    expect(formField(mockedAxios.put as jest.Mock, 'cta_text')).toBe('Register Now');
    expect(formField(mockedAxios.put as jest.Mock, 'redirect_url')).toBe('https://example.com');
  });

  it('omits cta_text when redirect_url is missing (backend pairing rule)', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: { success: true, message: 'updated', data: sampleBanner },
    } as never);

    await updateBanner('bnr_a1b2c3d4', { ctaText: 'Register Now' });

    expect(formField(mockedAxios.put as jest.Mock, 'cta_text')).toBeNull();
    expect(formField(mockedAxios.put as jest.Mock, 'redirect_url')).toBeNull();
  });
});

describe('listBanners', () => {
  it('reconciles pagination fields and forwards filters', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        banners: [sampleBanner],
        total: 1,
        page: 2,
        limit: 10,
        pages: 1,
      },
    } as never);

    const page = await listBanners({ search: 'trading', status: 'draft', page: 2 });

    expect(page.banners).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(page.totalPages).toBe(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/banners',
      expect.objectContaining({
        params: expect.objectContaining({ search: 'trading', status: 'draft', page: 2 }),
      })
    );
  });

  it('derives totalPages from total/limit when the API omits it', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, banners: [], totalCount: 25, limit: 10 },
    } as never);

    const page = await listBanners({ limit: 10 });
    expect(page.totalPages).toBe(3);
  });
});

describe('getSuggestedPalette', () => {
  it('returns the palette including cta_button_text_color', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: theme },
    } as never);

    const palette = await getSuggestedPalette();
    expect(palette.cta_button_text_color).toBe('#FFFFFF');
  });

  it('throws when success is false', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(getSuggestedPalette()).rejects.toThrow('Failed to load suggested palette');
  });
});

describe('deleteBanner', () => {
  it('resolves on a successful soft-delete', async () => {
    mockedAxios.delete.mockResolvedValueOnce({
      data: { success: true, message: 'deleted' },
    } as never);
    await expect(deleteBanner('bnr_a1b2c3d4')).resolves.toBeUndefined();
  });
});
