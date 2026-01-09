// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';
import { fileURLToPath } from "url";
import fs from "fs";
import { esbuildPlugin } from "@web/dev-server-esbuild";
import { fromRollup } from "@web/dev-server-rollup";

import nodeResolve from "@rollup/plugin-node-resolve";
import rollupCommonjs from "@rollup/plugin-commonjs";
import rollupTypescript from "@rollup/plugin-typescript";

const resolve = fromRollup(nodeResolve);
const commonjs = fromRollup(rollupCommonjs);
const typescript = fromRollup(rollupTypescript);
/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes("--hmr");

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: "/demo/",
  /** Use regular watch mode if HMR is not enabled. */
  watch: !hmr,
  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ["browser", "development"],
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  // appIndex: 'demo/index.html',

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.lit] }),
    // 定义一个极简的内联插件，拦截 mousetrap 的请求并返回正确代码
    // ...existing code...
    fromRollup(() => ({
      name: "mousetrap-dagre-fix",
      resolveId(source) {
        if (
          source === "mousetrap" ||
          source.startsWith("mousetrap/") ||
          source.endsWith("/mousetrap.js") ||
          source.includes("/mousetrap/")
        ) {
          return "/__mousetrap_bundled__.js";
        }
        if (source === "dagre" || source === "dagre/") {
          return "/__dagre_bundled__.js";
        }
        return null;
      },
      load(id) {
        if (id.endsWith("/__mousetrap_bundled__.js")) {
          const mousetrapPath = fileURLToPath(
            new URL("./node_modules/mousetrap/mousetrap.js", import.meta.url)
          );
          let content = fs.readFileSync(mousetrapPath, "utf-8");
          content += `
            const _default = (typeof window !== 'undefined' ? window.Mousetrap : null) || {}; 
            export default _default;
            export const Mousetrap = _default;
          `;
          return content;
        }
        if (id.endsWith("/__dagre_bundled__.js")) {
          const dagrePath = fileURLToPath(
            new URL("./node_modules/dagre/dist/dagre.js", import.meta.url)
          );
          let content = fs.readFileSync(dagrePath, "utf-8");
          content += `
            const _default = (typeof window !== 'undefined' ? window.dagre : null) || {}; 
            export default _default;
            export const graphlib = _default.graphlib;
            export const layout = _default.layout;
          `;
          return content;
        }
        return null;
      },
    }))(),
    resolve(),
    commonjs(),
    // typescript({
    //   tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
    // }),
    esbuildPlugin({
      target: "es2017",
      ts: true,
      tsConfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
    }),
  ],

  // See documentation for all available options
});
