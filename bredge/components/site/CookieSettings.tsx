"use client";

/** Persistent control to change the analytics choice. Clears the stored consent
 *  and reloads so the consent bar reappears. */
export function CookieSettings({ className = "" }: { className?: string }) {
  function reset() {
    try { localStorage.removeItem("bredge_consent"); } catch { /* noop */ }
    location.reload();
  }
  return <button type="button" className={`cookie-settings ${className}`} onClick={reset}>Cookie settings</button>;
}
