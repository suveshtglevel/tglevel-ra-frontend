// Minimal browser JWT helpers. We only read the payload (never verify — the
// backend does that); used to recover basic user info and check expiry.

export interface RaJwtPayload {
  user?: { id?: string; display_name?: string; role?: string; profile_picture?: string };
  iat?: number;
  exp?: number;
  
}

export function decodeJwt(token: string): RaJwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as RaJwtPayload;
  } catch {
    return null;
  }
}

// True when the token is missing an exp or its exp is in the past.
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
