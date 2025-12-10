import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
    hmr:false,
   /*  hmr: {
      clientPort: 443, // ngrok uses HTTPS on port 443
      protocol: 'wss', // Use secure WebSocket for HMR
      host: 'india-pikelike-margurite.ngrok-free.dev', // Explicit HMR host for ngrok
    }, */
    allowedHosts: [
      'india-pikelike-margurite.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.app',
    ],
    // Reduce request overhead
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
    // Increase timeout for slow connections
    watch: {
      usePolling: false,
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

