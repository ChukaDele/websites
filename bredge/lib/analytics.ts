/* One typed analytics layer. Adapters forward to GA4 (gtag), Clarity and the
 * GTM dataLayer when they are configured and consent is granted. No vendor ever
 * receives lead PII — only the non-PII dimensions below. */

export type AnalyticsEvent =
  | "schedule_click" | "schedule_view" | "schedule_booking_complete"
  | "contact_form_start" | "contact_need_selected" | "contact_submit" | "contact_success" | "contact_error"
  | "service_cta_click" | "contact_cta_click"
  | "five_systems_started" | "five_systems_completed"
  | "reference_work_reached" | "reference_case_view"
  | "technical_proof_started" | "technical_proof_completed"
  | "footer_reached" | "code_copy"
  | "insight_view" | "insight_25" | "insight_50" | "insight_75" | "insight_complete"
  | "insight_toc_click" | "insight_service_click" | "insight_related_click"
  | "404_view" | "404_recovery_click";

export type EventProps = {
  page_path?: string; page_type?: string; cta_location?: string; service?: string;
  selected_needs_count?: number; intent?: string; device_group?: string;
  landing_page?: string; traffic_group?: string; [k: string]: string | number | boolean | undefined;
};

// Keys that must never be forwarded to any analytics vendor.
const PII = new Set(["name", "email", "phone", "phone_e164", "company", "message"]);

function scrub(props: EventProps = {}): EventProps {
  const out: EventProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (PII.has(k.toLowerCase())) continue;
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function consentGranted(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem("bredge_consent") === "granted"; } catch { return false; }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function trackEvent(name: AnalyticsEvent, props: EventProps = {}) {
  if (typeof window === "undefined" || !consentGranted()) return;
  const clean = scrub(props);
  const w = window as any;
  try {
    w.gtag?.("event", name, clean);
    // GA4's recommended conversion event. The contact component calls
    // contact_success only after the Worker confirms a saved lead. No
    // submission IDs, email addresses or user-entered fields are forwarded.
    if (name === "contact_success") {
      w.gtag?.("event", "generate_lead", { method: "website_contact_form" });
    }
  } catch { /* noop */ }
  try { w.clarity?.("event", name); } catch { /* noop */ }
  try { (w.dataLayer ||= []).push({ event: name, ...clean }); } catch { /* noop */ }
}

/** Fire an event at most once per page load (guards scroll-driven milestones). */
const fired = new Set<string>();
export function trackOnce(name: AnalyticsEvent, props: EventProps = {}) {
  // Do not consume the once-per-page milestone before the visitor consents.
  // A new page may legitimately record the same event name again.
  if (typeof window === "undefined" || !consentGranted()) return;
  const key = `${location.pathname}:${name}`;
  if (fired.has(key)) return;
  fired.add(key);
  trackEvent(name, props);
}

export function deviceGroup(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1100 ? "tablet" : "desktop";
}

/** Classify traffic for acquisition grouping — AI referrals get their own bucket. */
export function trafficGroup(): string {
  if (typeof document === "undefined") return "direct";
  const p = new URLSearchParams(window.location.search);
  const src = (p.get("utm_source") || "").toLowerCase();
  const ref = (document.referrer || "").toLowerCase();
  const AI = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google", "copilot.microsoft", "claude.ai"];
  const knownAiSources = ["chatgpt","openai","perplexity","gemini","copilot","claude","anthropic","you.com"];
  if (knownAiSources.some((a) => src.includes(a))
      || ["ai", "ai-search", "ai-assistant", "assistant"].includes((p.get("utm_medium") || "").toLowerCase())
      || AI.some((h) => ref.includes(h))) return "ai_referral";
  if (p.get("utm_medium") === "cpc" || p.get("gclid")) return "paid";
  if (/google\.|bing\.|duckduckgo\.|search\?/.test(ref)) return "organic_search";
  if (ref && !ref.includes(location.host)) return "referral";
  return "direct";
}
