// Access token store. The short-lived access token is mirrored into
// sessionStorage so a page reload can reuse a still-valid token instead of
// forcing a /refresh-token round-trip on every load. That round-trip-per-reload
// was the cause of spurious auto-logouts when reloading rapidly: each reload
// fired a refresh, and the backend's token rotation / rate-limiting rejected
// one of the burst, 401-ing a session whose cookie was still valid.
//
// It lives in sessionStorage only — scoped per tab and cleared when the tab
// closes — rather than a cookie or localStorage, to limit exposure. Cleared on
// logout / 401 via setAccessToken(null).
const STORAGE_KEY = 'ra_accessToken';

let accessToken: string | null = null;

const readStored = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  // After a reload the in-memory copy is gone; hydrate from sessionStorage.
  accessToken = readStored();
  return accessToken;
};

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  if (typeof window === 'undefined') return;
  try {
    if (token) window.sessionStorage.setItem(STORAGE_KEY, token);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures (private mode / disabled storage).
  }
};
