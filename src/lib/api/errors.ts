import { normalizeError } from '@/lib/errors/normalize-error';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

// Centralised error-message extraction so every catch/onError renders a
// consistent, user-safe string instead of leaking raw error objects.
export function getApiErrorMessage(error: unknown, fallback: string = DEFAULT_MESSAGE): string {
  return normalizeError(error, fallback).message;
}
