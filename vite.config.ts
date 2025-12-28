import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { createServer } from "./server/index";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    fs: {
      allow: [
    ".",               
    "./client",
    "./shared",
    path.resolve(__dirname) 
  ],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('three')) return 'vendor-three';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  plugins: [
    react(),
    expressPlugin(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      try {
        console.log("[Express Plugin] Initializing Express middleware...");
        const app = createServer();
        console.log("[Express Plugin] Express app created successfully");
        
        // Add Express app as middleware to Vite dev server
        server.middlewares.use(app);
        console.log("[Express Plugin] Middleware registered");
      } catch (error) {
        console.error("[Express Plugin] Failed to initialize:", error);
        throw error;
      }
    },
  };
}
