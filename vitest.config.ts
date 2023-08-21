import { resolve } from "path";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    {
      name: "isolation",
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          next();
        });
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: /^zk-states$/,
        replacement: resolve(__dirname, "src/index.ts"),
      },
      { find: /^zk-states(.*)$/, replacement: resolve(__dirname, "src/$1.ts") },
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
    setupFiles: ["./setupVitest.js", "@vitest/web-worker"],
    server: {
      deps: {
        inline: ["vitest-canvas-mock"],
      },
    },
    // For this config, check https://github.com/vitest-dev/vitest/issues/740
    threads: false,
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
    testTimeout: 600000, // 10 minutes (some operations are pretty slow, so keep it high)
  },
});
