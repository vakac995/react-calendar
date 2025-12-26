import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: "happy-dom",

    // Global test setup
    globals: true,
    setupFiles: ["./src/test/setup.ts"],

    // Include patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "demo-dist"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/App.tsx",
        "src/**/index.ts",
      ],
      // Coverage thresholds
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },

    // Reporter configuration
    reporters: ["default", "html"],

    // Type checking (optional, can be slow)
    typecheck: {
      enabled: false,
    },
  },
});
