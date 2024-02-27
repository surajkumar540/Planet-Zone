import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  VITE_PUBLIC_URL: process.env.VITE_PUBLIC_URL,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://planet-backend-92ic.onrender.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  envPrefix: 'TEST_'
})
