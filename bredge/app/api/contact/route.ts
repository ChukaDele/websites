/**
 * Single lead pipeline for every Bredge form.
 *
 *   Browser → POST /api/contact (this Worker route = security boundary)
 *           → Google Apps Script Web App → Google Sheet + notification email
 *
 * Layers, in order: origin allowlist → honeypot → min-interaction-time →
 * field validation → content heuristics → Cloudflare Turnstile (server-side)
 * → forward to Apps Script with a shared secret. We only report success if the
 * Apps Script confirms the row was written. No secrets ever reach the client.
 *
 * Required Worker secrets/vars (see integrations/google-leads/SETUP.md):
 *   GOOGLE_LEADS_WEBHOOK_URL     — deployed Apps Script /exec URL
 *   GOOGLE_LEADS_WEBHOOK_SECRET  — shared secret, also in Apps Script props
 *   TURNSTILE_SECRET_KEY         — Cloudflare Turnstile secret (optional in dev)
 */

import { ALLOWED_ORIGINS } from "../../../lib/config";

interface Env {
  GOOGLE_LEADS_WEBHOOK_URL?: string;
  GOOGLE_LEADS_WEBHOOK_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type Utm = { source?: string; medium?: string; campaign?: string; content?: string };
type Payload = {
  formType?: string;
  name?: string; email?: string; company?: string;
  country?: string; phone?: string; phoneE164?: string; phoneCountry?: string; callingCode?: string;
  need?: string; needs?: string[]; projectType?: string; capability?: string; urgentArea?: string; message?: string; timeline?: string;
  page?: string; intent?: string; trafficGroup?: string; utm?: Utm;
  turnstileToken?: string;
  company_website?: string; // honeypot
  elapsedMs?: number;       // ms since the form was shown
};

function getEnv(): Env {
  return (globalThis as unknown as { process?: { env?: Env } }).process?.env ?? {};
}

const bad = (error: string, status = 400) => Response.json({ error }, { status });
const ok = () => Response.json({ ok: true }, { status: 200 });
// Bots that trip the honeypot / speed trap get a fake 200 so they don't learn.
const silentOk = () => Response.json({ ok: true }, { status: 200 });

async function verifyTurnstile(token: string, secret: string, ip?: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await r.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const env = getEnv();

  // Origin allowlist
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return bad("Unexpected origin.", 403);

  let body: Payload;
  try { body = (await request.json()) as Payload; } catch { return bad("Invalid request."); }

  // Honeypot + speed trap → silently accepted, never stored.
  if (body.company_website && body.company_website.trim() !== "") return silentOk();
  if (typeof body.elapsedMs === "number" && body.elapsedMs >= 0 && body.elapsedMs < 1200) return silentOk();

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const company = (body.company || "").trim();
  const message = (body.message || "").trim();
  const formType = (body.formType || "contact").trim().slice(0, 40);

  if (!name || !email || !company || !message) return bad("Please add your name, email, company and a short description.");
  if (name.length > 120 || company.length > 160) return bad("That name or company looks too long.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return bad("That email doesn’t look right.");
  if (message.length > 5000) return bad("That message is very long — please trim it a little.");

  // Needs: accept array, fall back to legacy single `need`, allowlist only.
  const ALLOWED_NEEDS = new Set(["Data engineering", "Analytics", "BI & reporting", "Data quality / reconciliation", "Reporting & workflow automation", "Embedded Data Team", "Data Diagnostic", "Not sure yet"]);
  let needs: string[] = Array.isArray(body.needs) ? body.needs : (body.need ? [body.need] : []);
  needs = needs.map((n) => String(n).trim()).filter((n) => ALLOWED_NEEDS.has(n));
  needs = [...new Set(needs)].slice(0, 8);
  if (needs.length === 0) return bad("Please select at least one area we can help with.");

  // Conservative content heuristics (don't block legitimate technical URLs).
  const linkCount = (message.match(/https?:\/\//gi) || []).length;
  if (linkCount > 6) return bad("Too many links in the message.");

  // Turnstile (server-side) — enforced only when the secret is configured.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = (body.turnstileToken || "").trim();
    if (!token) return bad("Please complete the verification.");
    const ip = request.headers.get("cf-connecting-ip") || undefined;
    const passed = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);
    if (!passed) return bad("Verification failed — please try again.");
  }

  const submission = {
    formType,
    name, email: email.toLowerCase(), company,
    country: (body.phoneCountry || body.country || "").slice(0, 80),
    phone: (body.phone || "").slice(0, 40),
    phoneE164: (body.phoneE164 || "").slice(0, 24),
    phoneCountry: (body.phoneCountry || "").slice(0, 8),
    needs: needs.join("; "),
    capability: (body.capability || "").slice(0, 120),
    urgentArea: (body.urgentArea || "").slice(0, 120),
    trafficGroup: (body.trafficGroup || "").slice(0, 40),
    projectType: (body.projectType || "").slice(0, 160),
    timeline: (body.timeline || "").slice(0, 120),
    message,
    page: (body.page || "").slice(0, 300),
    intent: (body.intent || "").slice(0, 40),
    referrer: (request.headers.get("referer") || "").slice(0, 300),
    utm: {
      source: (body.utm?.source || "").slice(0, 120),
      medium: (body.utm?.medium || "").slice(0, 120),
      campaign: (body.utm?.campaign || "").slice(0, 160),
      content: (body.utm?.content || "").slice(0, 160),
    },
    receivedAt: new Date().toISOString(),
  };

  if (!env.GOOGLE_LEADS_WEBHOOK_URL || !env.GOOGLE_LEADS_WEBHOOK_SECRET) {
    // Not configured — do not pretend it was received.
    return bad("Our form delivery isn’t configured yet. Please email hello@thebredge.com and we’ll reply personally.", 503);
  }

  try {
    const r = await fetch(env.GOOGLE_LEADS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.GOOGLE_LEADS_WEBHOOK_SECRET, ...submission }),
    });
    const data = (await r.json().catch(() => ({}))) as { ok?: boolean };
    if (!r.ok || !data.ok) throw new Error(`Webhook responded ${r.status}`);
    return ok();
  } catch {
    return bad("That didn’t send. Please try again, or email hello@thebredge.com.", 502);
  }
}
