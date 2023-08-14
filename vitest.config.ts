import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  resolve: {
    alias: [
      { find: /^zk-state$/, replacement: "./src/index.ts" },
      { find: /^zk-state(.*)$/, replacement: "./src/$1.ts" },
    ],
  },
  test: {
    name: "zk-state",
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
