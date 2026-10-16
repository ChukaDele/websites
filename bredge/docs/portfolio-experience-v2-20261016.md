# Bredge: website-wide hierarchy and interactive portfolio experience

## Scope
This change builds on PR #19's evidence-backed Research and Interactive Portfolio, keeping the source and scenario maths intact. No production release is part of this work.

- Six decision-specific dashboard treatments (finance, supply chain, SaaS, fuel, telecom, diet), with preserved views, source limitations, keyboard data selection, accessible tooltips, what-if recalculation and optional deeper comparison.
- Desktop decision scenes fit the available viewport at 1440 x 900; short, zoomed, mobile and reduced-motion layouts use accessible natural flow instead of clipping or scroll traps.
- Three portfolio illustrations and three research illustrations are original subject-specific editorial assets. They are visual metaphors, not charts or claimed real outcomes. The financial teaser now refers to the $14.26M displayed sample rather than the original report's $118.7M whole dataset.
- Clearer website-wide whitespace, page hierarchy, content density, CTA treatment and contact form; a desktop single-scene footer, with natural flow on smaller screens.
- Local organisation icons accompany previous team experience only. The existing text explicitly distinguishes past employment from Bredge clients or endorsement. Source publisher identities are not represented as client results.

## Acceptance already checked locally
- Production build and Cloudflare types: PASS.
- Lint: zero errors; generated Cloudflare typings have two nonfatal warnings.
- Source and regression unit tests: 83/83.
- Complete browser suite: PASS across 36 canonical routes, 33 internal links, six workbench flows and protected negative contact tests.
- Six interactive scenes fit a 900px desktop viewport and preserve available drill-down and source evidence; the footer content fits.
- The contact form preselects Analytics/BI when visitors arrive through Research/Portfolio.

## Nonproduction release gates
- Preserve public GitHub repository and original independent review and protected Cloudflare production deployment controls.
- Compare exact preview SHA with source commit. Do not merge stacked PRs out of order.
- Keep historical samples distinct from observed live commercial results.
- Physical Safari/iOS, native browser-zoom tests, and live production lead-delivery checks remain separate acceptance gates; local browser dimensions are not an equivalent replacement.
