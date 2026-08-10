import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Defaults to the local API so a fresh checkout does not silently proxy
  // development traffic to the deployed backend.
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://localhost:8000";

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT) || 5173,
      proxy: {
        // The API already namespaces its routes under /api, so the prefix is
        // forwarded as-is rather than rewritten away.
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      // Sourcemaps make production stack traces readable without shipping
      // original sources in the main bundle.
      sourcemap: true,
      rollupOptions: {
        output: {
          // Vendor code changes far less often than app code; splitting it
          // keeps long-term caching effective across deploys.
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            redux: ["@reduxjs/toolkit", "react-redux"],
            mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          },
        },
      },
    },
  };
});
