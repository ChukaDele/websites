"use client";

import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "../../lib/config";
import { PhoneField, type PhoneValue } from "./PhoneField";

const needs = ["Data Project", "Embedded Data Team", "Data Diagnostic", "Not sure yet"];
const timelines = ["As soon as possible", "Within 1–2 months", "This quarter", "Exploring"];

const progressive: Record<string, { label: string; options: string[] }> = {
  "Data Project": { label: "What kind of project?", options: ["Data engineering", "BI / reporting", "Analytics", "Reconciliation / data quality", "Automation", "Not sure"] },
  "Embedded Data Team": { label: "What does your data capability look like today?", options: ["No dedicated data team", "Existing team needs capacity", "Missing a specialist capability", "Not sure"] },
};

const helperFor: Record<string, string> = {
  "Data Diagnostic": "What feels unreliable, manual or difficult today?",
  "Not sure yet": "Tell us what’s happening. We’ll work out where the problem sits.",
};
const DEFAULT_HELPER = "Messy is fine. A few sentences is enough.";

const INTENT_TO_NEED: Record<string, string> = { project: "Data Project", embedded: "Embedded Data Team", diagnostic: "Data Diagnostic" };

type State = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

function readUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return { source: p.get("utm_source") || "", medium: p.get("utm_medium") || "", campaign: p.get("utm_campaign") || "", content: p.get("utm_content") || "" };
}

export function ContactForm({ formType = "contact" }: { formType?: string }) {
  const [need, setNeed] = useState("");
  const [projectType, setProjectType] = useState("");
  const [timeline, setTimeline] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ display: "", e164: "", country: "", callingCode: "", valid: false });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const lastLead = useRef<{ name: string; email: string; phone: string } | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = performance.now();
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent && INTENT_TO_NEED[intent]) queueMicrotask(() => setNeed(INTENT_TO_NEED[intent]));
    if (!TURNSTILE_SITE_KEY) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true; s.defer = true; document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const payload = {
      formType,
      name: String(data.get("name") || "").trim(),
      email,
      company: String(data.get("company") || "").trim(),
      country: phone.country,
      phone: phone.display,
      phoneE164: phone.e164,
      phoneCountry: phone.country,
      callingCode: phone.callingCode,
      need,
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

    if (!payload.name || !payload.email || !payload.company || !payload.message) {
      setState({ kind: "error", message: "Please add your name, email, company and a few words on the problem." });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      setState({ kind: "error", message: "That email doesn’t look right — please check it." });
      return;
    }
    if (!need) { setState({ kind: "error", message: "Let us know what best describes what you need." }); return; }
    if (!phone.valid) { setPhoneTouched(true); setState({ kind: "error", message: "Check that phone number." }); return; }
    if (TURNSTILE_SITE_KEY && !payload.turnstileToken) { setState({ kind: "error", message: "Please complete the verification and try again." }); return; }

    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        lastLead.current = { name: payload.name, email: payload.email, phone: payload.phoneE164 };
        setState({ kind: "ok" });
      } else {
        const b = await res.json().catch(() => ({}));
        setState({ kind: "error", message: b.error || "That didn’t send. Please try again." });
      }
    } catch {
      setState({ kind: "error", message: "That didn’t send. Please try again, or email hello@thebredge.com." });
    }
  }

  function goSchedule() {
    try {
      if (lastLead.current) sessionStorage.setItem("bredge_schedule_prefill", JSON.stringify(lastLead.current));
    } catch { /* ignore */ }
    window.location.href = "/schedule";
  }

  if (state.kind === "ok") {
    return (
      <div className="contact-form form-success" role="status">
        <span className="success-mark" aria-hidden="true">✓</span>
        <h2>Thanks — we’ve got it.</h2>
        <p>Your note has been sent to the Bredge team. We’ll review the context and reply by email.</p>
        <button type="button" className="button" onClick={goSchedule}>Schedule a 30-minute call <span className="arrow" aria-hidden="true">↗</span></button>
      </div>
    );
  }

  const prog = progressive[need];
  const helper = helperFor[need] || DEFAULT_HELPER;

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
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

      <div className="field">
        <span className="group-label">What best describes what you need? <i aria-hidden="true">*</i></span>
        <div className="chip-select" role="group" aria-label="What you need">
          {needs.map((n) => (
            <button type="button" key={n} className="chip-opt" aria-pressed={need === n} onClick={() => { setNeed(need === n ? "" : n); setProjectType(""); }}>{n}</button>
          ))}
        </div>
      </div>

      <div className={`progressive${prog ? " open" : ""}`}>
        {prog && (
          <div className="field">
            <span className="group-label">{prog.label}</span>
            <div className="chip-select" role="group" aria-label={prog.label}>
              {prog.options.map((o) => (
                <button type="button" key={o} className="chip-opt" aria-pressed={projectType === o} onClick={() => setProjectType(projectType === o ? "" : o)}>{o}</button>
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
        <span className="group-label">Target timeline</span>
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
