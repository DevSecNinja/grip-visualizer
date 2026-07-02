import js from '@eslint/js';
import globals from 'globals';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '.vite',
      'playwright-report',
      'test-results',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    ...eslintReact.configs.recommended,
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Opinionated @eslint-react rules left off to keep this migration behaviour-neutral;
      // revisit if we want to enforce them.
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/use-state': 'off',
      '@eslint-react/set-state-in-effect': 'off',
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: {
      globals: { ...globals.vitest },
    },
  },
];
