import Cookies from 'js-cookie';
import { setAccessToken } from './tokenStore';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
};

// Refresh token → cookie (survives reloads, used to mint new access tokens).
// Access token → memory only (see tokenStore).
export function persistSession(accessToken: string, refreshToken: string): void {
  Cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions);
  setAccessToken(accessToken);
}

export function clearSession(): void {
  setAccessToken(null);
  Cookies.remove(REFRESH_COOKIE);
}

export const getRefreshToken = (): string | undefined => Cookies.get(REFRESH_COOKIE);
