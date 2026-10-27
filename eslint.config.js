import arch from './eslint.arch.js';
import js from '@eslint/js';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import tanstackRouter from '@tanstack/eslint-plugin-router';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import zustand from 'eslint-plugin-zustand';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist',
      '**/coverage',
      '**/playwright-report',
      '**/test-results',
      '**/node_modules',
      '**/.pnpm-store',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, zustand },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'zustand/no-destructure': ['warn', { hooks: ['useCounterStore', 'useThemeStore'] }],
    },
  },
  ...tanstackQuery.configs['flat/recommended'],
  ...tanstackRouter.configs['flat/recommended'],
  {
    files: [
      'e2e/**/*.ts',
      'client/vite.config.ts',
      'client/jest.config.js',
      'backend/jest.config.js',
      'playwright.config.ts',
      'eslint.config.js',
      'eslint.arch.js',
    ],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['{client,backend,common}/src/**/*.{ts,tsx}'],
    plugins: { arch },
    rules: {
      'arch/layers': 'error',
      'arch/colocation': 'error',
    },
  },
  prettier,
);
