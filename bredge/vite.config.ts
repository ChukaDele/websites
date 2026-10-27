import vinext from "vinext";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// Optional persistent ISR cache (Workers KV). Pages already render once per
// Worker isolate and are reused from memory (export const revalidate in
// app/layout.tsx); a KV namespace shares that cache across isolates and
// locations. It is OFF until the owner creates a namespace and exposes its id at
// build time, e.g. `VINEXT_KV_CACHE_ID=<id> npm run build`, after:
//   npx wrangler kv namespace create VINEXT_KV_CACHE
// Without it, nothing changes for dev or deploy.
const KV_CACHE_ID = process.env.VINEXT_KV_CACHE_ID; // PLACEHOLDER: set to the KV namespace id
// Each build gets its own key prefix, so a deploy never serves pages cached by
// the previous build (they reference hashed assets that no longer exist).
const KV_CACHE_PREFIX = `bredge-${process.env.GITHUB_SHA?.slice(0, 12) || Date.now().toString(36)}`;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  // Native per-location rate limiting; stage and production use host-scoped
  // counters. No browser CAPTCHA or client-supplied timing is trusted as a quota.
  ratelimits: [
    {
      name: "CONTACT_RATE_LIMITER",
      namespace_id: "41986273",
      simple: { limit: 10, period: 60 as const },
    },
  ],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  kv_namespaces: KV_CACHE_ID ? [{ binding: "VINEXT_KV_CACHE", id: KV_CACHE_ID }] : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(KV_CACHE_ID ? { cache: { data: kvDataAdapter({ appPrefix: KV_CACHE_PREFIX, ttlSeconds: 7 * 24 * 3600 }) } } : {}),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
