import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";
import ignore from "rollup-plugin-ignore"
import analyze from "rollup-plugin-analyzer";

const packageJson = require("./package.json");

const plugins = [
  ignore(["net", "tls", "dns"]),
  replace({
    preventAssignment: true,
    "process.env.NODE_ENV": JSON.stringify("production"),
    __buildDate__: () => JSON.stringify(new Date()),
  }),
  peerDepsExternal(),
  resolve({ preferBuiltins: true }),
  commonjs(),
  json(),
  typescript({ tsconfig: './tsconfig.json' }),
  terser(),
  analyze(),
];

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "umd",
        name: packageJson.name,
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
    inlineDynamicImports: true,
  },
];
