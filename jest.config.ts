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
  // Mirror the "@/*" -> "src/*" alias from tsconfig.json.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// Exported as a function call so next/jest can load the (async) Next.js config.
export default createJestConfig(config);
