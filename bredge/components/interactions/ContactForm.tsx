"use client";

import { useState } from "react";

const needs = ["A defined data project", "Ongoing data capability", "Data Diagnostic", "Not sure yet"];
const timelines = ["As soon as possible", "Within 1–2 months", "This quarter", "Exploring"];

type State = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

export function ContactForm() {
  const [need, setNeed] = useState<string>("");
  const [timeline, setTimeline] = useState<string>("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      need,
      message: String(data.get("message") || "").trim(),
      timeline,
      company_website: String(data.get("company_website") || ""), // honeypot
    };

    if (!payload.name || !payload.email || !payload.company || !payload.message) {
      setState({ kind: "error", message: "Please add your name, work email, company and a few words on the problem." });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      setState({ kind: "error", message: "That email doesn’t look right — please check it." });
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
        form.reset();
        setNeed(""); setTimeline("");
        setState({ kind: "ok", message: "Thanks — that’s with us. A data lead will read the context and reply, usually within a couple of working days." });
      } else {
        const body = await res.json().catch(() => ({}));
        setState({ kind: "error", message: body.error || "Something went wrong sending that. Please email hello@thebredge.com and we’ll pick it up." });
      }
    } catch {
      setState({ kind: "error", message: "We couldn’t reach the server. Please email hello@thebredge.com and we’ll pick it up." });
    }
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

      <button className="button" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send it to a data lead"} <span className="arrow" aria-hidden="true">↗</span>
      </button>

      {state.message && (
        <p className={`form-status ${state.kind === "ok" ? "ok" : "err"}`} role="status">{state.message}</p>
      )}
    </form>
  );
}
