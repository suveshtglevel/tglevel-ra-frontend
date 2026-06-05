'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setUnauthenticated } from '@/store/slices/authSlice';
import type { AuthUser } from '@/store/slices/authSlice';
import { refreshAccessToken } from '@/services/axios';
import { loadUser } from '@/services/session';
import { decodeJwt } from '@/lib/jwt';

// On first load the in-memory access token is gone, so we try a silent refresh
// against the HttpOnly ra_refreshToken cookie. If it succeeds the session is
// still alive (user goes straight to the dashboard); if it fails the refresh
// token is missing/expired and guards send the user to login.
export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const token = await refreshAccessToken();
        // The refresh response carries no profile, so recover it from the
        // persisted user (has assigned_communities) or, failing that, the JWT.
        const stored = loadUser();
        const claims = decodeJwt(token);
        const user: AuthUser = stored ?? {
          id: claims?.user?.id ?? '',
          name: claims?.user?.display_name ?? '',
          role: claims?.user?.role,
          assignedCommunities: [],
        };
        dispatch(setCredentials({ token, user }));
      } catch {
        dispatch(setUnauthenticated());
      }
    })();
  }, [dispatch]);

  return <>{children}</>;
}
