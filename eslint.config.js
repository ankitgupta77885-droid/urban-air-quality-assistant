import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.js', '*.cjs', '*.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      /* ── TypeScript strict overrides ── */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],

      /* ── General quality ── */
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[property.name=/^(innerHTML|outerHTML|insertAdjacentHTML)$/]',
          message: 'Never use unsafe HTML injection APIs. Use textContent or safe DOM methods.',
        },
        {
          selector: 'Property[key.name="innerHTML"]',
          message: 'Never use innerHTML with dynamic data. Use textContent or safe DOM methods.',
        },
      ],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      /* ── Import order ── */
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      /* ── Code complexity & size limits ── */
      complexity: ['error', 10],
      'max-lines-per-function': [
        'error',
        { max: 40, skipBlankLines: true, skipComments: true },
      ],
      'max-lines': [
        'error',
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['error', 4],
      'max-depth': ['error', 3],
    },
  },
  {
    files: ['tests/**/*.ts', '*.config.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'max-lines': ['error', { max: 600, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': 'off',
      'max-depth': 'off',
    },
  },
);
