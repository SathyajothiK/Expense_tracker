// vite.config.js
import { defineConfig } from "file:///C:/Users/sathy/OneDrive/Desktop/LiveWires-Round2/Expense_tracker/client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/sathy/OneDrive/Desktop/LiveWires-Round2/Expense_tracker/client/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/sathy/OneDrive/Desktop/LiveWires-Round2/Expense_tracker/client/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // ── Vendor code-splitting for optimized bundle loading ──────────────────
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-core";
          }
          if (id.includes("node_modules/react-router")) {
            return "router";
          }
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/victory")) {
            return "charts";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          if (id.includes("node_modules/axios")) {
            return "network";
          }
          if (id.includes("node_modules/")) {
            return "vendor";
          }
        }
      }
    },
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Warn if any single chunk exceeds 600kb
    chunkSizeWarningLimit: 600
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzYXRoeVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXExpdmVXaXJlcy1Sb3VuZDJcXFxcRXhwZW5zZV90cmFja2VyXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcc2F0aHlcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxMaXZlV2lyZXMtUm91bmQyXFxcXEV4cGVuc2VfdHJhY2tlclxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3NhdGh5L09uZURyaXZlL0Rlc2t0b3AvTGl2ZVdpcmVzLVJvdW5kMi9FeHBlbnNlX3RyYWNrZXIvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0YWlsd2luZGNzcygpXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gXHUyNTAwXHUyNTAwIFZlbmRvciBjb2RlLXNwbGl0dGluZyBmb3Igb3B0aW1pemVkIGJ1bmRsZSBsb2FkaW5nIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICAvLyBSZWFjdCBjb3JlIFx1MjAxNCBzbWFsbGVzdCwgYWx3YXlzIGNhY2hlZFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LycpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QtZG9tLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3JlYWN0LWNvcmUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZWFjdCBSb3V0ZXJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXInKSkge1xuICAgICAgICAgICAgcmV0dXJuICdyb3V0ZXInO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZWNoYXJ0cyArIEQzIChoZWF2eSBjaGFydGluZylcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWNoYXJ0cycpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZDMtJykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92aWN0b3J5JykpIHtcbiAgICAgICAgICAgIHJldHVybiAnY2hhcnRzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTHVjaWRlIGljb25zXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0JykpIHtcbiAgICAgICAgICAgIHJldHVybiAnaWNvbnMnO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBBeGlvcyArIG90aGVyIG5ldHdvcmsgdXRpbHNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9heGlvcycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25ldHdvcmsnO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBFdmVyeXRoaW5nIGVsc2UgaW4gbm9kZV9tb2R1bGVzIFx1MjE5MiB2ZW5kb3IgY2h1bmtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzIGZvciBzbWFsbGVyIGJ1bmRsZXNcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgIC8vIFdhcm4gaWYgYW55IHNpbmdsZSBjaHVuayBleGNlZWRzIDYwMGtiXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1WixTQUFTLG9CQUFvQjtBQUNwYixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBRWYsY0FBSSxHQUFHLFNBQVMscUJBQXFCLEtBQUssR0FBRyxTQUFTLHlCQUF5QixHQUFHO0FBQ2hGLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLDJCQUEyQixHQUFHO0FBQzVDLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLHVCQUF1QixLQUFLLEdBQUcsU0FBUyxrQkFBa0IsS0FBSyxHQUFHLFNBQVMsc0JBQXNCLEdBQUc7QUFDbEgsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsMkJBQTJCLEdBQUc7QUFDNUMsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsb0JBQW9CLEdBQUc7QUFDckMsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsZUFBZSxHQUFHO0FBQ2hDLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxRQUFRO0FBQUE7QUFBQSxJQUVSLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
