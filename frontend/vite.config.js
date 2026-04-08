import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /apps and /run_sse requests to the ADK backend
      '/apps': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/run_sse': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
