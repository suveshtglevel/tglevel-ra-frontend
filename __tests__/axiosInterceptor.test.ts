import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

jest.mock('@/config/env', () => ({ API_BASE_URL: 'https://api.test' }));
jest.mock('@/services/tokenStore', () => ({
  getAccessToken: jest.fn(),
  setAccessToken: jest.fn(),
}));
jest.mock('@/services/session', () => ({ clearSession: jest.fn() }));

import axiosInstance from '@/services/axios';
import { getAccessToken, setAccessToken } from '@/services/tokenStore';
import { clearSession } from '@/services/session';

const mockedGetToken = getAccessToken as jest.Mock;
const mockedSetToken = setAccessToken as jest.Mock;
const mockedClearSession = clearSession as jest.Mock;

// A successful adapter response for the given request config.
function ok(config: InternalAxiosRequestConfig, data: unknown = { success: true }): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}

// A 401 rejection carrying the config + response the interceptor inspects.
function unauthorized(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
    status: 401,
    statusText: 'Unauthorized',
    data: {},
    headers: {},
    config,
  });
}

// A 401 from the refresh endpoint itself (the refresh token is invalid/expired).
// This is the only refresh failure that should drop the session.
function refreshUnauthorized(): AxiosError {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, null, {
    status: 401,
    statusText: 'Unauthorized',
    data: {},
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  });
}

// jsdom's `window.location` is non-configurable, but `history.pushState` is
// supported and updates `location.pathname` — which is what the interceptor's
// auth-page guard reads.
function setPath(pathname: string) {
  window.history.pushState({}, '', pathname);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetToken.mockReturnValue(null);
});

afterEach(() => {
  jest.restoreAllMocks();
  delete (axiosInstance.defaults as { adapter?: unknown }).adapter;
});

describe('request interceptor', () => {
  it('attaches the access token as a Bearer header when present', async () => {
    mockedGetToken.mockReturnValue('tok123');
    let seen: InternalAxiosRequestConfig | undefined;
    axiosInstance.defaults.adapter = async (config) => {
      seen = config;
      return ok(config);
    };

    await axiosInstance.get('/whoami');

    expect(seen?.headers.Authorization).toBe('Bearer tok123');
  });

  it('sends no Authorization header when there is no token', async () => {
    let seen: InternalAxiosRequestConfig | undefined;
    axiosInstance.defaults.adapter = async (config) => {
      seen = config;
      return ok(config);
    };

    await axiosInstance.get('/public');

    expect(seen?.headers.Authorization).toBeUndefined();
  });
});

describe('response interceptor — refresh on 401', () => {
  it('refreshes the token once and replays the original request', async () => {
    mockedGetToken.mockReturnValue('old');
    const postSpy = jest
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { accessToken: 'fresh' } } as never);

    let calls = 0;
    axiosInstance.defaults.adapter = async (config) => {
      calls += 1;
      if (calls === 1) throw unauthorized(config);
      return ok(config, { replayed: true });
    };

    const res = await axiosInstance.get('/protected');

    expect(res.data).toEqual({ replayed: true });
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(mockedSetToken).toHaveBeenCalledWith('fresh');
    expect(calls).toBe(2);
  });

  it('runs only a single refresh for concurrent 401s (single-flight)', async () => {
    mockedGetToken.mockReturnValue('old');
    const postSpy = jest
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { accessToken: 'fresh' } } as never);

    axiosInstance.defaults.adapter = async (config) => {
      const retried = (config as InternalAxiosRequestConfig & { _retry?: boolean })._retry;
      if (!retried) throw unauthorized(config);
      return ok(config);
    };

    await Promise.all([axiosInstance.get('/a'), axiosInstance.get('/b'), axiosInstance.get('/c')]);

    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  it('clears the session and rejects when the refresh token is unauthorized (bounce path)', async () => {
    mockedGetToken.mockReturnValue('old');
    setPath('/dashboard');
    // Setting location.href makes jsdom log "Not implemented: navigation"; that
    // log is expected here, so suppress it to keep the run output clean.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(axios, 'post').mockRejectedValue(refreshUnauthorized());

    axiosInstance.defaults.adapter = async (config) => {
      throw unauthorized(config);
    };

    await expect(axiosInstance.get('/protected')).rejects.toBeDefined();

    expect(mockedClearSession).toHaveBeenCalled();
  });

  it('still clears the session on the auth-page guard branch without throwing', async () => {
    mockedGetToken.mockReturnValue('old');
    setPath('/login');
    jest.spyOn(axios, 'post').mockRejectedValue(refreshUnauthorized());

    axiosInstance.defaults.adapter = async (config) => {
      throw unauthorized(config);
    };

    await expect(axiosInstance.get('/protected')).rejects.toBeDefined();

    expect(mockedClearSession).toHaveBeenCalled();
  });

  it('keeps the session on a transient refresh failure (network/5xx — no logout)', async () => {
    mockedGetToken.mockReturnValue('old');
    setPath('/dashboard');
    // A refresh that fails without an unauthorized status is transient; the
    // session must survive so the next request can retry the refresh cycle.
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('network blip'));

    axiosInstance.defaults.adapter = async (config) => {
      throw unauthorized(config);
    };

    await expect(axiosInstance.get('/protected')).rejects.toBeDefined();

    expect(mockedClearSession).not.toHaveBeenCalled();
  });
});
