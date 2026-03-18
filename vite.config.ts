import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Alias mapbox-gl to maplibre-gl for @mapbox/mapbox-gl-draw compatibility
      'mapbox-gl': 'maplibre-gl',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
