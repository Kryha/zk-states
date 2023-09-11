import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const extensions = [".js", ".jsx", ".ts", ".tsx"];
const globals = {
  react: "React",
  "react-dom": "ReactDOM",
  o1js: "SnarkyJS",
};

export default {
  input: ["./src/index.ts"],
  output: [
    {
      dir: "./dist",
      format: "esm",
      globals,
    },
  ],
  plugins: [
    peerDepsExternal(),
    nodeResolve({ extensions, browser: true }),
    commonjs(),
    typescript(),
  ],
  onwarn: (warning, handler) => {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    handler(warning);
  },
};
