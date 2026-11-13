import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/', '**/.auth/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
