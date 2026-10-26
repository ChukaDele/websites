"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Desktop, LinkSimple, ShareNetwork } from "@phosphor-icons/react";

/**
 * Phones only (hidden on wide boards by app/studio.css): an honest way to see
 * a board on a bigger screen later. The primary action shares the board's
 * deep link (/work?build=<id>) with the system share sheet, or copies it.
 * Nothing emails the visitor a link, so the email field is only the monthly
 * brief, posted to the shared lead route as a "newsletter" submission with the
 * build in `page`. Honeypot and timer match the site's other forms.
 */
export function DesktopLink({ build }: { build: string }) {
  const id = useId();
  const shown = useRef(0);
  const [canShare, setCanShare] = useState(false);
  const [shared, setShared] = useState<"" | "copied" | "failed">("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => { queueMicrotask(() => setCanShare(typeof navigator.share === "function")); }, []);
  useEffect(() => {
    if (!shared) return;
    const t = window.setTimeout(() => setShared(""), 2600);
    return () => window.clearTimeout(t);
  }, [shared]);

  const link = () => `${window.location.origin}/work?build=${encodeURIComponent(build)}`;

  const share = async () => {
    const url = link();
    if (canShare) {
      try { await navigator.share({ title: "The Bredge: reference build", url }); return; }
      catch (err) { if (err instanceof DOMException && err.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); setShared("copied"); }
    catch { setShared("failed"); }
  };

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
          page: `${window.location.pathname}?build=${encodeURIComponent(build)}#desktop-link`,
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

  return (
    <aside className="db-desk" aria-labelledby={`${id}-t`}>
      <p className="db-desk-t" id={`${id}-t`}><Desktop size={16} aria-hidden="true" />Best on a larger screen? Send yourself the link</p>
      <div className="db-desk-share">
        <button type="button" onClick={share}>
          {canShare ? <ShareNetwork size={16} weight="bold" aria-hidden="true" /> : <LinkSimple size={16} weight="bold" aria-hidden="true" />}
          {canShare ? "Share the link" : "Copy the link"}
        </button>
        <span role="status" className="db-desk-ok">
          {shared === "copied" && <><Check size={14} weight="bold" aria-hidden="true" />Link copied</>}
          {shared === "failed" && "Couldn’t copy. The address bar link works too."}
        </span>
      </div>
      {state === "done" ? (
        <p className="db-desk-done" role="status"><Check size={14} weight="bold" aria-hidden="true" />You’re on the list. One email a month.</p>
      ) : (
        <form onSubmit={submit} method="post" onFocus={() => { if (!shown.current) shown.current = Date.now(); }}>
          <label htmlFor={`${id}-e`} className="db-desk-lab">Get our monthly brief too (optional)</label>
          <input id={`${id}-e`} type="email" name="email" required maxLength={200} autoComplete="email" inputMode="email" placeholder="you@company.com" disabled={state === "sending"} />
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="db-desk-hp" />
          <button type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending" : "Subscribe"}</button>
          {state === "error" && <p className="db-desk-err" role="alert">{error}</p>}
        </form>
      )}
      <p className="db-desk-note">One monthly email you can unsubscribe from.</p>
    </aside>
  );
}
