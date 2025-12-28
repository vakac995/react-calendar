import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: [
        "src/App.tsx",
        "src/main.tsx",
        "src/demo-helpers/**",
        "**/*.test.ts",
        "**/*.test.tsx",
      ],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
  publicDir: false, // Don't copy public folder for library build
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReactCalendar",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
        preserveModules: false,
      },
    },
    sourcemap: true,
    minify: "esbuild",
  },
});
