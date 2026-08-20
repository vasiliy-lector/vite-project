export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '\\.css\\.ts$': '@vanilla-extract/jest-transform',
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx'],
  coverageReporters: ['text', 'lcov'],
};
