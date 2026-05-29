import { setAccessToken } from './tokenStore';

// Access token → memory only (see tokenStore). The refresh token is owned by
// the backend as an HttpOnly cookie; the frontend never reads or stores it.
export function persistSession(accessToken: string): void {
  setAccessToken(accessToken);
}

export function clearSession(): void {
  setAccessToken(null);
}
