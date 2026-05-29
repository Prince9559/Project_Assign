
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";



const NEXTJS_PATHS = [
  // "/",
  "/home",
  "/terms-and-conditions",
  "/contact",
  "/privacy-policy",
  "/about",
  "/students",
  "/recruiter",
  "/university",
  "/blogs",
  "/blog2",
  "/support",
  "/privacy",
  "/faq",
  "/recruiter",
  "/universityHome",
  "/companyHome",
  "/candidateHome",
  // Add others as needed
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // console.log("Loaded env variables",env);

  // const NEXTJS_URL = import.meta.env?.VITE_NEXTJS_URL || "http://localhost:3000";
  // const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const NEXTJS_URL = env?.VITE_NEXTJS_URL || "http://localhost:3000";
  const API_URL = env?.VITE_API_URL || "http://localhost:5009";

  console.log("Vite Config - NEXTJS_URL:", NEXTJS_URL);
  console.log("Vite Config - API_URL:", API_URL);

  //  Build proxy configuration
  const proxyEntries = {};

  NEXTJS_PATHS.forEach((path) => {
    //  EXACT match only - use regex
    const exactPathRegex =
      path === "/" ? "^/$" : `^${path.replace(/\//g, "\\/")}\\/?$`;

    proxyEntries[exactPathRegex] = {
      target: NEXTJS_URL,
      changeOrigin: true,
      secure: false,
      ws: true,
      configure: (proxy, options) => {
        proxy.on("error", (err, req, res) => {
          console.log("Proxy error:", err);
        });
      },
    };
  });

  return {
    plugins: [react()],
    base: "./",
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      port: 5180,
      strictPort: true,
      proxy: {
        // Next.js routes first (more specific)
        ...proxyEntries,
        
        // API routes
        "/api": {
          target: API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});