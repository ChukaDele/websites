# Bredge Research + Interactive Portfolio — source and QA record
Date: 16 October 2026. Status: feature branch stacked on unmerged PR #16. This is not a live production deployment.

## Audience and acceptance
International B2B operators, US firms entering African markets, finance teams, investors, growth executives, and logistics leaders. Each piece should explain what happened, why it affects a decision, which data proves it, what is assumed, and what cannot be concluded. Original Bredge-owned analysis and visualisation are distinguished from third-party sample datasets.

## Information architecture
Desktop navigation: Services; Work (overview, Research, Interactive Portfolio, Insights); How we work; About. Mobile exposes these directly under Work. Footer, sitemap, structured data and the generated agent content index link to the same canonical pages.

## Sourced historical Research
- Nigeria PMS May 2026: NBS petrol average ₦1,596.25/L, Edo ₦1,722.91 and Adamawa ₦1,469.83; state, zone and selected-date comparisons. Decision: route-specific fuel economics for distribution and foreign market entry. Primary source: https://microdata.nigerianstat.gov.ng/index.php/catalog/157/related-materials.
- Nigerian telecoms Q4 2025: NBS/NCC 179.64M active voice, 148.17M internet, and concentration by operator and geography. Decision: distinguish subscriptions from distinct users, addressable customers and distribution-channel access. Porting is not total churn. Primary source: https://microdata.nigerianstat.gov.ng/index.php/catalog/179/related-materials.
- Healthy diet April 2026: NBS/GAIN ₦1,589/day modelled basket, Ekiti ₦2,036, Adamawa ₦1,143; state, zone, food-group and selected urban/rural comparison. Decision: local consumer affordability and food-system investments. This is not actual household expenditure or wages. Draft MoM/YoY percentages that differ from the NBS release have been excluded. Primary source: https://microdata.nigerianstat.gov.ng/index.php/catalog/146/related-materials.

## Interactive demonstrations and provenance
- Finance uses Microsoft's published 2013–2014 Financial Sample, analysed and visualised in the Bredge Financial Performance report. The interactive subset consists of 18 published Canada product/segment sample rows, not the full $118.7M dataset. Reference: https://learn.microsoft.com/en-us/power-bi/create-reports/sample-financial-download.
- Supply Chain uses DataCo SMART SUPPLY CHAIN FOR BIG DATA ANALYSIS, Constante, Silva and Pereira, version 5 (2019), CC BY 4.0; dashboard presentation and analysis by Bredge. Category and region aggregates are historical samples, and the 54.8% global late rate is not a per-region observed rate. Original publisher: https://data.mendeley.com/datasets/8gx2fvg2k6/5.
- SaaS demonstrates three selected plan-level values from the Bredge example dashboard ($207,950 MRR, 832 sample subscriptions). Figures are not from a live company's revenue ledger.

## Architecture and responsible interaction
- Read-only /api/workbench returns one selected public aggregate view; rejects unsupported chart selections and additional export parameters.
- Separate native Cloudflare quota guards 120 requests per minute per edge IP. This reduces casual automated abuse but does not make rendered public data uncopyable.
- React workbenches support data-view switches, clickable/keyboard charts, keyboard/focus tooltips, mobile touch, an evidence inspector, secondary metrics, reset and business scenario sliders. Assumptions reset when a new view has a different valid range.
- Scenario results are not forecasts or real client achievements; money units, million scale, signed sample losses and accessible value labels are explicitly checked.
- Raw PBIX/PBIT, PDF source artefacts, raw transaction records and Google Drive links are NOT published. Public GitHub source is inherently viewable/forkable despite the lack of a download control.

## Repository and release controls
The owner chose PUBLIC GitHub to retain free standard hosted Actions minutes; restored and verified 16 October 2026. Main branch ruleset still requires one distinct approving review and required statuses. Cloudflare environment required reviewers and prevent-self-review returned. Original Deploy Bredge workflow ID 330388801 was re-enabled only after checking those safeguards.

New work is not merged. Existing PRs #10, #15 and #16 each require independent review in order; the feature PR is stacked after them. No direct Cloudflare production deployment, bypass, or self-approved release is permitted. After merged exact-main-SHA CI, a human must approve the protected Cloudflare environment, then perform real browser form → Google Sheet → Gmail, booking, SEO, mobile hardware and monitoring verification.

## QA acceptance
- Source tests, lint, Cloudflare-native TypeScript, Astro pilot and dynamic route build pass.
- Browser QA checks 36 canonical routes, 33 internal destinations, five-arrow scroll story, direct-route preloader, all headings, mobile responsiveness, six live model switches, bar selection, visible tooltip, scenario calculation, reset, proof labels, error states and negative contact submission.
- Device-native Safari, screen reader and real production conversion tests must be separately completed before closeout. The design has been reviewed against mobile-native, break-ui, interface-design and typography rag criteria.
