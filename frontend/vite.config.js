import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:8008';
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: { '/api': apiUrl, '/uploads': apiUrl },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-mui': [
              '@mui/material',
              '@mui/icons-material',
              '@mui/lab',
              '@mui/x-data-grid',
              '@emotion/react',
              '@emotion/styled',
            ],
            'vendor-react': [
              'react',
              'react-dom',
              'react-router-dom',
            ],
            'vendor-recharts': ['recharts'],
            'vendor-framer': ['framer-motion'],
            'vendor-i18n': ['i18next', 'i18next-browser-languagedetector', 'react-i18next'],
          },
        },
      },
    },
  };
});
