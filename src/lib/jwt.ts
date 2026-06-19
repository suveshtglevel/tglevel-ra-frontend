// Minimal browser JWT helpers. We only read the payload (never verify — the
// backend does that); used to recover basic user info and check expiry.

export interface RaJwtPayload {
  user?: { id?: string; display_name?: string; role?: string; profile_picture?: string };
  iat?: number;
  exp?: number;
  
}

export function decodeJwt(token: string): RaJwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // base64url -> base64, then restore the padding atob needs for some lengths.
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    // atob yields a Latin-1 byte string; decode those bytes as UTF-8 so
    // multibyte claims (accented / non-Latin display names) aren't corrupted.
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
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
