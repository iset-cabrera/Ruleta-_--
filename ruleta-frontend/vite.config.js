import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // necesario para que sea accesible externamente
    port: 5175,
    allowedHosts: ['app.dashboardreducto.win'] // 👈 tu subdominio de localtunnel
  }
})
