/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:import/typescript',
    'prettier',
  ],
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
  overrides: [
    {
      files: ['tests/**/*.ts'],
      rules: {
        'max-lines': ['error', { max: 600, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': 'off',
        'max-depth': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '*.cjs', '*.mjs'],
};
