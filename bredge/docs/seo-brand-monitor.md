# The Bredge — Brand / Entity & AI-Search Monitor

Weekly, incognito. Record objective observations — do not chase vanity metrics.

## Queries to check weekly
`The Bredge` · `The Bredge data engineering` · `The Bredge analytics` ·
`The Bredge business intelligence` · `site:thebredge.com`

Per query record: spelling-correction offered? (esp. "did you mean The Bridge") ·
brand result position · homepage indexed? · new title shown? · new snippet shown? ·
LinkedIn result updated? · third-party entity profiles appearing?

| week | date | "did you mean The Bridge"? | homepage indexed | new title/snippet | LinkedIn updated | 3rd-party profiles | notes |
|---|---|---|---|---|---|---|---|
| 0 (launch) | 2026-08-10 | baseline — check | not yet (site live today) | n/a | pending (B) | none yet (G) | GSC verified, sitemap read Success (26), IndexNow 202, entity JSON-LD corrected today |

Primary instrument once data accrues: **GSC → Performance** (queries, impressions,
clicks, CTR, avg position) filtered to brand terms. That is more reliable than manual SERP reading.

## O — AI-search discoverability
- OAI-SearchBot confirmed **200, no Cloudflare challenge** on launch day (also ChatGPT-User/Googlebot/Bingbot). Re-test key pages weekly with those UAs.
- Track ChatGPT/Perplexity referrals via existing `trafficGroup()` logic once GA4 is live (see [seo measurement]).
- Do **not** add unsupported "AI-only" meta tags. AI discoverability = crawlable answers + entity consistency (done today) + credible external mentions (G/I/J) + original resources (K) + structured data (done) + technical depth.

## Method notes
- Manual SERP scraping is unreliable and against tooling ToS — prefer GSC Performance + a manual incognito eyeball once/week, not automated scraping.
- The entity-correction signal ("The Bridge" → "The Bredge") is expected to improve as: (a) corrected JSON-LD is recrawled, (b) LinkedIn is reset (B), (c) consistent-name third-party profiles appear (G).
