import * as z from 'zod';
import { parseResponse } from '@/lib/validate';

const schema = z.object({ id: z.string(), name: z.string() }).loose();

describe('parseResponse', () => {
  it('returns the data when it matches the schema', () => {
    const out = parseResponse(schema, { id: '1', name: 'x' }, 'thing');
    expect(out).toEqual({ id: '1', name: 'x' });
  });

  it('passes through unknown extra keys (lenient)', () => {
    const out = parseResponse(schema, { id: '1', name: 'x', extra: true }, 'thing') as Record<string, unknown>;
    expect(out.extra).toBe(true);
  });

  it('throws a user-safe error naming the context on a bad shape', () => {
    expect(() => parseResponse(schema, { id: 1 }, 'thing')).toThrow(/unexpected thing response/i);
  });

  it('does not leak raw zod internals in the thrown message', () => {
    try {
      parseResponse(schema, null, 'thing');
    } catch (e) {
      expect((e as Error).message).not.toMatch(/ZodError|invalid_type/);
    }
  });
});
