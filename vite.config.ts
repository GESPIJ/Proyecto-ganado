import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SPA de la finca. Todo corre en el navegador (proyecciones son cálculos puros y
// el inventario se guarda en localStorage). VITE_API_URL queda reservado para
// cuando se conecte un backend Mongo; sin él, se usa la capa de datos local.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
});
