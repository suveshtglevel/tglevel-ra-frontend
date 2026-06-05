import { isAxiosError } from 'axios';
import type { AppError } from './app-error';
import type { ApiErrorResponse } from '@/types/api';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

export function normalizeError(error: unknown, fallback = DEFAULT_MESSAGE): AppError {
  if (isAxiosError(error)) {
    const response = error.response;
    const data = response?.data as ApiErrorResponse | undefined;

    return {
      message: data?.message ?? error.message ?? fallback,
      status: response?.status,
      details: data?.errors ? { errors: data.errors } : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || fallback,
    };
  }

  return {
    message: fallback,
  };
}
