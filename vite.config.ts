import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 103.81.84.63
// 167.86.71.162
// app.vjlink.com.vn
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['103.81.84.63']
  },
})
