# Bredge distribution diagrams

Editorial, technical SVGs for social and article use. Each is a self-contained,
1080×1080 square with the styles embedded inline — no external fonts, images or
scripts. They follow the Bredge visual language: paper `#f4f1e9`, ink `#142321`,
brand green `#3c6b43`/`#90d26f`, amber-for-conflict `#f0bf6c`/`#a9741f`; sans
headlines with `IBM Plex Mono` labels; rectangular "record" boxes, thin strokes,
a `MATCH ON` transformation band and a before(amber/conflict) → after(green/canonical)
frame. No gradients, no soft drop shadows — depth is a hard, zero-blur offset block,
drawn as a shape.

## The eight diagrams

| File | Concept (one line) | Source article |
|---|---|---|
| `finance-vs-sales-mismatch.svg` | Three conflicting revenue figures (CRM £4.5m / Finance £4.3m / Board £4.2m) reconciled through `MATCH ON time · grain · identity · definition` into one canonical £4.28m. | [Why dashboards disagree](https://thebredge.com/insights/why-dashboards-disagree) |
| `one-customer-view.svg` | The same customer, fragmented across CRM / billing / support, resolved to one canonical `CUST-00317` by matching on name, email domain and company number. | [The one-customer view](https://thebredge.com/insights/one-customer-view) |
| `data-warehouse-decision.svg` | Weigh six signals (sources, refresh cadence, consumers, governed definition, owner, what breaks today); branch to "not yet" or "build it". | [Before you build a data warehouse](https://thebredge.com/insights/before-you-build-a-data-warehouse) |
| `first-data-hire.svg` | Backlog signals feed one question — what is actually blocked? — mapped to analyst / analytics engineer / data engineer / embedded team; continuous vs project. | [When to hire a data team](https://thebredge.com/insights/when-to-hire-a-data-team) |
| `power-bi-performance.svg` | Four slow-dashboard symptoms mapped to likely cause and first move: DAX, cardinality, star schema, incremental refresh. | [Why Power BI is slow](https://thebredge.com/insights/power-bi-slow) |
| `data-reliability.svg` | The reliability check stack — completeness, uniqueness, validity, referential integrity, freshness, reconciliation — with a named owner, gating a "trusted" badge. | [Is our data reliable?](https://thebredge.com/insights/is-our-data-reliable) |
| `monthly-reporting-automation.svg` | A manual monthly spreadsheet loop (export → clean → paste → format → email) replaced by an extract/transform/load pipeline on a schedule. | [Automate monthly reporting](https://thebredge.com/insights/automate-monthly-reporting) |
| `data-diagnostic.svg` | Map the current environment and its findings, score each by impact × effort, return a prioritised roadmap of what to fix first. | [What to fix first](https://thebredge.com/insights/what-to-fix-first) |

## Recommended export sizes

The source of truth is the SVG — export raster copies from it as needed.

- **Square (default): 1080×1080** — Instagram/LinkedIn feed, general social. Export at
  1× (1080) or 2× (2160) PNG for crisp text.
- **Open Graph / link preview: 1200×630** — the square does not fit this ratio directly.
  Either (a) scale the square to 630×630 and centre it on a 1200×630 paper `#f4f1e9`
  (or ink `#142321`, for `data-reliability.svg`) background, or (b) re-render with a
  1200×630 viewBox crop of the central content band. Keep the footer visible.
- **Twitter/X in-stream: 1600×900** — same letterbox approach as OG.

### Exporting to PNG

Any SVG renderer works. Examples:

```bash
# rsvg-convert (librsvg)
rsvg-convert -w 2160 -h 2160 finance-vs-sales-mismatch.svg -o finance-vs-sales-mismatch@2x.png

# macOS QuickLook (no install)
qlmanage -t -s 2160 -o . finance-vs-sales-mismatch.svg

# Chromium headless
chrome --headless --screenshot --window-size=1080,1080 finance-vs-sales-mismatch.svg
```

### Fonts

The SVGs reference `Instrument Sans` (headlines) and `IBM Plex Mono` (labels/values),
matching the site, with system fallbacks (`system-ui`, `ui-monospace`). If you need the
brand fonts to render exactly in an offline export, install both locally before
rasterising; otherwise the fallbacks keep the layout intact.
