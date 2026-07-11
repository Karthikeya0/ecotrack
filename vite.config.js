import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ── Dev Server ──────────────────────────────────────────────────────────────
  // Proxies /api requests to Flask (port 5000) to avoid CORS issues in dev.
  // In production, replace with your deployed backend URL in .env.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // ── Build Optimisation ──────────────────────────────────────────────────────
  // Split large vendor libraries into separate chunks for better caching
  // and faster first-load performance in production.
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase SDK (Auth + Firestore)
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Chart.js visualisation library
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          // React core + router
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // HTTP + icon libraries
          'vendor-utils': ['axios', 'lucide-react'],
        }
      }
    }
  }
})

