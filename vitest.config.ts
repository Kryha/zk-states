import { defineConfig } from "vitest/config";

// TODO: customise
export default defineConfig({
  resolve: {
    alias: [
      { find: /^zustand$/, replacement: "./src/index.ts" },
      { find: /^zustand(.*)$/, replacement: "./src/$1.ts" },
    ],
  },
  test: {
    name: "zustand",
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
