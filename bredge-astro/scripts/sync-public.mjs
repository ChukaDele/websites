import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const origin = resolve("../bredge/public");
const dest = resolve("public");
await mkdir(dest, { recursive: true });
// Mirror only the site's approved public assets. Secrets are never in public.
for (const item of await readdir(origin, { withFileTypes: true })) {
  if (item.name.startsWith(".") && item.name !== ".well-known") continue;
  await cp(resolve(origin, item.name), resolve(dest, item.name), { recursive: true, force: true });
}
console.log("Astro assets sourced from ../bredge/public");

// Vite/Astro should not ingest Tailwind v4's global @theme/@tailwind syntax
// from vinext without the Tailwind plugin. The Bredge marketing components
// use its explicit CSS classes, not Tailwind utility classes. Preserve the
// authored declarations verbatim and strip only the Tailwind import.
const styles = resolve("src/styles");
await mkdir(styles,{recursive:true});
const original = await readFile(resolve("../bredge/app/globals.css"),"utf8");
const generated = original.replace(/^@import "tailwindcss";\s*/,"");
if(generated === original) throw Error("Expected the production Tailwind import");
await writeFile(resolve(styles,"bridge-globals.css"),generated);
