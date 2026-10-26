"use client";

import { useEffect, useRef, useState } from "react";
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

const INTENT_TO_NEED: Record<string, string> = { project: "Data engineering", embedded: "Embedded Data Team", diagnostic: "Data Diagnostic" };

type State = { kind: "idle" | "sending" | "ok" | "error"; message?: string; field?: string };

function readUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return { source: p.get("utm_source") || "", medium: p.get("utm_medium") || "", campaign: p.get("utm_campaign") || "", content: p.get("utm_content") || "" };
}

export function ContactForm({ formType = "contact" }: { formType?: string }) {
  const [needs, setNeeds] = useState<string[]>([]);
  const [capability, setCapability] = useState("");
  const [urgentArea, setUrgentArea] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ display: "", e164: "", country: "", callingCode: "", valid: false });
  const [, setPhoneTouched] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  // Until React hydrates, a click would do a native GET submit and put the
  // visitor's name, email and message in the URL (history, logs, analytics).
  const [ready, setReady] = useState(false);
  const lastLead = useRef<{ name: string; email: string; phone: string } | null>(null);
  // One stable identifier per attempted enquiry; kept across retries so a lost
  // response cannot create a duplicate Google Sheet row.
  const submissionIdRef = useRef<string | null>(null);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Arriving from a tool's "Send this result with a question": put the result
  // in the message so the visitor only has to add their question.
  const [prefill, setPrefill] = useState("");
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bredge_contact_prefill");
      if (!raw) return;
      const d = JSON.parse(raw) as { tool?: unknown; text?: unknown } | null;
      // Same-origin storage, but still untyped: only strings make it into the message.
      const tool = typeof d?.tool === "string" ? d.tool.slice(0, 120) : "";
      const text = typeof d?.text === "string" ? d.text : "";
      if (text) queueMicrotask(() => setPrefill(`My question:\n\n\nMy result from ${tool || "your tool"}:\n${text}`.slice(0, 4800)));
    } catch { /* storage blocked: nothing to prefill */ }
  }, []);
  useEffect(() => {
    if (!prefill) return;
    const box = document.getElementById("message") as HTMLTextAreaElement | null;
    if (box) { box.focus(); box.setSelectionRange(13, 13); }
  }, [prefill]);

  useEffect(() => {
    startedAt.current = performance.now();
    queueMicrotask(() => setReady(true));
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent && INTENT_TO_NEED[intent]) queueMicrotask(() => setNeeds([INTENT_TO_NEED[intent]]));
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
    if (!submissionIdRef.current) submissionIdRef.current = window.crypto?.randomUUID?.() ?? null;
    const payload = {
      ...(submissionIdRef.current ? { submissionId: submissionIdRef.current } : {}),
      formType,
      name: String(data.get("name") || "").trim(),
      email,
      // Company is optional for visitors; the API still expects a value.
      company: String(data.get("company") || "").trim() || "Not given",
      country: phone.country,
      phone: phone.display, phoneE164: phone.e164, phoneCountry: phone.country, callingCode: phone.callingCode,
      // The needs group is optional; the API expects at least one allowlisted value.
      needs: needs.length ? needs : [NOT_SURE],
      capability,
      urgentArea,
      trafficGroup: trafficGroup(),
      projectType,
      message: String(data.get("message") || "").trim(),
      timeline: "",
      page: window.location.pathname,
      intent: new URLSearchParams(window.location.search).get("intent") || "",
      utm: readUtm(),
      company_website: String(data.get("company_website") || ""),
      elapsedMs: Math.round(performance.now() - startedAt.current),
    };

    if (!payload.name) { setState({ kind: "error", message: "Please add your name.", field: "name" }); focusField("#name"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) { setState({ kind: "error", message: "That email doesn’t look right. Please check it.", field: "email" }); focusField("#email"); return; }
    // Phone is optional; if one is entered it must be valid.
    const hasPhone = phone.display.replace(/\D/g, "").length > (phone.callingCode || "").length;
    if (hasPhone && !phone.valid) { setPhoneTouched(true); setState({ kind: "error", message: "Check that phone number.", field: "phone" }); focusField("#phone-input"); return; }
    if (!payload.message) { setState({ kind: "error", message: "Tell us a little about what you’re trying to solve.", field: "message" }); focusField("#message"); return; }

    setState({ kind: "sending" });
    trackEvent("contact_submit", { selected_needs_count: needs.length, intent: payload.intent, page_path: payload.page });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        submissionIdRef.current = null;
        lastLead.current = { name: payload.name, email: payload.email, phone: payload.phoneE164 };
        trackEvent("contact_success", { selected_needs_count: needs.length, intent: payload.intent });
        try { sessionStorage.removeItem("bredge_contact_prefill"); } catch { /* ignore */ }
        setState({ kind: "ok" });
      } else {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
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
        <h2>Row inserted. Zero duplicates.</h2>
        <p>Your note has reached the Bredge team, a person and not a ticket queue. We’ll read it properly and reply by email. If it can’t wait, grab a slot below.</p>
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

  const errField = state.kind === "error" ? state.field : undefined;
  const errProps = (f: string) => (errField === f ? { "aria-invalid": true as const, "aria-describedby": "contact-form-error" } : {});

  return (
    <form className="contact-form" ref={formRef} onSubmit={onSubmit} method="post" noValidate data-clarity-mask="true">
      <div className="field">
        <label htmlFor="name">Name <i aria-hidden="true">*</i></label>
        <input id="name" name="name" autoComplete="name" required maxLength={120} {...errProps("name")} />
      </div>
      <div className="field">
        <label htmlFor="email">Email <i aria-hidden="true">*</i></label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={200} {...errProps("email")} />
      </div>
      <div className="field">
        <label htmlFor="company">Company / organisation <small className="optional">(optional)</small></label>
        <input id="company" name="company" autoComplete="organization" maxLength={160} />
      </div>

      <PhoneField onChange={setPhone} />

      <fieldset className="field needs-field" id="needs-group">
        <legend className="group-label">What can we help with? <span className="opt">optional</span></legend>
        <span className="help help-top">Select any that apply, or skip if you’re not sure.</span>
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
        <textarea key={prefill ? "prefilled" : "empty"} defaultValue={prefill} id="message" name="message" required maxLength={5000} aria-describedby={errField === "message" ? "message-help contact-form-error" : "message-help"} aria-invalid={errField === "message" || undefined} />
        <span className="help" id="message-help">{helper}</span>
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>



      <button className="button" type="submit" disabled={!ready || state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send"} <span className="arrow" aria-hidden="true">↗</span>
      </button>

      {/* OWNER CONFIRM: "reply within one working day" and "Happy to sign your NDA" are commitments the team must honour. */}
      <p className="ct-reassure">We read every message ourselves and reply within one working day. Happy to sign your NDA before you share any data.</p>

      <div role="alert" aria-atomic="true">
        {state.kind === "error" && state.message && <p className="form-status err" id="contact-form-error">{state.message}</p>}
      </div>
    </form>
  );
}
