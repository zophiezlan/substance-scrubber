import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console for debugging
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'template-curly-spacing': ['error', 'never'],
      'arrow-spacing': 'error',
      'no-param-reassign': 'warn',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'scripts/**', // Ignore all legacy scripts
      'sw.js', // Old service worker
      '*.html', // HTML files don't need JS linting
    ],
  },
];
