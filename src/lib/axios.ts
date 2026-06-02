import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from '@/lib/api/tokenStore';
import { clearSession } from '@/lib/api/session';

const BASE_URL = 'https://ra-tglevels.duckdns.org';
const REFRESH_URL = '/api/v1/ra/refresh-token';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the in-memory access token (refresh token stays in its cookie).
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mark a request so we never try to refresh-and-retry the same one twice.
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Only one refresh runs at a time; concurrent 401s wait on this promise.
let refreshPromise: Promise<string> | null = null;

// Exchange the HttpOnly ra_refreshToken cookie for a fresh access token via
// POST /api/v1/ra/refresh-token. Uses a bare axios call (no interceptors) so a
// 401 here can't recurse. Exported so app bootstrap can restore a session after
// a reload (the in-memory access token is gone, but the cookie may still be valid).
export async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post(
    `${BASE_URL}${REFRESH_URL}`,
    null,
    { withCredentials: true }
  );
  const token: string | undefined = data?.accessToken ?? data?.data?.accessToken;
  if (!token) {
    throw new Error('Refresh response did not include an access token');
  }
  setAccessToken(token);
  return token;
}

function bounceToLogin(): void {
  clearSession();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth/login';
  }
}

// On 401, try to refresh the access token once and replay the original request.
// If refresh fails (or this *was* the refresh call), drop the session and bounce.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes(REFRESH_URL);

    if (status !== 401 || !original || original._retry || isRefreshCall) {
      if (status === 401) {
        bounceToLogin();
      }
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(original);
    } catch (refreshError) {
      bounceToLogin();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default axiosInstance;
