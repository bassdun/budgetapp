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
    sourcemap: true,
  },
  define: {
    // Make sure process.env is defined for libraries that expect it
    'process.env': process.env
  }
}) 