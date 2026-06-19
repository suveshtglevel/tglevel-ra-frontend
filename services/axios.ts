import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from '@/services/tokenStore';
import { clearSession } from '@/services/session';
import { API_BASE_URL } from '@/config/env';

const BASE_URL = API_BASE_URL;
const REFRESH_URL = '/api/v1/ra/refresh-token';

const axiosInstance = axios.create({
  baseURL: BASE_URL,

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

// Exchange the HttpOnly refresh-token cookie for a fresh access token.
// Uses a bare axios call (no interceptors) so a 401 here can't recurse.
async function callRefreshEndpoint(): Promise<string> {
  const { data } = await axios.post(
    `${BASE_URL}${REFRESH_URL}`,
    null,
    { withCredentials: true }
  );
  // Accept the common field-name variants so a backend naming difference can't
  // make a successful refresh look like a failure (and log the user out).
  const token: string | undefined =
    data?.accessToken ??
    data?.access_token ??
    data?.token ??
    data?.data?.accessToken ??
    data?.data?.access_token ??
    data?.data?.token;
  if (!token) {
    throw new Error('Refresh response did not include an access token');
  }
  setAccessToken(token);
  return token;
}

// Whether an error means the session is genuinely unauthorized (so we should
// log out) vs. a transient failure (network blip, 5xx, rate-limit) that must
// NOT drop a still-valid session.
function isUnauthorized(err: unknown): boolean {
  const status = (err as AxiosError)?.response?.status;
  return status === 401 || status === 403;
}

// The backend rotates the refresh-token cookie on every call, so two refreshes
// that run at the same time across tabs would both send the *same* cookie — the
// first rotates it and the second is rejected as a reused token, logging the
// user out even though a valid cookie is present. We serialize refreshes across
// all tabs with the Web Locks API: while one tab refreshes, others wait and
// then reuse the freshly rotated cookie. Sequential refreshes are safe.
async function requestRefresh(): Promise<string> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('ra-token-refresh', () => callRefreshEndpoint());
  }
  return callRefreshEndpoint();
}

// Auth pages live at /login and /verify-otp (the (auth) route group is stripped
// from the URL), so guard against a redirect loop while already on one of them.
const AUTH_PATHS = ['/login', '/verify-otp'];

function bounceToLogin(): void {
  clearSession();
  if (
    typeof window !== 'undefined' &&
    !AUTH_PATHS.some((p) => window.location.pathname.startsWith(p))
  ) {
    window.location.href = '/login';
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
      refreshPromise = refreshPromise ?? requestRefresh();
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(original);
    } catch (refreshError) {
      // Only force logout when the refresh token itself is rejected as
      // unauthorized (invalid/expired). Transient failures — a network blip, a
      // 5xx, or the backend's refresh rate-limit — must NOT drop a still-valid
      // session; reject so the request can be retried and the cycle continues.
      if (isUnauthorized(refreshError)) {
        bounceToLogin();
      }
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

// Public API: called by AuthBootstrap on first load to silently restore a session.
export async function refreshAccessToken(): Promise<string> {
  refreshPromise = refreshPromise ?? requestRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export default axiosInstance;
