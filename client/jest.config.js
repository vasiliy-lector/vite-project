export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/helpers/env/env$': '<rootDir>/src/helpers/env/env.cjs.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@common/(.*)$': '<rootDir>/../common/src/$1',
  },
  transform: {
    '\\.css\\.ts$': '@vanilla-extract/jest-transform',
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/jest-setup.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/main.tsx'],
  coverageReporters: ['text', 'lcov'],
};
