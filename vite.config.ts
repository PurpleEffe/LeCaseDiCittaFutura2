import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const normalizeBasePath = (value: string): string => {
  if (value === '/' || value === './') {
    return value;
  }

  const trimmed = value.replace(/^\/+|\/+$/g, '');
  if (!trimmed) {
    return '/';
  }

  return `/${trimmed}/`;
};

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, '.', '');

  const baseFromEnv = env.VITE_PUBLIC_BASE_PATH;
  const base = normalizeBasePath(
    baseFromEnv ?? (command === 'build' ? './' : '/')
  );

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
