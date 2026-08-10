# The Bredge — Production Crawl / Perf / Security Verification (2026-08-10)

Host: https://thebredge.com — read-only external checks (curl + DoH). Machine-readable.

## §26 Crawl (26 canonical URLs)
| check | result |
|---|---|
| HTTP status | 26/26 → 200 (data-diagnostic-checklist showed one transient 000, re-check 200) |
| H1 per page | exactly 1 |
| canonical host | 26/26 → thebredge.com |
| Webflow markers | 0 |
| duplicate titles | 0 |
| duplicate descriptions | 0 |
| redirect chains | apex 0 hops; www 1 hop → apex |

## §27 Crawler matrix (status on /, /services, /insights, article, resource)
| bot | result |
|---|---|
| Googlebot | 200 / 200 / 200 / 200 / 200 |
| Bingbot | 200 / 200 / 200 / 200 / 200 |
| OAI-SearchBot | 200 / 200 / 200 / 200 / 200 (robots index,follow, no challenge) |
| ChatGPT-User | 200 / 200 / 200 / 200 / 200 |
| PerplexityBot | 200 / 200 / 200 / 200 / 200 |

## §24 Performance (network layer)
| page | TTFB | total | HTML bytes |
|---|---|---|---|
| / | 0.30s | 0.53s | 104KB |
| /services | 0.30s | 0.49s | 76KB |
| /insights | 0.30s | 0.48s | 63KB |
| /insights/why-dashboards-disagree | 0.35s | 0.56s | 94KB |
| /contact | 0.30s | 0.45s | 53KB |
| /schedule | 0.30s | 0.45s | 49KB |
- Static assets: `content-encoding: br` (Brotli), `cache-control: public, max-age=31536000, immutable`. HTML: `no-store` (correct for dynamic Worker).
- Hero poster webp 14.5KB (good LCP candidate); webm serves 200/range.
- **Field CWV (LCP/INP/CLS)** = C blocker: keyless PSI quota exhausted; run PSI web UI or CrUX once traffic accrues. No P0/P1 evident at the network layer.

## §25 Security
| check | result |
|---|---|
| `GET /api/lead` | 404 (no leak); `/api/` disallowed in robots |
| HTTPS/TLS | valid (Google Trust Services) |
| **Missing response headers (P1 hardening)** | HSTS, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy, Permissions-Policy, CSP |
| npm audit (runtime) | 0 vulnerabilities (`--omit=dev`) |

**Recommended headers** (apply via Cloudflare SSL/TLS → HSTS + a Response-Header Transform Rule, or the Worker):
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` (or CSP `frame-ancestors 'self'`)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- CSP: **draft carefully** (site uses GSAP, Cal embed, GA4/Clarity when enabled, Cloudflare RUM) — recommend `Content-Security-Policy-Report-Only` first to avoid breaking motion/embeds. Owner-review before enforce.

## §29 Brand-typo
- Live homepage "The Bridge": 0. Repo: no bad variants (matches were "The Bredge data systems" and "a Bredge Data Diagnostic" — both legitimate; not the company name drifting).
