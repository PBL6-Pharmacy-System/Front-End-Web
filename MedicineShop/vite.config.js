import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to backend to avoid CORS during development
    // Any request to /api/* will be forwarded to http://localhost:3000
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // keep path as-is (we want /api/... forwarded to /api/... on backend)
        rewrite: (path) => path
      }
    }
  }
})
