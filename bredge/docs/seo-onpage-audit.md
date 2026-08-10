# On-page SEO & accessibility / retrievability audit — The Bredge

Scope: additive, non-visual accessibility / SEO / AI-retrievability review of a **frozen production design**.
Allowed edits only: additive ARIA/`alt`/accessible-name attributes, missing JSON-LD, missing non-visual meta. No CSS / className / layout / copy / animation changes. Anything that would alter layout or visible design is recorded as **owner-review**, not applied.

- Date: 2026-08-10
- Repo: `~/Projects/websites/bredge`
- Files edited this pass: **1** (`components/interactions/PhoneField.tsx`)
- Applied fixes: **1** · Owner-review items: **6** · Verified-already-correct: **many** (see tables)
- `sr-only` / visually-hidden utility class: **none exists** in `globals.css` / `pages.css` (grepped). Therefore no hidden crawlable sentences were added anywhere; where a conclusion could only live in a non-text medium it is recorded as owner-review. In practice no such gap was found — every key conclusion already exists in visible HTML text (see §6).

Overall: the site is already strongly instrumented for on-page SEO and accessibility. Metadata, canonical, OG/Twitter, and JSON-LD are present and correct on every indexable page; all technical diagrams are already labelled with descriptive sentences and captioned; decorative motion/video/SVG is already `aria-hidden`. Only one genuine additive a11y gap was found and fixed.

---

## §4 — On-page metadata / schema (per indexable page)

Legend: ✓ present & correct · n/a not applicable.

