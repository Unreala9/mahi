import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // bind to all addresses (IPv4 + IPv6) so both localhost and
    // LAN IPs (e.g. 192.168.x.x) work in browsers
    host: true,
    port: 8080,
    // HMR configuration for ngrok compatibility
    hmr: {
      // Don't hardcode protocol - let Vite auto-detect (wss for HTTPS, ws for HTTP)
      // Don't specify port - ngrok uses standard ports (443 for HTTPS)
      host: undefined,
    },
    // Allow ngrok and other tunnel services
    allowedHosts: [
      "pushy-maryanne-snoopily.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.io",
      ".ngrok-free.app",
      ".ngrok.app",
      "localhost",
    ],
    // Enable CORS for tunnel access
    cors: true,
    // Proxy for Diamond API to avoid CORS and mixed content issues
    proxy: {
      "/api/diamond": {
        target: "http://130.250.191.174:3009",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/diamond/, ""),
        secure: false,
        timeout: 5000, // 5 second timeout to fail fast
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.warn(
              "⚠️ Diamond API proxy error (API may be down):",
              err.code,
            );
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Silent proxy - don't log every request
          });
        },
      },
      "/casino": {
        target: "http://130.250.191.174:3009",
        changeOrigin: true,
        secure: false,
        timeout: 5000,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.warn("⚠️ Casino API timeout (using fallback data)");
            // Return empty response to prevent errors
            if (!res.headersSent) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "API unavailable", data: [] }));
            }
          });
        },
      },
      "/casinoDetail": {
        target: "http://130.250.191.174:3009",
        changeOrigin: true,
        secure: false,
        timeout: 5000,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            if (!res.headersSent) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "API unavailable", data: {} }));
            }
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
