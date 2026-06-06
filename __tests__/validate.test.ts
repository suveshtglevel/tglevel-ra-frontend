import * as z from 'zod';
import { parseResponse } from '@/lib/validate';

const schema = z.object({ id: z.string(), name: z.string() }).loose();

describe('parseResponse', () => {
  // The failure cases intentionally feed bad data, which makes parseResponse log
  // the schema issues (its dev-mode behaviour). Silence that expected noise so a
  // green run stays clean, while still leaving real errors visible elsewhere.
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

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
