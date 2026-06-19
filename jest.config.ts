import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Path to the Next.js app so next.config + .env are loaded into the test env.
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Extend expect with @testing-library/jest-dom matchers.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Mirror the "@/*" -> "./*" alias from tsconfig.json.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // The jsdom test environment already provides a DOM, so use the lighter
    // browser DOMPurify instead of isomorphic-dompurify (which eagerly loads
    // jsdom and its untransformed ESM deps). Production still uses the
    // isomorphic build for correct server-side rendering.
    '^isomorphic-dompurify$': 'dompurify',
  },
  // Measure coverage on the logic layer — services, hooks, and lib helpers —
  // where bugs are costly and tests are most valuable. Pure-presentational
  // components and barrels are excluded.
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/services/**/*.ts',
    '!**/*.d.ts',
    '!**/index.ts',
    // Type-only module (interfaces only — nothing to execute).
    '!lib/errors/app-error.ts',
  ],
  // Hard floor enforced in CI so coverage on the critical paths can't regress.
  coverageThreshold: {
    global: { statements: 50, branches: 50, functions: 50, lines: 50 },
    'lib/sanitize.ts': { statements: 90, branches: 80, functions: 100, lines: 90 },
    'lib/validate.ts': { statements: 90, branches: 80, functions: 100, lines: 90 },
    'lib/errors/normalize-error.ts': { statements: 90, branches: 85, functions: 100, lines: 90 },
    'lib/errors/api-error.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
};

// Exported as a function call so next/jest can load the (async) Next.js config.
export default createJestConfig(config);
