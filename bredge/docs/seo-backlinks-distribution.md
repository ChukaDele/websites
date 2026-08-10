# The Bredge — Backlinks & Distribution Tracker

**Canonical name everywhere: `The Bredge`** (never "Bredge Data", "Bredge
Analytics", "The Bridge"). Canonical description = the one in
[seo-keyword-map.md] / Organization JSON-LD.

**A submitted directory is NOT an earned backlink.** Only a *verified live page*
counts. `sameAs` in Organization JSON-LD is added ONLY after a profile is live.

## White-hat hard rules (do / never)
Never: buy dofollow links · PBNs · automated mass directories · comment/forum spam ·
hidden links/text · doorway pages · hundreds of thin AI pages · reciprocal-link swaps
at scale · fake awards/stats/reviews · review-gating by sentiment. Sponsored links must
be qualified (`rel="sponsored"`/`nofollow`) where required.

## Column schema (mirror into the operating Google Sheet)
`priority | domain | type | target audience | submission URL | status | owner | submitted date | live URL | follow/nofollow/unknown | referral visits | leads | notes`

status ∈ {planned, submitted, in-review, live, rejected}. Count a row as a backlink
only when `status=live` AND `live URL` is set.

## G — Directory / entity distribution (owner-gated: account creation)
> I cannot create third-party accounts. Owner claims/creates; then I add live URLs to `sameAs`.

| priority | platform | type | status | notes |
|---|---|---|---|---|
| 1 | Crunchbase | entity/company | planned | exact name + canonical desc; org profile |
| 2 | GoodFirms | B2B directory | planned | free listing; category: Data Analytics / BI |
| 3 | TechBehemoths | B2B directory | planned | free listing |
| 4 | Clutch | B2B directory | planned | verify current free-tier terms |
| 5 | The Manifest (via Clutch) | directory | planned | flows from Clutch |
| 6 | DesignRush | directory | planned | **verify listing terms before submitting** |

## H — Reviews (owner-gated: outreach to real clients only)
Ask only genuine eligible clients. Never self-write, pay-for, fabricate, or sentiment-gate.
Track: platform · client (private) · invited date · published? · verified URL.

## I — Technical publication distribution (I draft → owner submits/publishes)
Drafts live in `docs/distribution/` (see subagent output). Original/adapted, no sales pitch.

| priority | outlet | working title | status |
|---|---|---|---|
| 1 | DZone | A PostgreSQL Pattern for Reconciling Customer Identity Across Source Systems | draft |
| 2 | HackerNoon | Why Dashboards Disagree: the data-engineering problem behind the BI layer | draft |
| 3 | Locally Optimistic | Your metric isn't wrong — your org has four definitions of revenue | pitch |
| 4 | Data Engineering Weekly | strongest vendor-neutral technical piece | submission |

## J — Expert media (owner-gated: account creation; real credentials only)
Qwoted · Featured · SourceBottle. Expertise: data engineering, analytics engineering,
BI, data reliability, data quality, Power BI, data teams, reporting automation.
Track: query · publication · date · answer · accepted? · published URL · link? · referral.
No AI generic quote spam; answer only genuinely relevant requests.

## K — Linkable technical asset (I build → owner pushes to Bredge GitHub)
**Bredge Data Reliability Checks** — synthetic/open-source SQL + dbt tests + README
(uniqueness, referential integrity, freshness, duplicate-identity, reconciliation).
Built under `oss/data-reliability-checks/` in this repo, ready to push to the Bredge
GitHub org. Link naturally from `/insights/is-our-data-reliable` and `/resources`.
Not a link farm.
