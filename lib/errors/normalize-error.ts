import { isAxiosError } from 'axios';
import type { AppError } from './app-error';
import type { ApiErrorResponse } from '@/types/api';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = 'Network error. Please check your connection and try again.';

// Map an HTTP status to a coarse source, a stable code, and whether retrying the
// same operation might succeed.
function classifyStatus(status: number): Pick<AppError, 'source' | 'retryable' | 'code'> {
  if (status === 401 || status === 403) return { source: 'auth', retryable: false, code: 'AUTH_ERROR' };
  if (status === 400 || status === 422) return { source: 'validation', retryable: false, code: 'VALIDATION_ERROR' };
  if (status >= 500) return { source: 'api', retryable: true, code: 'SERVER_ERROR' };
  return { source: 'api', retryable: false, code: 'API_ERROR' };
}

// Funnel any thrown value into the normalized AppError shape. Callers branch on
// `source`/`retryable` rather than re-parsing the original error.
export function normalizeError(error: unknown, fallback = DEFAULT_MESSAGE): AppError {
  if (isAxiosError(error)) {
    const response = error.response;
    const data = response?.data as ApiErrorResponse | undefined;

    // No response = the request never reached the server (offline, DNS, CORS,
    // timeout). Always worth a retry, and we never surface the raw axios string.
    if (!response) {
      return { code: 'NETWORK_ERROR', message: NETWORK_MESSAGE, source: 'network', retryable: true };
    }

    const { source, retryable, code } = classifyStatus(response.status);
    const traceId =
      (data as { traceId?: string } | undefined)?.traceId ??
      (response.headers?.['x-request-id'] as string | undefined);

    return {
      code,
      message: data?.message ?? error.message ?? fallback,
      status: response.status,
      source,
      retryable,
      traceId,
      details: data?.errors ? { errors: data.errors } : undefined,
    };
  }

  if (error instanceof Error) {
    return { code: 'UNKNOWN', message: error.message || fallback, source: 'unknown', retryable: false };
  }

  return { code: 'UNKNOWN', message: fallback, source: 'unknown', retryable: false };
}
