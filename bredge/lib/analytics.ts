/* One typed analytics layer. Adapters forward to GA4 (gtag), Clarity and the
 * GTM dataLayer when they are configured and consent is granted. No vendor ever
 * receives lead PII — only the non-PII dimensions below. */

export type AnalyticsEvent =
  | "schedule_click" | "schedule_view" | "schedule_booking_complete"
  | "contact_form_start" | "contact_need_selected" | "contact_submit" | "contact_success" | "contact_error"
  | "service_cta_click"
  | "five_systems_started" | "five_systems_completed"
  | "reference_work_reached" | "reference_case_view"
  | "technical_proof_started" | "technical_proof_completed"
  | "footer_reached"
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
  try { w.gtag?.("event", name, clean); } catch { /* noop */ }
  try { w.clarity?.("event", name); } catch { /* noop */ }
  try { (w.dataLayer ||= []).push({ event: name, ...clean }); } catch { /* noop */ }
}

/** Fire an event at most once per page load (guards scroll-driven milestones). */
const fired = new Set<string>();
export function trackOnce(name: AnalyticsEvent, props: EventProps = {}) {
  if (fired.has(name)) return;
  fired.add(name);
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
  if (src.includes("chatgpt") || AI.some((h) => ref.includes(h))) return "ai_referral";
  if (p.get("utm_medium") === "cpc" || p.get("gclid")) return "paid";
  if (/google\.|bing\.|duckduckgo\.|search\?/.test(ref)) return "organic_search";
  if (ref && !ref.includes(location.host)) return "referral";
  return "direct";
}
