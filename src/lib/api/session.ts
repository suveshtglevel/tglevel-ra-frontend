import Cookies from 'js-cookie';
import { setAccessToken } from './tokenStore';
import type { AuthUser } from '@/redux/slices/authSlice';

// The access token stays in memory only (see tokenStore). The refresh token is
// owned by the backend as an HttpOnly cookie; the frontend never reads it.
// The user profile is persisted so that — after a reload, where we restore the
// access token via the refresh cookie — gating (assigned_communities) still
// works without an extra profile request (the refresh response has no profile).
const USER_KEY = 'ra_user';
// Defensive list of any client-side places an access token might live, cleared
// on logout. (The canonical store is in-memory; the refresh token is an HttpOnly
// cookie cleared by the backend /logout.)
const ACCESS_TOKEN_KEYS = ['accessToken', 'ra_accessToken'];

export function persistSession(accessToken: string): void {
  setAccessToken(accessToken);
}

export function persistUser(user: AuthUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage failures (private mode / disabled storage).
  }
}

export function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  setAccessToken(null);
  try {
    localStorage.removeItem(USER_KEY);
    ACCESS_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
  // Remove any client-readable access-token cookie (the HttpOnly refresh cookie
  // is cleared server-side by /logout).
  ACCESS_TOKEN_KEYS.forEach((key) => Cookies.remove(key));
}
