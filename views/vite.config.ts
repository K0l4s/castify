import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Mở server để truy cập từ các thiết bị trong cùng mạng LAN
    port: 5000, // Thay đổi cổng nếu cần thiết
    hmr: {
      protocol: 'ws', // Chuyển từ wss sang ws
    }
  },
  resolve: {
    alias: {
      'sockjs-client': 'sockjs-client/dist/sockjs.js',
    },
  },
})
