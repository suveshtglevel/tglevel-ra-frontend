// Normalized application error shape. Every error surfaced to the UI/logging
// layer is funneled through `normalizeError` into this structure, so handling
// can branch on `source`/`retryable` (redirect on auth, field errors on
// validation, retry on network, safe copy on server errors) instead of parsing
// raw backend strings.

export type AppErrorSource = 'api' | 'validation' | 'auth' | 'network' | 'unknown';

export interface AppError {
  // Stable, machine-readable code (e.g. 'VALIDATION_ERROR').
  code: string;
  // User-safe, human-readable message. Never a raw backend stack/error object.
  message: string;
  // HTTP status when the error originated from an API response.
  status?: number;
  // Coarse classification used to decide UX behaviour.
  source: AppErrorSource;
  // Whether retrying the same operation might succeed (network / 5xx).
  retryable: boolean;
  // Correlation id for support/log lookup, when the backend provides one.
  traceId?: string;
  // Optional structured payload (e.g. field-level validation errors).
  details?: Record<string, unknown>;
}
