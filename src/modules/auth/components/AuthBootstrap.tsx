'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, setUnauthenticated } from '@/store/slices/authSlice';
import type { AuthUser } from '@/store/slices/authSlice';
import { refreshAccessToken } from '@/services/axios';
import { getAccessToken } from '@/services/tokenStore';
import { loadUser } from '@/services/session';
import { decodeJwt, isJwtExpired } from '@/lib/jwt';

// Refresh this many ms before the access token's exp, so the backend re-issues
// the HttpOnly ra_refreshToken cookie before it can lapse.
const REFRESH_SKEW_MS = 60_000;
// Floor on the scheduled delay, guarding against a hot loop when the current
// token is already at/near expiry.
const MIN_REFRESH_DELAY_MS = 5_000;

// Recover the user profile to pair with a freshly refreshed token: prefer the
// one already in the store, then the persisted user, then the JWT claims (the
// refresh response itself carries no profile).
function recoverUser(token: string, current: AuthUser | null): AuthUser {
  if (current) return current;
  const stored = loadUser();
  if (stored) return stored;
  const claims = decodeJwt(token);
  return {
    id: claims?.user?.id ?? '',
    name: claims?.user?.display_name ?? '',
    role: claims?.user?.role,
    assignedCommunities: [],
  };
}

// On first load the in-memory access token is gone, so we try a silent refresh
// against the HttpOnly ra_refreshToken cookie. If it succeeds the session is
// still alive (user goes straight to the dashboard); if it fails the refresh
// token is missing/expired and guards send the user to login.
//
// We then keep refreshing proactively, just before each access token expires:
// every refresh makes the backend rotate/re-set the ra_refreshToken cookie, so
// it stays present in the browser for the whole authenticated session instead
// of only reappearing after a manual page reload.
export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const ran = useRef(false);

  // First-load silent refresh.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // Reuse a still-valid access token persisted from a previous load instead
      // of calling /refresh-token on every reload. Refreshing per reload is what
      // produced auto-logouts under rapid reloads (a burst of refreshes that the
      // backend's rotation / rate-limiting rejected). Only refresh when there's
      // no usable token.
      const existing = getAccessToken();
      if (existing && !isJwtExpired(existing)) {
        dispatch(setCredentials({ token: existing, user: recoverUser(existing, null) }));
        return;
      }
      try {
        const t = await refreshAccessToken();
        dispatch(setCredentials({ token: t, user: recoverUser(t, null) }));
      } catch {
        dispatch(setUnauthenticated());
      }
    })();
  }, [dispatch]);

  // Proactive pre-expiry refresh, re-armed whenever the token changes (incl.
  // right after login). Only runs while authenticated; cleared on logout.
  useEffect(() => {
    if (!token) return;
    const claims = decodeJwt(token);
    if (!claims?.exp) return;

    const fireAt = claims.exp * 1000 - REFRESH_SKEW_MS;
    const delay = Math.max(fireAt - Date.now(), MIN_REFRESH_DELAY_MS);

    const id = window.setTimeout(async () => {
      try {
        const t = await refreshAccessToken();
        dispatch(setCredentials({ token: t, user: recoverUser(t, user) }));
      } catch {
        // Non-fatal: the current access token is still valid (we fire before its
        // expiry), so a transient failure here must NOT log the user out. A
        // genuinely dead session is caught by the 401 interceptor on the next
        // real request. The token state is unchanged, so this stays scheduled.
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [token, user, dispatch]);

  return <>{children}</>;
}
