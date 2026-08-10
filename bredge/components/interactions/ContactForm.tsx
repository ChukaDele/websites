"use client";

import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "../../lib/config";
import { PhoneField, type PhoneValue } from "./PhoneField";
import { trackEvent, trackOnce, trafficGroup } from "../../lib/analytics";

const NEED_OPTIONS = [
  "Data engineering",
  "Analytics",
  "BI & reporting",
  "Data quality / reconciliation",
  "Reporting & workflow automation",
  "Embedded Data Team",
  "Data Diagnostic",
  "Not sure yet",
];
const CONCRETE = new Set(["Data engineering", "Analytics", "BI & reporting", "Data quality / reconciliation", "Reporting & workflow automation"]);
const NOT_SURE = "Not sure yet";

const CAPABILITY = { label: "What does your data capability look like today?", options: ["No dedicated data team", "Existing team needs capacity", "Missing a specialist capability", "Not sure"] };
const URGENT = { label: "Which area is most urgent?", options: ["Data engineering", "Analytics", "BI / reporting", "Data quality", "Automation", "Not sure"] };

const timelines = ["As soon as possible", "Within 1–2 months", "This quarter", "Exploring"];
const INTENT_TO_NEED: Record<string, string> = { project: "Data engineering", embedded: "Embedded Data Team", diagnostic: "Data Diagnostic" };

type State = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

function readUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return { source: p.get("utm_source") || "", medium: p.get("utm_medium") || "", campaign: p.get("utm_campaign") || "", content: p.get("utm_content") || "" };
}

