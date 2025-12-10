import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Alternative config with HMR disabled for ngrok troubleshooting
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // HMR disabled - uncomment if WebSocket issues persist
    // hmr: false,
    allowedHosts: [
      'india-pikelike-margurite.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.app',
    ],
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  },
  define: {
    'global': 'globalThis',
    'process.env': '{}',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
});

