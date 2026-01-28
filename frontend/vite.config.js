// vite.config.js - Add react-router-dom future flag
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          forms: ['react-hook-form', 'zod']
        }
      }
    }
  },
  // Add this to suppress React Router warning
  resolve: {
    alias: {
      'react-router-dom': 'react-router-dom'
    }
  }
})