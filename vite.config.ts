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
    allowedHosts: [
      "pushy-maryanne-snoopily.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.io",
    ],
    // Proxy for Diamond API to avoid CORS and mixed content issues
    proxy: {
      "/api/diamond": {
        target: "http://130.250.191.174:3009",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/diamond/, ""),
        secure: false,
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
