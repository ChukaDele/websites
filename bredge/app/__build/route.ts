import info from "./build-info.json";

// Build fingerprint — the source of truth for staging↔production parity.
// no-store so it is never cached; noindex so it never enters search.
export function GET() {
  return new Response(JSON.stringify(info), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
