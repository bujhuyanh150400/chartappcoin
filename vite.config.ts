import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 👈 cho phép truy cập từ IP LAN
    port: 5173,       // 👈 cổng mặc định (có thể đổi nếu cần)
    strictPort: true,
  },
})
