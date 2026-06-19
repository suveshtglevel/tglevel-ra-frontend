// Central, typed access to public runtime configuration.
//
// Only `NEXT_PUBLIC_*` values may live here — they are inlined into the client
// bundle and must never carry secrets. Reading env through this module (instead
// of touching `process.env` ad hoc) keeps configuration in one auditable place.

// Base URL of the backend API. Configured per environment via
// `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`).
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// An empty base URL makes every request resolve relative to the app origin,
// which fails silently in a misconfigured deploy. Surface it loudly outside
// production so the misconfiguration is obvious during development/CI.
if (!API_BASE_URL && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[env] NEXT_PUBLIC_API_BASE_URL is not set; API calls will resolve relative to the app origin.'
  );
}
