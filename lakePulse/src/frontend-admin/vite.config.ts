// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables manually
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['d3'],
    },
    define: {

      global: {}, // Add this line to define the global variable
    }
  };
});