// vite.config.ts
import { defineConfig } from "file:///C:/Users/shwet/OneDrive/Documents/GitHub/mahi/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/shwet/OneDrive/Documents/GitHub/mahi/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/shwet/OneDrive/Documents/GitHub/mahi/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\shwet\\OneDrive\\Documents\\GitHub\\mahi";
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
        secure: false
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzaHdldFxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXG1haGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHNod2V0XFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcbWFoaVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvc2h3ZXQvT25lRHJpdmUvRG9jdW1lbnRzL0dpdEh1Yi9tYWhpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgLy8gYmluZCB0byBhbGwgYWRkcmVzc2VzIChJUHY0ICsgSVB2Nikgc28gYm90aCBsb2NhbGhvc3QgYW5kXHJcbiAgICAvLyBMQU4gSVBzIChlLmcuIDE5Mi4xNjgueC54KSB3b3JrIGluIGJyb3dzZXJzXHJcbiAgICBob3N0OiB0cnVlLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIC8vIEhNUiBjb25maWd1cmF0aW9uIGZvciBuZ3JvayBjb21wYXRpYmlsaXR5XHJcbiAgICBobXI6IHtcclxuICAgICAgLy8gRG9uJ3QgaGFyZGNvZGUgcHJvdG9jb2wgLSBsZXQgVml0ZSBhdXRvLWRldGVjdCAod3NzIGZvciBIVFRQUywgd3MgZm9yIEhUVFApXHJcbiAgICAgIC8vIERvbid0IHNwZWNpZnkgcG9ydCAtIG5ncm9rIHVzZXMgc3RhbmRhcmQgcG9ydHMgKDQ0MyBmb3IgSFRUUFMpXHJcbiAgICAgIGhvc3Q6IHVuZGVmaW5lZCxcclxuICAgIH0sXHJcbiAgICAvLyBBbGxvdyBuZ3JvayBhbmQgb3RoZXIgdHVubmVsIHNlcnZpY2VzXHJcbiAgICBhbGxvd2VkSG9zdHM6IFtcclxuICAgICAgXCJwdXNoeS1tYXJ5YW5uZS1zbm9vcGlseS5uZ3Jvay1mcmVlLmRldlwiLFxyXG4gICAgICBcIi5uZ3Jvay1mcmVlLmRldlwiLFxyXG4gICAgICBcIi5uZ3Jvay5pb1wiLFxyXG4gICAgICBcIi5uZ3Jvay1mcmVlLmFwcFwiLFxyXG4gICAgICBcIi5uZ3Jvay5hcHBcIixcclxuICAgICAgXCJsb2NhbGhvc3RcIixcclxuICAgIF0sXHJcbiAgICAvLyBFbmFibGUgQ09SUyBmb3IgdHVubmVsIGFjY2Vzc1xyXG4gICAgY29yczogdHJ1ZSxcclxuICAgIC8vIFByb3h5IGZvciBEaWFtb25kIEFQSSB0byBhdm9pZCBDT1JTIGFuZCBtaXhlZCBjb250ZW50IGlzc3Vlc1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvYXBpL2RpYW1vbmRcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vMTMwLjI1MC4xOTEuMTc0OjMwMDlcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2RpYW1vbmQvLCBcIlwiKSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihcclxuICAgIEJvb2xlYW4sXHJcbiAgKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVVLFNBQVMsb0JBQW9CO0FBQ3BXLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUE7QUFBQTtBQUFBLElBR04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFFTixLQUFLO0FBQUE7QUFBQTtBQUFBLE1BR0gsTUFBTTtBQUFBLElBQ1I7QUFBQTtBQUFBLElBRUEsY0FBYztBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsTUFBTTtBQUFBO0FBQUEsSUFFTixPQUFPO0FBQUEsTUFDTCxnQkFBZ0I7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLG1CQUFtQixFQUFFO0FBQUEsUUFDckQsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFO0FBQUEsSUFDOUQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
