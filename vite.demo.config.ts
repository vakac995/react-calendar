import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Demo app build configuration (for Cloudflare Pages)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "demo-dist",
    sourcemap: false,
  },
});
