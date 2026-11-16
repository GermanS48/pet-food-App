import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: funciona en GitHub Pages, Netlify, Vercel o cualquier hosting estático.
  base: './',
  build: {
    target: 'es2022',
    sourcemap: false,
  },
})
