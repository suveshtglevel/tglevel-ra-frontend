import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

// Centralised error-message extraction so every catch/onError renders a
// consistent, user-safe string instead of leaking raw error objects.
export function getApiErrorMessage(error: unknown, fallback: string = DEFAULT_MESSAGE): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
