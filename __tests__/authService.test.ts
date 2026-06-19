import axiosInstance from '@/services/axios';
import {
  sendOtp,
  verifyOtp,
  logout,
  updateProfileImage,
  type LoginResponse,
} from '@/components/auth/services/auth.service';

// All auth calls go through the shared axios instance; mock it so we can assert
// on the request payloads and feed back canned responses.
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sendOtp', () => {
  it('maps mobileNumber to the phone_number field the backend expects', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'OTP sent' },
    } as never);

    const res = await sendOtp({ mobileNumber: '9876543210' });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/ra/send-otp', {
      phone_number: '9876543210',
    });
    expect(res.message).toBe('OTP sent');
  });

  it('throws with the backend message when success is false', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: false, message: 'Too many attempts' },
    } as never);

    await expect(sendOtp({ mobileNumber: '9876543210' })).rejects.toThrow(
      'Too many attempts'
    );
  });

  it('falls back to a default message when none is provided', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(sendOtp({ mobileNumber: '1' })).rejects.toThrow('Failed to send OTP');
  });
});

describe('verifyOtp', () => {
  const login: LoginResponse = {
    success: true,
    message: 'ok',
    accessToken: 'tok_123',
    data: {
      _id: 'u1',
      display_name: 'RA One',
      phone_number: '9876543210',
      status: 'active',
      assigned_communities: ['com_1'],
      ra_id: 'ra_1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    },
  };

  it('sends phone_number + otp and returns the login payload', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: login } as never);

    const res = await verifyOtp({ mobileNumber: '9876543210', otp: '123456' });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/ra/verify-otp', {
      phone_number: '9876543210',
      otp: '123456',
    });
    expect(res.accessToken).toBe('tok_123');
  });

  it('throws "Login failed" when the OTP is rejected without a message', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: false } } as never);
    await expect(
      verifyOtp({ mobileNumber: '9876543210', otp: '000000' })
    ).rejects.toThrow('Login failed');
  });
});

describe('logout', () => {
  it('posts to the logout endpoint and returns the response as-is', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'bye' },
    } as never);

    const res = await logout();

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/ra/logout');
    expect(res.success).toBe(true);
  });
});

describe('updateProfileImage', () => {
  it('sends the file as multipart/form-data under profile_picture', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'updated',
        data: { ra_id: 'ra_1', display_name: 'RA One', profile_picture: 'url' },
      },
    } as never);

    const file = new File(['img'], 'me.png', { type: 'image/png' });
    await updateProfileImage(file);

    const [url, form, config] = (mockedAxios.put as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/v1/ra/update-profile-image');
    expect(form).toBeInstanceOf(FormData);
    expect((form as FormData).get('profile_picture')).toBe(file);
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
  });

  it('throws when the upload fails', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: { success: false, message: 'File too large' },
    } as never);

    const file = new File(['img'], 'me.png', { type: 'image/png' });
    await expect(updateProfileImage(file)).rejects.toThrow('File too large');
  });
});
