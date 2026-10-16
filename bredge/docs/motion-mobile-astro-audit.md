# Bredge mobile, motion and Astro optimisation record
Date: 15 October 2026
Scope: source branch `feat/bredge-motion-mobile-astro-20261015`, stacked above Bredge contact security/release PR #10.

## Root-cause diagnosis and implementation

| Area | Verified defect or risk | Remediation | Proof |
| --- | --- | --- | --- |
| Five Systems arrows | SVG used fixed percentage endpoints in the **whole section**, while cards lived in a separate moving container. Connections drifted across screen widths and never aligned with cards. | Deleted unanchored SVG lines. Exceptions are scoped to the card coordinate system. | Browser checks assert zero connectors at desktop/mobile. |
| Five Systems phone | Five absolute-positioned cards overlapped at 390 and 320 px, obscuring labels and values. | Rebuilt mobile/tablet as natural two-column CSS grid, full-width last card, visible reconciled result and explanation. | 320/390/768 card-bounding-box nonoverlap checks. |
| Five Systems scroll pin | The hero scene had GSAP `pin:true`, creating a dynamic pin-spacer that could conflict with adjacent sticky narratives. | CSS owns one bounded sticky viewport on suitable large screens; GSAP only maps scroll progress. No pin for short, touch, reduced-motion screens. | Desktop test checks position:sticky and zero pin spacer; short-viewport test checks no pin and visible final result. |
| GSAP loading | Shared `useMotion` loaded GSAP for components far below the fold; Decision Tree also loaded motion on small phones. | IntersectionObserver defers GSAP until the scene approaches the viewport. Desktop-only choreography for Decision Tree; fully readable mobile static state. | Real Chromium route/navigation tests; static fallback always exists. |
| SQL demonstration | Scroll-driven source composition could unnecessarily hydrate GSAP on mobile. | Complete model rendered immediately on mobile/reduced/short viewports; GSAP only for desktop scroll narrative. | Reduced-motion/short-viewport test checks final stage and actual visible SQL result. |
| Offscreen animation | Hero video and 404 decorative requestAnimationFrame could continue when offscreen. Pipeline had infinite tween without visibility owner. | Pause/stop media and repeated work offscreen/hidden; clean up listeners, tweens and IntersectionObservers on unmount. | Source/build validation and Chrome browser QA. |
| First-view mobile speed | First-session GSAP preloader was applied on mobile even though it was decorative. | Preloader skipped for tablet/phone, reduced motion and Save-Data. Main hero content remains immediately readable. | Browser-first load behavior and media guard. |
| Mobile touch/viewport | Touch hover could stick; unsafe top/bottom insets; tablet text fields could trigger iOS focus zoom; narrow content padding. | Emil mobile-native rules: capability media queries, `svh/dvh`, 16px mobile inputs, 44px navigation controls, safe-area padding, :active feedback, focus ring and no body-wide unselectable text. | Chrome 320/390/768 regressions and all sitemap routes at those widths. Physical iOS Safari still needs owner device testing. |
| Type confidence | Cloudflare binding declarations and optional D1 starter code were not TypeScript-clean. | Generated Wrangler runtime types; checked them with pinned Wrangler. All TypeScript source now passes alongside npm build/lint/source tests. | `npm run typecheck`, plus protected CI quality job. |
| Agents vs bots | User-Agent labels cannot distinguish good agents from harmful bots and cannot authenticate write access. | Keep public routes readable, add nonstandard public llms.txt and JSON capabilities index, retain same quota/form checks for user-authorised submissions. Document separate signed identity integration as future opt-in. | JSON route availability/field contract check, no public write credentials. |
| Three.js | No `three`, React Three Fiber, or WebGL runtime dependencies exist in the reviewed Bredge source. | No replacement 3D code needed or added. Avoid installing Three.js as decorative overhead. | Package/import audit. |

## Browser and build evidence

- Worker browser QA covers 27 canonical routes, 24 internal destinations, responsive/scroll, 320/390/768 hero/mobile form, 1280 short-screen and 1440 desktop GSAP/sticky behavior, security headers, noindex previews, reduced-motion/SQL and agent manifest. Tests are command-backed and must run against the exact build.
- Full sitemap mobile sweeps covered 26 sitemap paths at 320, 390 and 768 px with **no HTTP errors, no missing H1 and no document-level horizontal overflow**.
- Bredge build, 53 source tests, lint, and Cloudflare runtime typecheck pass when reported alongside their exact run. This document alone is not evidence of production acceptance.
- Original contact Worker delivery controls and protected release requirements are unchanged. Live production SHA currently remains `0e09a43b558714f99ca2738ed96137f84a1ab549`; this design branch must not be merged or released ahead of the independent approval of PR #10.

