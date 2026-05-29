import axios from 'axios';
import { getAccessToken } from '@/lib/api/tokenStore';
import { clearSession } from '@/lib/api/session';

const axiosInstance = axios.create({
  // Host only; endpoint paths (e.g. /api/v1/researchAnalyst/...) live in the API layer.
  baseURL: 'http://13.201.61.128:5000',
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

// On unauthorized, drop the session and bounce to login (unless already there).
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
