import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// Incremental static rendering benchmark, deliberately NOT production-bound.
// Full route parity, consent, contact Worker and SEO audits precede any switch.
export default defineConfig({
  site: "https://thebredge.com",
  output: "static",
  integrations: [react()],
  vite: {
    // Shared copy and existing, tested React interaction components live in
    // ../bredge; avoid a second source of truth during the migration experiment.
    server: { fs: { allow: [".."] } },
    resolve: { dedupe: ["react", "react-dom", "gsap"] },
  },
});
