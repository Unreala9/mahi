// vite.config.ts
import { defineConfig } from "file:///C:/Users/tanis/Downloads/mahi/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/tanis/Downloads/mahi/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/tanis/Downloads/mahi/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\tanis\\Downloads\\mahi";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    // bind to all addresses (IPv4 + IPv6) so both localhost and
    // LAN IPs (e.g. 192.168.x.x) work in browsers
    host: true,
    port: 8080,
    // HMR configuration for ngrok compatibility
    hmr: {
      // Don't hardcode protocol - let Vite auto-detect (wss for HTTPS, ws for HTTP)
      // Don't specify port - ngrok uses standard ports (443 for HTTPS)
      host: void 0
    },
    // Allow ngrok and other tunnel services
    allowedHosts: [
      "pushy-maryanne-snoopily.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.io",
      ".ngrok-free.app",
      ".ngrok.app",
      "localhost"
    ],
    // Enable CORS for tunnel access
    cors: true,
    // Proxy for Diamond API to avoid CORS and mixed content issues
    proxy: {
      "/api/diamond": {
        target: "http://130.250.191.174:3009",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/diamond/, ""),
        secure: false,
        timeout: 5e3,
        // 5 second timeout to fail fast
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.warn(
              "\u26A0\uFE0F Diamond API proxy error (API may be down):",
              err.code
            );
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
          });
        }
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0YW5pc1xcXFxEb3dubG9hZHNcXFxcbWFoaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdGFuaXNcXFxcRG93bmxvYWRzXFxcXG1haGlcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3RhbmlzL0Rvd25sb2Fkcy9tYWhpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgLy8gYmluZCB0byBhbGwgYWRkcmVzc2VzIChJUHY0ICsgSVB2Nikgc28gYm90aCBsb2NhbGhvc3QgYW5kXHJcbiAgICAvLyBMQU4gSVBzIChlLmcuIDE5Mi4xNjgueC54KSB3b3JrIGluIGJyb3dzZXJzXHJcbiAgICBob3N0OiB0cnVlLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIC8vIEhNUiBjb25maWd1cmF0aW9uIGZvciBuZ3JvayBjb21wYXRpYmlsaXR5XHJcbiAgICBobXI6IHtcclxuICAgICAgLy8gRG9uJ3QgaGFyZGNvZGUgcHJvdG9jb2wgLSBsZXQgVml0ZSBhdXRvLWRldGVjdCAod3NzIGZvciBIVFRQUywgd3MgZm9yIEhUVFApXHJcbiAgICAgIC8vIERvbid0IHNwZWNpZnkgcG9ydCAtIG5ncm9rIHVzZXMgc3RhbmRhcmQgcG9ydHMgKDQ0MyBmb3IgSFRUUFMpXHJcbiAgICAgIGhvc3Q6IHVuZGVmaW5lZCxcclxuICAgIH0sXHJcbiAgICAvLyBBbGxvdyBuZ3JvayBhbmQgb3RoZXIgdHVubmVsIHNlcnZpY2VzXHJcbiAgICBhbGxvd2VkSG9zdHM6IFtcclxuICAgICAgXCJwdXNoeS1tYXJ5YW5uZS1zbm9vcGlseS5uZ3Jvay1mcmVlLmRldlwiLFxyXG4gICAgICBcIi5uZ3Jvay1mcmVlLmRldlwiLFxyXG4gICAgICBcIi5uZ3Jvay5pb1wiLFxyXG4gICAgICBcIi5uZ3Jvay1mcmVlLmFwcFwiLFxyXG4gICAgICBcIi5uZ3Jvay5hcHBcIixcclxuICAgICAgXCJsb2NhbGhvc3RcIixcclxuICAgIF0sXHJcbiAgICAvLyBFbmFibGUgQ09SUyBmb3IgdHVubmVsIGFjY2Vzc1xyXG4gICAgY29yczogdHJ1ZSxcclxuICAgIC8vIFByb3h5IGZvciBEaWFtb25kIEFQSSB0byBhdm9pZCBDT1JTIGFuZCBtaXhlZCBjb250ZW50IGlzc3Vlc1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvYXBpL2RpYW1vbmRcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vMTMwLjI1MC4xOTEuMTc0OjMwMDlcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2RpYW1vbmQvLCBcIlwiKSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIHRpbWVvdXQ6IDUwMDAsIC8vIDUgc2Vjb25kIHRpbWVvdXQgdG8gZmFpbCBmYXN0XHJcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIG9wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVyciwgcmVxLCByZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgIFwiXHUyNkEwXHVGRTBGIERpYW1vbmQgQVBJIHByb3h5IGVycm9yIChBUEkgbWF5IGJlIGRvd24pOlwiLFxyXG4gICAgICAgICAgICAgIGVyci5jb2RlLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBwcm94eS5vbihcInByb3h5UmVxXCIsIChwcm94eVJlcSwgcmVxLCByZXMpID0+IHtcclxuICAgICAgICAgICAgLy8gU2lsZW50IHByb3h5IC0gZG9uJ3QgbG9nIGV2ZXJ5IHJlcXVlc3RcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoXHJcbiAgICBCb29sZWFuLFxyXG4gICksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtUixTQUFTLG9CQUFvQjtBQUNoVCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBO0FBQUE7QUFBQSxJQUdOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBRU4sS0FBSztBQUFBO0FBQUE7QUFBQSxNQUdILE1BQU07QUFBQSxJQUNSO0FBQUE7QUFBQSxJQUVBLGNBQWM7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLE1BQU07QUFBQTtBQUFBLElBRU4sT0FBTztBQUFBLE1BQ0wsZ0JBQWdCO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxtQkFBbUIsRUFBRTtBQUFBLFFBQ3JELFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQTtBQUFBLFFBQ1QsV0FBVyxDQUFDLE9BQU8sWUFBWTtBQUM3QixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEtBQUssUUFBUTtBQUNuQyxvQkFBUTtBQUFBLGNBQ047QUFBQSxjQUNBLElBQUk7QUFBQSxZQUNOO0FBQUEsVUFDRixDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFFBQVE7QUFBQSxVQUU3QyxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFO0FBQUEsSUFDOUQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
