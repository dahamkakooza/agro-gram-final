import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true, // Listen on all addresses
      proxy: {
        '/api': {
          target: env.VITE_DJANGO_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        external: [],
      },
    },
    resolve: {
      alias: {
        '@': '/src',
        '@services': '/src/services',
      },
    },
    define: {
      // Remove process.env.NODE_ENV and process.platform
      // Vite automatically handles NODE_ENV, so you don't need to define it
      'global': 'globalThis',
    },
    optimizeDeps: {
      include: ['axios'],
      exclude: [],
    },
  };
});