# The Bredge — Owner Action Queue

**The single place for everything that needs you.** Each item is account-gated, credential-gated,
or an irreversible/outward-facing decision I will not take unattended. Everything I *could* prepare
is already prepared and linked. Ordered by priority.

_Last updated: 2026-08-10. Supersedes the scattered "owner action" notes; see also
[growth-owner-actions.md](growth-owner-actions.md) for the fuller growth backlog._

---

## 0 · Release the responsive-motion hardening — **PR #1**

- **Action:** Review and merge https://github.com/ChukaDele/websites/pull/1 (`chore/responsive-motion-hardening` → `main`).
- **Why gated:** merging to `main` triggers `deploy-bredge.yml` → a live production deploy. I do not self-merge to production unattended.
- **What's in it:** Playwright regression suite (52 green on prod incl. the 80%-zoom condition), the `responsive-motion-systems` skill pack, the relational stage-length refinement, dead-route cleanup. **No visual change** to the live site.
- **After merge, I will:** confirm the new SHA at `/__build` and re-run the regression suite against production.

## 1 · Email aliases (Namecheap) — Part 9

- **Action:** In Namecheap → Domain List → `thebredge.com` → **Email Forwarding**, create **exactly two** forwarding aliases, both → `chuka@thebredge.com`:
  - `hello@thebredge.com`
  - `team@thebredge.com`
- **Do NOT create:** a catch-all, or any of media/privacy/legal/security/partnerships/unsubscribe. Only the two above.
- **Then verify:** send a test email to each address and confirm it lands in `chuka@`. If you want to *reply as* `hello@`, add it as a "Send mail as" identity in your mailbox (Gmail → Settings → Accounts).
- **Why gated:** I have no Namecheap credentials; this is an account change. `hello@thebredge.com` is already the site's public contact.

## 2 · GA4 measurement ID — Part 10

- **Action:** Google Analytics → create property **"The Bredge"** → add a **Web** data stream for `https://thebredge.com` → copy the **Measurement ID** (`G-XXXXXXXXXX`).
- **Give me the ID** (it is public — safe to share/commit). I will set it as the default for `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (read in [app/layout.tsx](../app/layout.tsx)), redeploy, and confirm a live hit in GA4 Realtime. Analytics only loads after a visitor accepts analytics consent — that is already wired.
- **Why gated:** needs your Google account.

## 3 · Cloudflare Turnstile (production widget) — Part 10

- **Action:** Cloudflare dashboard → **Turnstile** → add a widget for `thebredge.com` (Managed mode). It gives you two keys:
  - **Site key** (public) — give it to me; I set `TURNSTILE_SITE_KEY` in [lib/config.ts](../lib/config.ts).
  - **Secret key** (private) — **you** set it as an encrypted Worker secret: Workers & Pages → `bredge` → Settings → **Variables and Secrets** → add `TURNSTILE_SECRET_KEY` (Encrypt). **Never paste the secret in chat or commit it.**
- **After you set both, I will:** redeploy and test the contact form end-to-end (the server already enforces Turnstile only when the secret is present — see [app/api/contact/route.ts](../app/api/contact/route.ts)).
- **Why gated:** Cloudflare account + a secret I must not handle.

## 4 · GitHub org + first OSS repo — Part 15

- **Action:** Create the GitHub org **`thebredge`** (fallback **`thebredgehq`** if taken). Tell me the final name, and make sure `ChukaDele` is an owner/member.
- **After that, I will:** create the public repo **`data-reliability-checks`** in the org and push the prepared contents from [oss/data-reliability-checks/](../oss/data-reliability-checks/) (README, MIT LICENSE, `sql/`, `dbt/`) — `gh` is already authed as `ChukaDele`.
- **Why gated:** creating an org is an ownership/account decision.

## 5 · Directory listings — Part 14

- **Action:** Sign in as `teambredge@gmail.com` and submit the company listings. Profiles are pre-written, copy-paste ready:
  [Crunchbase](distribution/profiles/crunchbase.md) · [GoodFirms](distribution/profiles/goodfirms.md) · [TechBehemoths](distribution/profiles/techbehemoths.md) · [Clutch](distribution/profiles/clutch.md) · [DesignRush](distribution/profiles/designrush.md) · [manifest](distribution/profiles/manifest.md)
- **I can help live:** in an interactive session with you signed in, I can open each site and prefill the forms; I must stop at Google sign-in, email verification, CAPTCHA, and ToS acceptance — those are yours.
- **Directory facts to reuse:** public contact `hello@thebredge.com`; **no public pricing** on the site (directory brackets only: min project $2,000+, ~$60/hr, typical $3,000–$45,000); do **not** prominently surface "Founded 2023" on the website.
- **Why gated:** account login, ToS, CAPTCHA, and email verification are all owner-only.

---

### Not blocked — proceeding without you
Responsive-motion regression suite, the skill pack + independent grading, and the growth/SEO/OSS
content are all done or in progress and need nothing from you. Chrome DevTools MCP is configured but
needs a one-time approval in an interactive `claude` session before I can drive live native-zoom QA.
