import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/ + https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  // eslint-disable-next-line no-undef
  base: process.env.NODE_ENV === "production" ? "/static/" : "/",
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: false,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      // Include every source file so untested modules still appear (at 0%)
      // in the report; only static assets and test scaffolding are excluded.
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/assets/**", "src/test/**", "src/**/*.test.{js,jsx}"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
