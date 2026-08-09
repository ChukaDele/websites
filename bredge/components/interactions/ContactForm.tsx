"use client";

import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "../../lib/config";

const needs = ["A defined data project", "Ongoing data capability", "Data Diagnostic", "Not sure yet"];
const timelines = ["As soon as possible", "Within 1–2 months", "This quarter", "Exploring"];

type State = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

function readUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("utm_source") || "",
    medium: p.get("utm_medium") || "",
    campaign: p.get("utm_campaign") || "",
    content: p.get("utm_content") || "",
  };
}

export function ContactForm({ formType = "contact" }: { formType?: string }) {
  const [need, setNeed] = useState("");
  const [timeline, setTimeline] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = performance.now();
    if (!TURNSTILE_SITE_KEY) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true; s.defer = true;
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      formType,
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      need,
      message: String(data.get("message") || "").trim(),
      timeline,
      page: window.location.pathname,
      utm: readUtm(),
      turnstileToken: String(data.get("cf-turnstile-response") || ""),
      company_website: String(data.get("company_website") || ""),
      elapsedMs: Math.round(performance.now() - startedAt.current),
    };

    if (!payload.name || !payload.email || !payload.company || !payload.message) {
      setState({ kind: "error", message: "Please add your name, work email, company and a few words on the problem." });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      setState({ kind: "error", message: "That email doesn’t look right — please check it." });
      return;
    }
    if (TURNSTILE_SITE_KEY && !payload.turnstileToken) {
      setState({ kind: "error", message: "Please complete the verification and try again." });
      return;
    }

    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setState({ kind: "ok" });
      } else {
        const b = await res.json().catch(() => ({}));
        setState({ kind: "error", message: b.error || "That didn’t send. Please try again." });
      }
    } catch {
      setState({ kind: "error", message: "That didn’t send. Please try again, or email hello@thebredge.com." });
    }
  }

  if (state.kind === "ok") {
    return (
      <div className="contact-form form-success" role="status">
        <span className="success-mark" aria-hidden="true">✓</span>
        <h2>Thanks — we’ve got it.</h2>
        <p>Your note has been sent to the Bredge team. We’ll review the context and reply by email.</p>
        <a className="text-link" href="/how-we-work">See how we work <span className="arrow" aria-hidden="true">↗</span></a>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">Name <i aria-hidden="true">*</i></label>
        <input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="email">Work email <i aria-hidden="true">*</i></label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="company">Company <i aria-hidden="true">*</i></label>
        <input id="company" name="company" autoComplete="organization" required />
      </div>

      <div className="field">
        <span className="group-label">What best describes what you need?</span>
        <div className="chip-select" role="group" aria-label="What you need">
          {needs.map((n) => (
            <button type="button" key={n} className="chip-opt" aria-pressed={need === n} onClick={() => setNeed(need === n ? "" : n)}>{n}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="message">What are you trying to solve? <i aria-hidden="true">*</i></label>
        <textarea id="message" name="message" required />
        <span className="help">Messy is fine. A few sentences is enough.</span>
      </div>

      <div className="field">
        <span className="group-label">Do you have a target timeline?</span>
        <div className="chip-select" role="group" aria-label="Timeline">
          {timelines.map((t) => (
            <button type="button" key={t} className="chip-opt" aria-pressed={timeline === t} onClick={() => setTimeline(timeline === t ? "" : t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* honeypot: hidden from users, catches naive bots */}
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
