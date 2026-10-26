"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";

/**
 * The monthly brief, in one field. Posts to the shared lead route as a
 * "newsletter" submission; the honeypot and timer match the contact form.
 */
export function NewsletterField({ source = "footer" }: { source?: string }) {
  // A stable id (not useId): the footer renders in different trees per page,
  // which made generated ids differ between server and client.
  const id = `nl-email-${source}`;
  const shown = useRef(0);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  // Disabled until hydrated: a native GET submit would put the email in the URL.
  const [ready, setReady] = useState(false);
  useEffect(() => { shown.current = Date.now(); queueMicrotask(() => setReady(true)); }, []);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending"); setError("");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "newsletter",
          email: data.get("email"),
          company_website: data.get("company_website"),
          elapsedMs: shown.current ? Date.now() - shown.current : undefined,
          page: `${window.location.pathname}#${source}`,
        }),
      });
      const res = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !res.ok) throw new Error(res.error || "That didn’t send. Please try again.");
      setState("done");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "That didn’t send. Please try again.");
    }
  };

  if (state === "done") {
    return <p className="sf-done" role="status"><Check size={16} weight="bold" aria-hidden="true" />You’re on the list. One email a month, no “just following up”.</p>;
  }

  return (
    <form className="sf-field" onSubmit={submit} method="post" noValidate={false}>
      <label htmlFor={id} className="sr-only">Email address</label>
      <input id={id} className="sf-input" type="email" name="email" required maxLength={200} autoComplete="email" placeholder="you@company.com" disabled={state === "sending"} />
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sf-hp" />
      <button className="sf-go" type="submit" aria-label="Subscribe to the monthly brief" disabled={!ready || state === "sending"}><ArrowRight size={18} aria-hidden="true" /></button>
      {state === "error" && <p className="sf-error" role="alert">{error}</p>}
    </form>
  );
}
