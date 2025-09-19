import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 192.168.100.64
// 167.86.71.162
// app.vjlink.com.vn
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['app.vjlink.com.vn']
  },
})
