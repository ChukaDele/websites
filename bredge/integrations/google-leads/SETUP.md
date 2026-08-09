# Bredge lead capture — one-time setup

Pipeline: **Browser → Cloudflare `/api/contact` → Google Apps Script Web App → Google Sheet + email**.
The Worker is the security boundary; the browser never talks to Google directly, and no secret is in client code.

Everything below is code-complete in this repo. There is **one manual step only**: deploy the Apps Script and paste its URL + secret into the Worker. Until that's done, the form fails cleanly to a "email us" message (it never claims false success).

## 1. Google Sheet
1. Create a Google Sheet named **Bredge Website Leads**.
2. It will auto-create a worksheet called **Leads** with these columns on first submission (or add them yourself, row 1):

   `Submission ID · Received At · Form Type · Name · Work Email · Company · Need · Timeline · Message · Landing Page · Referrer · UTM Source · UTM Medium · UTM Campaign · UTM Content · Status`

## 2. Apps Script
1. In the Sheet: **Extensions → Apps Script**.
2. Delete the stub and paste the contents of [`Code.gs`](./Code.gs).
3. **Project Settings → Script Properties → Add property**:
   - `WEBHOOK_SECRET` = a long random string (generate one, e.g. `openssl rand -hex 24`).
4. **Deploy → New deployment → Web app**:
   - Description: `Bredge leads`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorise, and **copy the Web app URL** (ends in `/exec`).

The script emails **mcdavies001@gmail.com** on every verified lead and neutralises spreadsheet formula-injection on every cell.

## 3. Cloudflare Worker secrets
From `bredge/`, set (values are never committed):

```bash
npx wrangler secret put GOOGLE_LEADS_WEBHOOK_URL     # paste the /exec URL from step 2
npx wrangler secret put GOOGLE_LEADS_WEBHOOK_SECRET  # the SAME string as WEBHOOK_SECRET
```

(Or add them in the Cloudflare dashboard → Workers → `bredge` → Settings → Variables, as **encrypted** values.)

## 4. Turnstile (bot protection) — recommended
1. Cloudflare dashboard → **Turnstile → Add widget** for `bredge.thebredge.workers.dev` (and `thebredge.com` when live).
2. Paste the **site key** (public) into `bredge/lib/config.ts` → `TURNSTILE_SITE_KEY`, commit.
3. Set the **secret key** as a Worker secret:
   ```bash
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```
The Worker enforces Turnstile server-side only when `TURNSTILE_SECRET_KEY` is present, so the form keeps working in dev without it. Honeypot + a 1.2s speed-trap + origin allowlist + strict server validation are always on.

## 5. Rate limiting (recommended, dashboard)
Add a Cloudflare **Rate limiting rule** on the zone once `thebredge.com` is proxied:
`(http.request.uri.path eq "/api/contact" and http.request.method eq "POST")` → e.g. 5 requests / 60s / IP → Block.
(We deliberately do **not** fake rate limiting with in-memory state in the Worker.)

## 6. Verify end-to-end
Submit the real form on production once. Confirm: (a) on-site success state, (b) one row in **Leads**, (c) one email to mcdavies001@gmail.com. Then delete the QA row.
