// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,

    hmr: {
      host: 'localhost',
    },
    
    proxy: {
      "/api":  { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/ws":   { target: "ws://127.0.0.1:8000",   ws: true, changeOrigin: true },
    },
  },

  // ADD THIS — tells Vite where to put built files
  // The Dockerfile expects files in /app/dist
  // COPY --from=builder /app/dist /usr/share/nginx/html
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

});
