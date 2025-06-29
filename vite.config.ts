import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const ReactCompilerConfig = {
  target: '19', // '17' | '18' | '19'
};

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      target: 'netlify',
      react: {
        babel: {
          plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
        },
      },
    }),
  ],
});