| URL | title | description | H1 | canonical | OG | Twitter | schema | severity | fix | verified |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` (`app/layout.tsx` + `app/page.tsx`) | ✓ | ✓ | ✓ single | ✓ | ✓ (og.png, alt) | ✓ summary_large_image | Organization + WebSite (@graph) in layout | — | none needed | ✓ |
| `/services` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Service JSON-LD | — | none needed | ✓ |
| `/services/embedded-data-team` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Service JSON-LD | — | none needed | ✓ |
| `/services/data-projects` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Service JSON-LD | — | none needed | ✓ |
| `/data-diagnostic` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Service JSON-LD | — | none needed | ✓ |
| `/insights` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | (index; Org/WebSite from layout) | — | none needed | ✓ |
| `/insights/*` (all 10 articles via `Article.tsx`) | ✓ | ✓ | ✓ | ✓ (mainEntityOfPage) | ✓ | ✓ | Article + BreadcrumbList JSON-LD | — | none needed | ✓ |
| `/resources` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | (index) | — | none needed | ✓ |
| `/resources/*` (all 6 via `ResourcePage.tsx`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | BreadcrumbList JSON-LD | — | none needed | ✓ |
| `/not-found` (404) | inherits layout | inherits | ✓ | n/a (404) | inherits | inherits | none (correct for 404) | — | none needed | ✓ |

Notes:
- Metadata is produced by `lib/seo.ts::pageMetadata` (title/description/canonical/OG/Twitter) and per-type JSON-LD by `serviceJsonLd` / inline `Article` + `BreadcrumbList` graphs. Home adds `Organization` + `WebSite` `@graph` in `app/layout.tsx`.
- Preview host `*.workers.dev` is correctly `noindex,nofollow`; production `thebredge.com` is `index,follow` (`app/layout.tsx::generateMetadata`).
- No missing Service/Article/BreadcrumbList schema found — nothing to add. Each indexable page has exactly one H1.
- **Owner-review (P2, copy/design, not applied):** `/insights` index (`app/insights/page.tsx`) and `/resources` index have no `CollectionPage`/`ItemList`/`Blog` schema. Optional enrichment only; would not change any P0/P1 outcome. Recording for owner decision.

---

## §5 — Visual & interactive element inventory (classification + a11y)

Legend for classification: **DEC** decorative · **INFO** informational · **INT** interactive.

| URL / component | element | class | issue | sev | fix / status | verified |
|---|---|---|---|---|---|---|
| Home `components/site/HeroVideo.tsx` | background `<video>` (muted/loop, poster) in `.hero-media` | DEC | wrapper already `aria-hidden="true"`; decorative motion plate, meaning is in adjacent copy | — | correct as-is | ✓ |
| Home `components/landing/HeroMorph.tsx` | "Five systems" morph section | DEC (viz) + INFO (text) | section `aria-label` present; connector `<svg>`, `.morph-cards`, `.morph-exceptions` are `aria-hidden`; `.morph-result` / `.morph-decision` text NOT hidden (crawlable) | — | correct as-is | ✓ |
| Home `components/landing/Visuals.tsx` `PipelineDemo` | `<div className="pipeline-demo" aria-label="…">` | DEC (reference build) | `aria-label` sits on a **role-less `<div>`** → ignored by most AT (no-op). Inner synthetic numbers are read verbatim instead. Adding `role="img"` would change AT exposure of a decorative demo. | P2 | **owner-review** (decide DEC→add `role="img"`, or INFO→keep) | n/a |
| Home `components/landing/Visuals.tsx` `ReferenceDashboards` (Work 01/02/03) | dashboard tiles + `<h3>`/`<p>` case copy | DEC (tiles) + INFO (copy) | case headings/paragraphs are crawlable HTML text; "REFERENCE BUILD · SYNTHETIC DATA" badge present | — | correct as-is | ✓ |
| Home `components/landing/InvisibleQuery.tsx` | "Invisible 90%" SQL scene | DEC (viz) + INFO (text) | section `aria-label`; `.iq-code`/`.iq-cursor`/`.iq-result` are `aria-hidden`; side copy + `STAGES` list + mobile excerpts (incl. "6 / 6 checks passed") render as real HTML text | — | correct as-is | ✓ |
| Home `components/site/ExperienceRows.tsx` | scroll-linked name rows | DEC (motion) + INFO (text) | section `aria-label`; names + disclaimer are plain text marks (not logos), fully crawlable | — | correct as-is | ✓ |
| Home `app/page.tsx` `OutcomeArt`, `Arrow` `↗` | decorative glyph/particles | DEC | already `aria-hidden="true"` | — | correct as-is | ✓ |
| Insights index `app/insights/page.tsx` | featured reconciliation `<svg>` | INFO | `role="img"` + descriptive `aria-label` ("Three conflicting revenue figures … reconciled … into one canonical revenue figure.") | — | correct as-is (task: "verify") | ✓ |
| Insights articles (all 10) `Article.tsx::Diagram` | hero `<svg>` diagram | INFO | wrapped in `<div className="ax-figure-frame" role="img" aria-label={title}>` + visible `<figcaption>` describing inputs→transformation→conclusion | — | correct as-is | ✓ |
| `app/insights/before-you-build-a-data-warehouse` & `app/insights/one-customer-view` | inner `<svg role="img">` (no own `aria-label`) | INFO | inner `role="img"` is redundant: it sits inside the parent `role="img"` frame (leaf role → descendants pruned), so harmless. Not a defect in practice. | P2 | **owner-review** (optional: drop redundant inner `role="img"`) | ✓ (harmless) |
| Services `components/site/MicroIllustration.tsx` | capability micro-SVGs | DEC (as shipped) | element has **both** `role="img"` and `aria-hidden="true"` → `aria-hidden` wins, so decorative; `role="img"` is dead. Each illustration sits beside full text (`<h3>`+body+tags+outcome), so hiding is a safe conservative choice. | P2 | **owner-review** (decide: keep decorative & drop dead `role`, or make INFO with a descriptive label) | ✓ (functional) |
| Data Diagnostic `components/interactions/DiagnosticScan.tsx` | scan-map animation | DEC | `.scan-map` already `aria-hidden`; conclusion is in visible `<h2>`/`<p>` | — | correct as-is | ✓ |
| Services `components/interactions/DecisionTree.tsx` | auto-cycling tree | DEC | `.dtree-fill` `aria-hidden`; no interactive controls; supporting copy is text | — | correct as-is | ✓ |
| How-we-work `components/interactions/TraceDecision.tsx` | `<button>` rows | INT | each button has visible text (`<span>`+`<b>`) → accessible name present | — | correct as-is | ✓ |
| 404 `components/interactions/NotFoundField.tsx` | match `<button>` + matrix | INT + DEC | button `aria-label="Attempt to match the unmatched record"`; `.nf-matrix`/`.nf-meta` `aria-hidden` | — | correct as-is | ✓ |
| Contact `components/interactions/ContactForm.tsx` | text/email/company/message inputs | INT | all have `<label htmlFor>`; checkboxes wrapped in `<label>`; chip buttons have text + `aria-pressed`; honeypot `aria-hidden` | — | correct as-is | ✓ |
| Contact `components/interactions/PhoneField.tsx` | country-search `<input className="phone-search">` | INT | **only a `placeholder`, no accessible name** (placeholder is not a reliable AT name) | P1 | **FIX APPLIED** — added `aria-label="Search country or code"` (additive; placeholder unchanged; no visual change) | ✓ |
| Contact `components/interactions/PhoneField.tsx` | `.phone-menu` `role="listbox"` containing `<button>` options | INT | options are `<button>`, not `role="option"`; incomplete listbox pattern. Changing roles affects keyboard semantics → not a safe additive change on a frozen design. | P2 | **owner-review** | n/a |
| Insights index `components/insights/AllInsights.tsx` | `role="tablist"` / `role="tab"` filter | INT | tabs have visible text + `aria-selected` and are operable; but no `role="tabpanel"` / `aria-controls` (incomplete ARIA tabs). Completing it is a semantics/behavior change. All rows render server-side (crawlable) regardless. | P2 | **owner-review** | ✓ (operable) |
| Site chrome `SiteHeader.tsx` / `SiteFooter.tsx` / `Preloader.tsx` | logo `<img>` ×2, preloader mark | INFO / DEC | header & footer logos `alt="The Bredge"`; preloader `alt="" aria-hidden="true"` (decorative); footer `.footer-grid` `aria-hidden` | — | correct as-is | ✓ |
| Header `SiteHeader.tsx` | brand link, nav, menu toggle, dropdown | INT | brand `aria-label="The Bredge home"`; nav `aria-label`; toggle `aria-label`+`aria-expanded`; no icon-only unnamed controls | — | correct as-is | ✓ |

All `<img>` (3 total: 2 logos, 1 preloader mark) have correct `alt`. No missing or empty-where-needed `alt` found. No icon-only links without an accessible name (footer/header links are all text).

---

## §6 — AI / answer-engine retrievability (from HTML TEXT, not motion/SVG/video)

Question set: what Bredge does · who for · the problem · the mechanism · when DIY suffices · when it's systemic · the next action. All confirmed extractable from visible HTML text; the animated/SVG/video elements only restate text that already exists elsewhere.

| Page | does / who-for | problem | mechanism | DIY-suffices | systemic | next action | gap? |
|---|---|---|---|---|---|---|---|
| `/` Home | ✓ hero summary + "growing & mid-market" | ✓ problem cards 01–04 | ✓ capability list + principles + Invisible-90% copy | ✓ (implied via diagnostic framing) | ✓ engagement cards (embedded vs project) | ✓ Schedule / Diagnostic CTAs | none |
| `/services` | ✓ hero + lede | ✓ "problems rarely fit one discipline" | ✓ 5 capability rows (each with Outcome) | — | ✓ "ongoing vs defined scope" bridge cards | ✓ Schedule / Diagnostic CTAs | none |
| `/data-diagnostic` | ✓ hero | ✓ "you may need a diagnostic if…" triggers | ✓ "what we review" 7-point list | — | ✓ deliverables → roadmap | ✓ Start-a-diagnostic CTA | none |
| `/insights/*` (articles) | ✓ standfirst | ✓ "short answer" / "what this looks like" | ✓ "what's happening underneath" + code | ✓ **"Try this first"** aside (DIY steps) | ✓ **"This has become a system problem when…"** boundary aside | ✓ service note + related links | none |
| `/insights`, `/resources` (indexes) | ✓ lede | ✓ list standfirsts/blurbs | ✓ links to full pieces | ✓ ungated checklists | — | ✓ open article / print checklist | none |
| `/resources/*` | ✓ intro | ✓ implicit | ✓ numbered steps | ✓ (that's the whole page) | ✓ "why this works, in depth" link | ✓ print / open article | none |
| `/` 404 | ✓ recovery copy | — | — | — | — | ✓ home + schedule links | none |

No key conclusion lives *only* in animation/SVG/canvas/video:
- Home morph → conclusion also in `.morph-result` / `.morph-decision` text + tease `<h2>`.
- Invisible-90% SQL → conclusion also in side copy, `STAGES` list, and mobile excerpts ("6 / 6 checks passed") which are in the DOM at all breakpoints.
- Article hero diagrams → each has a visible `<figcaption>` stating the inputs→transformation→conclusion, plus the full article prose.
- Reference dashboards → each case has an `<h3>`+`<p>` describing it in text.

Because every conclusion is already in visible text, **no hidden/`sr-only` crawlable sentence was needed or added** (which is also the only correct outcome given no `sr-only` utility exists).

---

## Applied vs owner-review

**Applied (1):**
1. `components/interactions/PhoneField.tsx` — added `aria-label="Search country or code"` to the country-search `<input>` (interactive control had only a placeholder). Additive attribute; placeholder and visuals unchanged. (P1)

**Owner-review (6, none applied — each would alter AT/keyboard semantics, add non-essential schema, or require a design/copy call):**
1. `components/landing/Visuals.tsx` `PipelineDemo` — `aria-label` on a role-less `<div>` is a no-op; decide DEC (add `role="img"`) vs INFO. (P2)
2. `components/site/MicroIllustration.tsx` — dual `role="img"` + `aria-hidden="true"`; decide keep-decorative (drop dead `role`) vs make informational with a descriptive label. (P2)
3. `app/insights/before-you-build-a-data-warehouse` & `one-customer-view` — redundant inner `<svg role="img">` inside the labelled `role="img"` frame; optional cleanup, harmless today. (P2)
4. `components/interactions/PhoneField.tsx` — `role="listbox"` with `<button>` (not `role="option"`) children; completing the pattern changes keyboard semantics. (P2)
5. `components/insights/AllInsights.tsx` — `role="tablist"`/`role="tab"` without `tabpanel`/`aria-controls`; operable and crawlable as-is. (P2)
6. `/insights` & `/resources` index pages — optional `CollectionPage`/`ItemList`/`Blog` JSON-LD enrichment. (P2)

---

## Files edited this pass

| File | one-line diff summary |
|---|---|
| `components/interactions/PhoneField.tsx` | Added `aria-label="Search country or code"` to the `.phone-search` input (accessible name for a placeholder-only control). |
