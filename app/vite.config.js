import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // 👈 Add this line
    port: 5173,            // 👈 Optional: explicitly set the port if needed
    proxy: {
      '/api': 'http://localhost:5051',
    },
  },
})
