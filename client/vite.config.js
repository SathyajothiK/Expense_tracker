import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // ── Vendor code-splitting for optimized bundle loading ──────────────────
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — smallest, always cached
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // Recharts + D3 (heavy charting)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory')) {
            return 'charts';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Axios + other network utils
          if (id.includes('node_modules/axios')) {
            return 'network';
          }
          // Everything else in node_modules → vendor chunk
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Warn if any single chunk exceeds 600kb
    chunkSizeWarningLimit: 600,
  },
})
