module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended', // TypeScript specific recommended rules
    // If you plan to use Prettier, add it last: 'prettier',
    'plugin:@tanstack/query/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12, // Or "latest"
    sourceType: 'module',
    project: './tsconfig.json', // IMPORTANT: Required for rules that need type information
  },
  settings: {
    react: {
      version: 'detect',
    },
    // Required for eslint-plugin-import to resolve module imports correctly with Vite
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // Add any other extensions you use
      },
      typescript: {
        alwaysTryTypes: true, // Always try to resolve types for TS files
      },
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off', // Often redundant with TypeScript interfaces/types
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Disable if you don't want to enforce explicit return types for functions
    '@typescript-eslint/no-explicit-any': 'off', // Be careful with this one!
    // Add more custom rules or overrides here
    'prettier/prettier': 'error', // Ensures Prettier formatting is applied as an ESLint error
  },
};
