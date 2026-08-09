/* Public, non-secret site configuration.
 *
 * TURNSTILE_SITE_KEY is a *public* Cloudflare Turnstile key (safe to commit).
 * Paste your key here after creating a Turnstile widget; leave "" to disable
 * the widget in development. The matching TURNSTILE_SECRET_KEY is a Worker
 * secret and never appears in client code. */
export const TURNSTILE_SITE_KEY = "";

/** Origins the lead endpoint will accept submissions from. */
export const ALLOWED_ORIGINS = [
  "https://bredge.thebredge.workers.dev",
  "https://thebredge.com",
  "https://www.thebredge.com",
  "http://localhost:3100",
];
