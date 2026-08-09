/**
 * Contact submissions. Runs on the Cloudflare Worker.
 *
 * Honest delivery contract:
 *  - Validates input and rejects obvious spam (honeypot).
 *  - Forwards the submission to whatever the operator has configured:
 *      CONTACT_WEBHOOK_URL  — any HTTPS endpoint (Slack/Make/Zapier/email relay), OR
 *      CONTACT_EMAIL + RESEND_API_KEY — send via Resend.
 *  - If NOTHING is configured, returns 503 with a clear message so the UI shows a
 *    failure state and the mailto fallback. We never report success unless a
 *    downstream actually accepted the submission — no silent drops.
 *
 * No secrets are hard-coded; the operator sets them as Worker secrets/vars.
 */

interface Env {
  CONTACT_WEBHOOK_URL?: string;
  CONTACT_EMAIL?: string;
  RESEND_API_KEY?: string;
}

type Payload = {
  name?: string; email?: string; company?: string;
  need?: string; message?: string; timeline?: string;
  company_website?: string; // honeypot
};

function getEnv(): Env {
  // vinext exposes bindings on the request context; fall back to process.env in dev.
  return (globalThis as unknown as { process?: { env?: Env } }).process?.env ?? {};
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: a real user never fills this. Pretend success to the bot.
  if (body.company_website && body.company_website.trim() !== "") {
    return Response.json({ ok: true }, { status: 200 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const company = (body.company || "").trim();
  const message = (body.message || "").trim();
  if (!name || !email || !company || !message) {
    return Response.json({ error: "Please add your name, work email, company and a short description." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return Response.json({ error: "That email doesn’t look right." }, { status: 400 });
  }
  if (message.length > 5000) {
    return Response.json({ error: "That message is very long — please trim it a little." }, { status: 400 });
  }

  const env = getEnv();
  const submission = {
    name, email, company,
    need: (body.need || "").slice(0, 120),
    timeline: (body.timeline || "").slice(0, 120),
    message,
    receivedAt: new Date().toISOString(),
  };

  try {
    if (env.CONTACT_WEBHOOK_URL) {
      const r = await fetch(env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "thebredge.com/contact", ...submission }),
      });
      if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
      return Response.json({ ok: true }, { status: 200 });
    }

    if (env.RESEND_API_KEY && env.CONTACT_EMAIL) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "The Bredge <noreply@thebredge.com>",
          to: [env.CONTACT_EMAIL],
          reply_to: email,
          subject: `New enquiry — ${company} (${submission.need || "unspecified"})`,
          text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nNeed: ${submission.need}\nTimeline: ${submission.timeline}\n\n${message}`,
        }),
      });
      if (!r.ok) throw new Error(`Resend responded ${r.status}`);
      return Response.json({ ok: true }, { status: 200 });
    }
  } catch {
    return Response.json({ error: "We couldn’t deliver that just now. Please email hello@thebredge.com and we’ll pick it up." }, { status: 502 });
  }

  // Nothing configured — do not pretend it was received.
  return Response.json(
    { error: "Our form delivery isn’t configured yet. Please email hello@thebredge.com and we’ll reply personally." },
    { status: 503 },
  );
}
