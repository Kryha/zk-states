import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  resolve: {
    alias: [
      { find: /^zk-states$/, replacement: "./src/index.ts" },
      { find: /^zk-states(.*)$/, replacement: "./src/$1.ts" },
    ],
  },
  test: {
    name: "zk-states",
    // Keeping globals to true triggers React Testing Library's auto cleanup
    // https://vitest.dev/guide/migration.html
    globals: true,
    environment: "jsdom",
    dir: "tests",
    reporters: "basic",
    coverage: {
      reporter: ["text", "json", "html", "text-summary"],
      reportsDirectory: "./coverage/",
    },
  },
});
