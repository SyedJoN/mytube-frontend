

// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'


// https://vitejs.dev/config/
export default defineConfig({
  
  server: {
    proxy: {
      '/api' : 'http://localhost:3000'
    }
  },
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  optimizeDeps: {
    include: ["animejs"],
  },
    build: {
    commonjsOptions: {
      include: [/animejs/, /node_modules/],
    },
  },
})