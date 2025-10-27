import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necessário para Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Necessário para Windows + Docker
      interval: 1000, // Intervalo de polling em ms
    },
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})
