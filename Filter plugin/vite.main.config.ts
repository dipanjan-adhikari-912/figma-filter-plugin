import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * Inlined UI from Vite is minified JS with backticks and `${...}`. Rollup turns a huge
 * string into a template literal, which breaks on inner `` ` `` / `${` and corrupts `main.js`.
 * Ship UI as base64 chunks (ASCII + string concatenation) and decode in `main.ts`.
 */
function base64ConcatExpressionForPluginPayload(utf8Html: string, chunkSize = 8192): string {
  const b64 = Buffer.from(utf8Html, "utf8").toString("base64");
  const parts: string[] = [];
  for (let i = 0; i < b64.length; i += chunkSize) {
    parts.push(JSON.stringify(b64.slice(i, i + chunkSize)));
  }
  return parts.length === 1 ? parts[0]! : parts.join(" + ");
}

function inlineUiHtmlPlugin(): Plugin {
  return {
    name: "inline-ui-html",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("src/main.ts")) {
        return null;
      }

      const uiHtmlPath = resolve(process.cwd(), "dist/index.html");
      const uiHtml = readFileSync(uiHtmlPath, "utf8");
      const expr = base64ConcatExpressionForPluginPayload(uiHtml);
      return code.replace(/\b__html__\b/g, `decodePluginUiHtml(${expr})`);
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
    // Figma parses main code as legacy JS — no optional chaining / nullish coalescing / object spread as syntax.
    target: "es2017",
    minify: false,
    rollupOptions: {
      output: {
        extend: true
      }
    }
  }
});