export function ContactForm({ formType = "contact" }: { formType?: string }) {
  const [needs, setNeeds] = useState<string[]>([]);
  const [capability, setCapability] = useState("");
  const [urgentArea, setUrgentArea] = useState("");
  const [timeline, setTimeline] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ display: "", e164: "", country: "", callingCode: "", valid: false });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const lastLead = useRef<{ name: string; email: string; phone: string } | null>(null);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = performance.now();
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent && INTENT_TO_NEED[intent]) queueMicrotask(() => setNeeds([INTENT_TO_NEED[intent]]));
    if (!TURNSTILE_SITE_KEY) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true; s.defer = true; document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);

  function toggleNeed(n: string) {
    trackOnce("contact_form_start", { page_path: typeof window !== "undefined" ? location.pathname : "" });
    trackEvent("contact_need_selected", {});
    setNeeds((prev) => {
      if (n === NOT_SURE) return prev.includes(NOT_SURE) ? [] : [NOT_SURE];
      const next = prev.includes(n) ? prev.filter((x) => x !== n) : [...prev.filter((x) => x !== NOT_SURE), n];
      return next;
    });
  }

  function focusField(id: string) {
    const el = formRef.current?.querySelector<HTMLElement>(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const projectType = [capability, urgentArea].filter(Boolean).join(" · ");
    const payload = {
      formType,
      name: String(data.get("name") || "").trim(),
      email,
      company: String(data.get("company") || "").trim(),
      country: phone.country,
      phone: phone.display, phoneE164: phone.e164, phoneCountry: phone.country, callingCode: phone.callingCode,
      needs,
      capability,
      urgentArea,
      trafficGroup: trafficGroup(),
      projectType,
      message: String(data.get("message") || "").trim(),
      timeline,
      page: window.location.pathname,
      intent: new URLSearchParams(window.location.search).get("intent") || "",
      utm: readUtm(),
      turnstileToken: String(data.get("cf-turnstile-response") || ""),
      company_website: String(data.get("company_website") || ""),
      elapsedMs: Math.round(performance.now() - startedAt.current),
    };

    if (!payload.name) { setState({ kind: "error", message: "Please add your name." }); focusField("#name"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) { setState({ kind: "error", message: "That email doesn’t look right — please check it." }); focusField("#email"); return; }
    if (!payload.company) { setState({ kind: "error", message: "Please add your company or organisation." }); focusField("#company"); return; }
    if (!phone.valid) { setPhoneTouched(true); setState({ kind: "error", message: "Check that phone number." }); focusField("#phone-input"); return; }
    if (needs.length === 0) { setState({ kind: "error", message: "Please select at least one area we can help with." }); focusField("#needs-group"); return; }
    if (!payload.message) { setState({ kind: "error", message: "Tell us a little about what you’re trying to solve." }); focusField("#message"); return; }
    if (TURNSTILE_SITE_KEY && !payload.turnstileToken) { setState({ kind: "error", message: "Please complete the verification and try again." }); return; }

    setState({ kind: "sending" });
    trackEvent("contact_submit", { selected_needs_count: needs.length, intent: payload.intent, page_path: payload.page });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        lastLead.current = { name: payload.name, email: payload.email, phone: payload.phoneE164 };
        trackEvent("contact_success", { selected_needs_count: needs.length, intent: payload.intent });
        setState({ kind: "ok" });
      } else {
        const b = await res.json().catch(() => ({}));
        trackEvent("contact_error", { page_path: payload.page });
        setState({ kind: "error", message: b.error || "That didn’t send. Please try again." });
      }
    } catch {
      trackEvent("contact_error", { page_path: payload.page });
      setState({ kind: "error", message: "That didn’t send. Please try again, or email hello@thebredge.com." });
    }
  }

  function goSchedule() {
    try { if (lastLead.current) sessionStorage.setItem("bredge_schedule_prefill", JSON.stringify(lastLead.current)); } catch { /* ignore */ }
    window.location.href = "/schedule";
  }

  if (state.kind === "ok") {
    return (
      <div className="contact-form form-success" role="status" data-clarity-mask="true">
        <span className="success-mark" aria-hidden="true">✓</span>
        <h2>Thanks — we’ve got it.</h2>
        <p>Your note has been sent to the Bredge team. We’ll review the context and reply by email.</p>
        <button type="button" className="button" onClick={goSchedule}>Schedule a 30-minute call <span className="arrow" aria-hidden="true">↗</span></button>
      </div>
    );
  }

  const showCapability = needs.includes("Embedded Data Team");
  const showUrgent = needs.some((n) => CONCRETE.has(n));
  const helper = needs.length > 1
    ? "Tell us what you’re trying to improve and what’s getting in the way."
    : needs.length === 1 && needs[0] === "Data Diagnostic"
      ? "What feels unreliable, manual or difficult today?"
      : "Messy is fine. A few sentences is enough.";

  return (
    <form className="contact-form" ref={formRef} onSubmit={onSubmit} noValidate data-clarity-mask="true">
      <div className="field">
        <label htmlFor="name">Name <i aria-hidden="true">*</i></label>
        <input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email <i aria-hidden="true">*</i></label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="company">Company / organisation <i aria-hidden="true">*</i></label>
        <input id="company" name="company" autoComplete="organization" required />
      </div>

      <PhoneField onChange={setPhone} />
      {phoneTouched && !phone.valid && phone.display.length <= 3 && <span className="field-error" style={{ marginTop: -8 }}>Add a phone number.</span>}

      <fieldset className="field needs-field" id="needs-group">
        <legend className="group-label">What can we help with? <i aria-hidden="true">*</i></legend>
        <span className="help help-top">Select all that apply.</span>
        <div className="chip-select">
          {NEED_OPTIONS.map((n) => (
            <label key={n} className={`chip-opt chip-check${needs.includes(n) ? " on" : ""}`}>
              <input type="checkbox" checked={needs.includes(n)} onChange={() => toggleNeed(n)} />
              {n}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`progressive${showCapability ? " open" : ""}`}>
        {showCapability && (
          <div className="field">
            <span className="group-label">{CAPABILITY.label}</span>
            <div className="chip-select" role="group" aria-label={CAPABILITY.label}>
              {CAPABILITY.options.map((o) => (
                <button type="button" key={o} className="chip-opt" aria-pressed={capability === o} onClick={() => setCapability(capability === o ? "" : o)}>{o}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`progressive${showUrgent ? " open" : ""}`}>
        {showUrgent && (
          <div className="field">
            <span className="group-label">{URGENT.label} <span className="opt">optional</span></span>
            <div className="chip-select" role="group" aria-label={URGENT.label}>
              {URGENT.options.map((o) => (
                <button type="button" key={o} className="chip-opt" aria-pressed={urgentArea === o} onClick={() => setUrgentArea(urgentArea === o ? "" : o)}>{o}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="message">What are you trying to solve? <i aria-hidden="true">*</i></label>
        <textarea id="message" name="message" required />
        <span className="help">{helper}</span>
      </div>

      <div className="field">
        <span className="group-label">Target timeline <span className="opt">optional</span></span>
        <div className="chip-select" role="group" aria-label="Timeline">
          {timelines.map((t) => (
            <button type="button" key={t} className="chip-opt" aria-pressed={timeline === t} onClick={() => setTimeline(timeline === t ? "" : t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      {TURNSTILE_SITE_KEY && <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />}

      <button className="button" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send it to a data lead"} <span className="arrow" aria-hidden="true">↗</span>
      </button>

      {state.kind === "error" && state.message && <p className="form-status err" role="alert">{state.message}</p>}
    </form>
  );
}
