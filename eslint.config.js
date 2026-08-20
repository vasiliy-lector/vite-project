import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'playwright-report', 'test-results', '.yarn', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: [
      'e2e/**/*.ts',
      'vite.config.ts',
      'playwright.config.ts',
      'jest.config.js',
      'eslint.config.js',
    ],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
