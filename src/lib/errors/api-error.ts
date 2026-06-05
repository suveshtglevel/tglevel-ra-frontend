import { normalizeError } from '@/lib/errors/normalize-error';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

// Centralised error-message extraction so every catch/onError renders a
// consistent, user-safe string instead of leaking raw error objects.
export function getApiErrorMessage(error: unknown, fallback: string = DEFAULT_MESSAGE): string {
  return normalizeError(error, fallback).message;
}

// Field-level validation errors keyed by form field name, flattened to the first
// message per field. Empty object when the error isn't a validation failure.
// Use this to drive `setError` on a form (e.g. react-hook-form) so the backend's
// per-field messages surface inline next to the inputs.
export function getApiFieldErrors(error: unknown): Record<string, string> {
  const { details } = normalizeError(error);
  const errors = details?.errors as Record<string, string[]> | undefined;
  if (!errors) return {};
  const flattened: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (messages?.length) flattened[field] = messages[0];
  }
  return flattened;
}

// Whether retrying the same operation might succeed (network blip / 5xx). Use to
// decide whether to show a "Try again" affordance vs. a terminal error.
export function isRetryableError(error: unknown): boolean {
  return normalizeError(error).retryable;
}
