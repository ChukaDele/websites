/* Public, non-secret site configuration. Contact abuse mitigation is
 * enforced server-side by the Cloudflare Worker rate-limit binding. */

/** Origins the lead endpoint will accept submissions from. */
export const ALLOWED_ORIGINS = [
  "https://bredge.thebredge.workers.dev",
  "https://bredge-release-qa.thebredge.workers.dev",
  "https://thebredge.com",
  "https://www.thebredge.com",
  "http://localhost:3100",
];
