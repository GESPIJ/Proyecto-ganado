import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// SPA de la finca. Todo corre en el navegador (proyecciones son cálculos puros y
// el inventario se guarda en localStorage o en el backend Mongo según VITE_API_URL).
// vite-plugin-pwa la hace instalable (manifest + service worker) sobre HTTPS.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon-32.png'],
      manifest: {
        name: 'Ganado — Finca',
        short_name: 'Ganado',
        description: 'Proyecciones e inventario de la finca',
        lang: 'es',
        theme_color: '#0c0e13',
        background_color: '#0c0e13',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallback: '/index.html',
        // No servir el shell para llamadas al backend.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: { host: true, port: 5173 },
});
