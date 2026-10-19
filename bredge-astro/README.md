# Bredge Astro static rendering pilot

This is an **isolated implementation pilot**, not a substitute production Worker or a completed migration. It shares the approved homepage copy from `../bredge/lib/marketing-content.ts` and reuses existing React motion components as selectively hydrated Astro islands. Other Next/vinext public routes remain in their original architecture. No contact endpoint is recreated here, and **the pilot must not receive public lead traffic**.

## Run
```
npm ci --prefix bredge
cd bredge-astro
npm ci
npm run build
npm test
npm run preview
```

## Decision gate
Compare static HTML, transferred JS, LCP/CLS, mobile performance and route/content/SEO parity against the same source revision of the existing Worker. Port remaining 26 routes only if the measured benefit justifies a second rendering stack. Before any cutover, port the Google webhook and Cloudflare rate-limiter security boundary, consent and analytics, dynamic sitemap and legal pages; obtain independent review and the normal protected release approval. Do not serve the incomplete static pilot as the live site.

## Isolated CI
.github/workflows/bredge-astro-pilot.yml builds and tests the pilot on pull requests without touching Cloudflare credentials or production. Its static artifact is evidence only and must not be used by the existing protected Bredge deployment job.


The Astro prototype compiles shared React components from `../bredge` and
intentionally requires that project's locked dependencies as well. The isolated
CI job installs both. The renderer deduplicates React and GSAP and keeps the
pilot's static output separate from the Cloudflare Worker deployment contract.
