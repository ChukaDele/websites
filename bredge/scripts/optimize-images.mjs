// Generates modern-format siblings for the raster images in public/ (originals are
// kept untouched as the <picture> fallback). Re-run after adding or replacing an
// image: `node scripts/optimize-images.mjs`. Outputs are deterministic, so
// re-running without source changes rewrites identical files.
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";

const root = new URL("../public/", import.meta.url).pathname;
// Photos: full-size + a 640px-wide variant for phones / small cards.
const PHOTO_DIRS = ["how", "research", "insights"];
const WIDTHS = [640];

async function photo(file) {
  const { dir, name } = parse(file);
  const img = sharp(file);
  const { width } = await img.metadata();
  const sizes = [...WIDTHS.filter((w) => w < width), width];
  for (const w of sizes) {
    const suffix = w === width ? "" : `-${w}`;
    const base = join(dir, `${name}${suffix}`);
    const r = sharp(file).resize({ width: w, withoutEnlargement: true });
    await r.clone().avif({ quality: 50, effort: 6 }).toFile(`${base}.avif`);
    await r.clone().webp({ quality: 74, effort: 6 }).toFile(`${base}.webp`);
    if (suffix) await r.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${base}.jpg`);
  }
}

async function graphic(file, width) {
  const { dir, name } = parse(file);
  // Logos with sharp edges and alpha: near-lossless WebP keeps them crisp.
  await sharp(file).resize({ width, withoutEnlargement: true }).webp({ nearLossless: true, quality: 80, effort: 6 }).toFile(join(dir, `${name}.webp`));
}

for (const d of PHOTO_DIRS) {
  for (const f of await readdir(join(root, d))) {
    if (/\.(jpe?g|png)$/i.test(f) && !/-\d+\.(jpe?g|png)$/.test(f)) await photo(join(root, d, f));
  }
}
await graphic(join(root, "brand/bredge-logo-preloader.png"));
await graphic(join(root, "logos/pennfoster.png"));

for (const d of [...PHOTO_DIRS, "brand", "logos", "logos/tools"]) {
  for (const f of (await readdir(join(root, d))).sort()) {
    if (/\.(jpe?g|png|webp|avif)$/.test(f)) console.log(`${d}/${f}`.padEnd(46), ((await stat(join(root, d, f))).size / 1024).toFixed(1), "KB");
  }
}