## Astro decision

Pilot in `../bredge-astro/`: a standalone Astro 7 static **homepage-only renderer**, sharing the same Bredge copy and CSS. Current pilot rendered one 35KB HTML homepage with about 88KB generated CSS, without the Tailwind 4 CSS syntax warning. It rendered at 390 and 1440 px with no page errors or overflow. The pilot retains selected React islands; desktop GSAP is still progressive.

**Do not replace the live site now.** This is not a route-complete or feature-complete Astro migration. A source-and-route parity matrix is required across all 26 sitemap routes plus 404, contact, consent, analytics, Cal.com, redirects, sitemap, metadata, security headers, Cloudflare rate limiting, and Google Sheet/email acknowledgements. Benchmark LCP/INP/CLS and JS transfer on comparable deployed previews before making the switch. A 350ms local Astro build alone is not proof of faster real user experience.

The current Astro static pilot has **no production contact endpoint** and intentionally uses `noindex`; it must never be deployed as a live substitute. Migrating API and on-demand routes may require Astro's Cloudflare adapter and an updated Wrangler compatibility matrix, evaluated independently.

## Release discipline

- No production deployment, merge, DNS change, bypass of independent human review, or Cloudflare secret changes are authorised by this change.
- Closeout stays blocked while the existing live contact-form P0 remains open, and until independent review, live browser lead delivery, permissions, handover, and owner sign-off pass.
- Native-device Safari/iPhone scroll/keyboard/safe-area verification remains pending. Desktop Chrome emulation is supporting evidence, not a substitute.

## 16 October 2026 adversarial review closeout

- Independent read-only Claude review identified and the implementer repaired three specific P1 risks: short/reduced desktop card overlap; capable desktop overlap when JavaScript/GSAP is unavailable; and an empty 360svh SQL runway for no-JS desktop readers.
- The Five Systems section now defaults to a complete responsive **grid for every browser**. Only the explicit `.morph-enhanced` class switches it to GSAP choreography. Browser assertions prove grid/result/decision non-overlap at 1280×680, 1440 reduced motion, and 1440 with JavaScript disabled. The SQL no-JS fallback shows server-rendered excerpts without reserving the animated scroll height. The 1440 animated desktop checks sticky position mid-scroll and the final reveal.
- The contact page's 40/60 QA override had accidentally defeated its mobile media rule despite no page overflow. Mobile-native now restores a full-width single-column layout at ≤900px. A real Chrome 390px capture measured layout = 356px, intro = 356px, form = 356px and next steps = 356px, in reading order. Screenshot reviewed; not merely an overflow-only assertion.
- Latest source evidence: 55 source tests, lint and generated native Cloudflare typecheck passed. Full Chromium browser QA passed 27 canonical routes, 24 links, the new contact width test, desktop/short/reduced/no-JS motion tests, all other critical journeys and hardened headers.
- Fresh Astro build and asset test passed; the homepage is a standalone static rendering experiment. Chrome at 320/390/1440 passed focus restoration, inert background, no horizontal overflow, no JavaScript errors, actual mobile SQL lazy hydration and font responses. Pilot CI installs both locked dependency trees and uses supported Node 24. It neither accepts leads nor publishes to production.
- A broader browser sweep covered 26 sitemap paths at 320/390/768px with zero missing headings or document overflow; a manual screenshot review also exposed and fixed the contact-width issue that those simple measurements missed.
- Desktop screenshots at 50% and 83% Five Systems scroll progress show exception chips beside sources and the reconciled result transitioning in the intended coordinate system, without the previously misplaced SVG arrows.

Still **not** evidence of production acceptance: genuine iPhone/Safari hardware testing, Astro vs Worker real-user Core Web Vitals, multi-route Astro migration, authorised human GitHub review and Cloudflare production/environment release, production positive lead receipt, and owner closeout. The new design branch is stacked on unmerged release/security PR #10.
