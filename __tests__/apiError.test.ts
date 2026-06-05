import { AxiosError, AxiosHeaders } from 'axios';
import { normalizeError } from '@/lib/errors/normalize-error';
import { getApiErrorMessage, getApiFieldErrors, isRetryableError } from '@/lib/errors/api-error';

// Build an AxiosError with the given response status/body so we can exercise the
// classification branches without a real HTTP call.
function axiosErrorWith(status: number | undefined, data?: unknown): AxiosError {
  const err = new AxiosError('Request failed');
  if (status !== undefined) {
    err.response = {
      status,
      statusText: '',
      data,
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosError['response'];
  }
  return err;
}

describe('normalizeError', () => {
  it('classifies 401/403 as a non-retryable auth error', () => {
    const e = normalizeError(axiosErrorWith(401, { message: 'Unauthorized' }));
    expect(e.source).toBe('auth');
    expect(e.retryable).toBe(false);
    expect(e.code).toBe('AUTH_ERROR');
  });

  it('classifies 400/422 as a validation error and carries field errors', () => {
    const e = normalizeError(
      axiosErrorWith(422, { message: 'Invalid', errors: { mobileNumber: ['Not registered'] } })
    );
    expect(e.source).toBe('validation');
    expect(e.details?.errors).toEqual({ mobileNumber: ['Not registered'] });
  });

  it('classifies a generic 4xx as a non-retryable API error', () => {
    const e = normalizeError(axiosErrorWith(404, { message: 'Not found' }));
    expect(e.source).toBe('api');
    expect(e.retryable).toBe(false);
    expect(e.code).toBe('API_ERROR');
  });

  it('classifies 5xx as a retryable server error', () => {
    const e = normalizeError(axiosErrorWith(503, {}));
    expect(e.source).toBe('api');
    expect(e.retryable).toBe(true);
    expect(e.code).toBe('SERVER_ERROR');
  });

  it('treats a missing response as a retryable network error', () => {
    const e = normalizeError(axiosErrorWith(undefined));
    expect(e.source).toBe('network');
    expect(e.retryable).toBe(true);
  });

  it('prefers the backend message over the raw axios message', () => {
    const e = normalizeError(axiosErrorWith(400, { message: 'Bad field' }));
    expect(e.message).toBe('Bad field');
  });

  it('falls back for non-axios errors', () => {
    expect(normalizeError(new Error('boom')).message).toBe('boom');
    expect(normalizeError('weird', 'fallback').message).toBe('fallback');
  });
});

describe('api-error helpers', () => {
  it('getApiErrorMessage returns a user-safe string', () => {
    expect(getApiErrorMessage(axiosErrorWith(500, {}), 'fallback')).toBeTruthy();
    expect(getApiErrorMessage('nope', 'fallback')).toBe('fallback');
  });

  it('getApiFieldErrors flattens to the first message per field', () => {
    const fields = getApiFieldErrors(
      axiosErrorWith(422, { message: 'Invalid', errors: { mobileNumber: ['A', 'B'], otp: ['C'] } })
    );
    expect(fields).toEqual({ mobileNumber: 'A', otp: 'C' });
  });

  it('getApiFieldErrors returns {} when there are no field errors', () => {
    expect(getApiFieldErrors(axiosErrorWith(500, {}))).toEqual({});
  });

  it('isRetryableError reflects the normalized retryable flag', () => {
    expect(isRetryableError(axiosErrorWith(503, {}))).toBe(true);
    expect(isRetryableError(axiosErrorWith(401, {}))).toBe(false);
  });
});
