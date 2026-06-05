import type { ZodType } from 'zod';

// Runtime guard for data crossing the network boundary. TypeScript only checks
// the *compile-time* shape we claim a response has (via axios generics); this
// verifies the server actually sent it. On a mismatch we fail loudly with a
// user-safe message rather than letting malformed data flow into the UI/store.
//
// Schemas are intentionally lenient (unknown keys pass through, non-essential
// fields optional) so legitimate responses never get rejected — only genuinely
// broken shapes do.
export function parseResponse<T>(schema: ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    if (process.env.NODE_ENV !== 'production') {
      // Surface the exact field issues in dev to make backend drift obvious.
      console.error(`[validate] ${context} response failed validation`, result.error.issues);
    }
    throw new Error(`Received an unexpected ${context} response from the server.`);
  }
  return result.data;
}
