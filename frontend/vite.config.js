import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,        // allows describe, test, expect globally
    environment: 'jsdom', // needed for React component testing
    setupFiles: './src/tests/setupTests.js', // optional, for RTL setup
  },
});