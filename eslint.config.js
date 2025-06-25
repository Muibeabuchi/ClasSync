// eslint.config.js (or .cjs)

import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';

// Import individual plugin objects
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import prettierPlugin from 'eslint-plugin-prettier';

// Import config objects for extending.
import configPrettier from 'eslint-config-prettier';

export default [
  // --- Base Configuration (Applies to all relevant files) ---
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      'coverage/',
      '*.min.js',
      'package.json',
      '.prettierrc.json'
      // Add any other specific files or folders to ignore
    ],
  },

  // --- ESLint's own recommended rules ---
  pluginJs.configs.recommended,

  // --- TypeScript Configuration ---
  // This includes @typescript-eslint/parser and recommended rules
  ...tsEslint.configs.recommended,

  // --- Common Configuration for JS/JSX and TS/TSX files ---
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // This config applies to these file types
    languageOptions: {
      parser: tsEslint.parser, // Use the TypeScript parser for all applicable files
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
        ecmaVersion: 2021, // Or 'latest'
        sourceType: 'module',
        project: './tsconfig.json', // Path to your tsconfig.json (crucial for type-aware linting)
        tsconfigRootDir: import.meta.dirname, // Helps resolve tsconfig.json correctly
      },
      globals: {
        ...globals.browser, // Browser globals (window, document, etc.)
      },
    },
    settings: {
      react: {
        version: 'detect', // Auto-detect React version
        // These settings tell eslint-plugin-react that you're using the automatic JSX runtime
        pragma: 'React',
        fragment: 'Fragment',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    // Explicitly define plugins used in this configuration object.
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      '@tanstack/query': tanstackQueryPlugin,
    },
    rules: {
      // --- React Specific Rules (Overrides) ---
      'react/react-in-jsx-scope': 'off', // Keep this off for New JSX Transform
      'react/prop-types': 'off', // <--- ENSURE THIS IS OFF HERE

      // --- TypeScript Specific Rules (Overrides) ---
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Add other custom rules or overrides here as needed
    },
  },

  // --- Extending Recommended Plugin Configurations ---
  // For each recommended config, extract ONLY its rules.
  // The 'plugins' are already defined in the common config above,
  // or will be explicitly provided within these objects.

  // React Recommended Rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      ...reactPlugin.configs.recommended.rules, // Spread only the rules from recommended config
      // --- IMPORTANT: Override it again here to ensure it's OFF ---
      'react/prop-types': 'off', // <--- MAKE SURE IT'S OFF HERE TOO
      'react/react-in-jsx-scope': 'off', // Ensure this is also off here for good measure
    },
    plugins: {
      react: reactPlugin, // Ensure plugin is loaded for its rules
    },
  },
  // React Hooks Recommended Rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
  },
  // JSX-A11y Recommended Rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
    },
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
    },
  },
  // TanStack Query Recommended Rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      ...tanstackQueryPlugin.configs.recommended.rules,
    },
    plugins: {
      '@tanstack/query': tanstackQueryPlugin,
    },
  },

  // --- Prettier Configuration (MUST BE LAST to override other style rules) ---
  {
    files: ['**/*.{js,jsx,ts,tsx,json,css,md}'], // Apply this config to all relevant files
    rules: {
      ...configPrettier.rules, // Disable ESLint rules that conflict with Prettier
      'prettier/prettier': 'error', // Enforce Prettier formatting as an ESLint error
    },
    plugins: {
      prettier: prettierPlugin, // The plugin that integrates Prettier into ESLint
    },
  },
];
