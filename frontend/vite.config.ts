import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true
      }
    }
  },
  test: {
    environment: 'node',
    // Playwright owns e2e/. Without this, `vitest` tries to run those specs and
    // fails on the missing Playwright test runner.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  }
})
