const path = require("path");
const alias = require("@rollup/plugin-alias");
const resolve = require("@rollup/plugin-node-resolve");
const replace = require("@rollup/plugin-replace");
const typescript = require("@rollup/plugin-typescript");
const { default: esbuild } = require("rollup-plugin-esbuild");

const extensions = [".js", ".ts", ".tsx"];
const { root } = path.parse(process.cwd());
const entries = [{ find: /.*\/vanilla\.ts$/, replacement: "zk-state/vanilla" }];

function external(id) {
  return !id.startsWith(".") && !id.startsWith(root);
}

function getEsbuild(target, env = "development") {
  return esbuild({
    minify: env === "production",
    target,
    tsconfig: path.resolve("./tsconfig.json"),
  });
}

function createDeclarationConfig(input, output) {
  return {
    input,
    output: {
      dir: output,
    },
    external,
    plugins: [
      typescript({
        declaration: true,
        emitDeclarationOnly: true,
        outDir: output,
      }),
    ],
  };
}

function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: "esm" },
    external,
    plugins: [
      alias({ entries: entries.filter((e) => !e.find.test(input)) }),
      resolve({ extensions }),
      replace({
        ...(output.endsWith(".js")
          ? {
              "import.meta.env?.MODE": "process.env.NODE_ENV",
            }
          : {
              "import.meta.env?.MODE":
                "(import.meta.env ? import.meta.env.MODE : undefined)",
            }),
        // a workround for #829
        "use-sync-external-store/shim/with-selector":
          "use-sync-external-store/shim/with-selector.js",
        delimiters: ["\\b", "\\b(?!(\\.|/))"],
        preventAssignment: true,
      }),
      getEsbuild("node12"),
    ],
  };
}

module.exports = function () {
  return [
    createDeclarationConfig("src/index.ts", "dist"),
    createESMConfig("src/index.ts", "dist/esm/index.js"),
    createESMConfig("src/index.ts", "dist/esm/index.mjs"),
  ];
};

module.exports.entries = [];
