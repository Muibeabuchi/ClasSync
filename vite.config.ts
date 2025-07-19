import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import tsConfigPaths from 'vite-tsconfig-paths';
// import { tanstackStart } from '@tanstack/react-start/plugin/vite';

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
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    // react
    // tanstackStart({
    // target: 'netlify',
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    tailwindcss(),
    // }),
  ],
});
