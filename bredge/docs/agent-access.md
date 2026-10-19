# Agent-friendly access without opening a spam channel

Decision: support read-only discovery and user-authorised browser interactions without CAPTCHA. Do not attempt to infer intent from a User-Agent string.

1. The canonical HTML uses accessible links, labels and forms. Search and user-driven agents can read public pages; robots.txt excludes only technical /api routes.
2. /llms.txt is a helpful but voluntary index, not a security standard. /.well-known/bredge-agent.json is this site's descriptive manifest, not an IETF-registered authentication scheme.
3. Humans and browser-use agents use the same no-challenge contact form. The edge rate limiter, validation, honeypot, original Google receipt, idempotency and email outcome still apply. Verified bot status must not blindly bypass write controls.
4. For a future high-volume first-party agent integration, provision a separately scoped service identity and implement signed HTTP requests (Cloudflare Web Bot Auth or managed OAuth/service-token pattern) with per-identity quotas and replay protection. Never grant write access on User-Agent, claimed bot score or robots.txt alone.
5. Cloudflare Verified Bots and Web Bot Auth are appropriate signals for safe crawling. Zone-level WAF policy should allow appropriate verified read traffic while continuing to challenge/block abusive traffic and preserve write-endpoint protection. Review the plan/feature entitlement rather than assuming Enterprise Bot Management exists.
6. Measure spam/abuse, false blocks, conversion, and notification delivery before modifying thresholds or relaxing controls. Shared IP addresses on mobile networks can lead to false rate limits. The Worker limit is per Cloudflare location, so no global guarantee against distributed spam.

Public sources:
- https://developers.cloudflare.com/bots/concepts/bot/verified-bots/
- https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

No extra secrets, WAF bypasses, or admin permissions have been created by this change.
