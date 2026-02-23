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
        timeout: 30000, // 30 second timeout for slow backend
        configure: (proxy, options) => {
          proxy.on("error", (err: any, req, res) => {
            console.error("⚠️ Diamond API proxy error:", err.code, req.url);
            if (!res.headersSent) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Proxy error" }));
            }
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(`[Proxy] → ${req.url}`);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log(`[Proxy] ✅ ${req.url} → ${proxyRes.statusCode}`);
          });
        },
      },
      // Proxy for Results API to avoid CORS issues
      "/api/results": {
        target: "https://dia-results.cricketid.xyz/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/results/, ""),
        secure: true,
        timeout: 10000,
        configure: (proxy, options) => {
          proxy.on("error", (err: any, req, res) => {
            console.warn("⚠️ Results API proxy error:", err.code);
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
