import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import ts from "typescript";

const root = fileURLToPath(new URL("../../", import.meta.url));
const framework = new URL("./framework.mjs", import.meta.url).href;
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "next/link") return next("next/link.js", context);
    if (specifier === "server-only") return { url: "data:text/javascript,export{}", shortCircuit: true };
    if (["next/headers", "next/navigation", "next/cache", "next/server"].includes(specifier)) return { url: framework, shortCircuit: true };
    if (specifier.startsWith("@/")) {
      const base = resolve(root, specifier.slice(2));
      const path = [base, `${base}.ts`, `${base}.tsx`].find((path) => existsSync(path));
      if (!path) throw new Error(`Unresolved test import: ${specifier}`);
      return { url: pathToFileURL(path).href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (/\.tsx?$/.test(url)) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX }, fileName: fileURLToPath(url),
      }).outputText;
      return { format: "module", source, shortCircuit: true };
    }
    return next(url, context);
  },
});
