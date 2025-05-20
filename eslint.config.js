const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const noUnknownTypes = require('./no-unknown-types');

module.exports = [
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '.cache/**',
      '*.config.js',
      '*.config.ts',
      'no-unknown-types.js',
      // Additional ignore patterns from .eslintignore
      '.DS_Store',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        chrome: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
      'no-unknown-types': { rules: { warn: noUnknownTypes } },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unknown-types/warn': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Special configuration for test files
  {
    files: [
      '**/test-*.ts',
      '**/test-*.tsx',
      '**/test/*.ts',
      '**/test/*.tsx',
      '**/utils/type-test.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unknown-types/warn': 'off',
      'no-warning-comments': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
