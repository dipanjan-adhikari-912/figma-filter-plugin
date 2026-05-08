import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

function inlineUiHtmlPlugin(): Plugin {
  return {
    name: "inline-ui-html",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("src/main.ts")) {
        return null;
      }

      const uiHtmlPath = resolve(process.cwd(), "dist/ui.html");
      const uiHtml = readFileSync(uiHtmlPath, "utf8");
      return code.replace(/\b__html__\b/g, JSON.stringify(uiHtml));
    }
  };
}

export default defineConfig({
  plugins: [inlineUiHtmlPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(process.cwd(), "src/main.ts"),
      formats: ["iife"],
      fileName: () => "main.js",
      name: "FigmaPluginMain"
    },
    target: "es2020",
    minify: false,
    rollupOptions: {
      output: {
        extend: true
      }
    }
  }
});
