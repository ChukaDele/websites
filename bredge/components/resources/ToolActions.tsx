"use client";
import { useState } from "react";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch { return false; }
  }
}

function downloadFile(filename: string, body: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Toolbar under every tool: copy as a list, optional spreadsheet exports, reset. */
export function ToolActions({ getText, getTsv, csv, download, onReset, resetLabel = "Clear my answers", confirmText = "Clear everything you entered in this tool?", copyLabel = "Copy as a list" }: {
  getText: () => string;
  copyLabel?: string;
  getTsv?: () => string;
  csv?: { filename: string; get: () => string };
  download?: { filename: string; label: string; mime?: string; get: () => string };
  onReset?: () => void;
  resetLabel?: string;
  confirmText?: string;
}) {
  const [status, setStatus] = useState("");
  const flash = (msg: string) => { setStatus(msg); window.setTimeout(() => setStatus(""), 2200); };
  return (
    <div className="rs-actions-bar">
      <button type="button" className="rs-btn rs-btn-dark" onClick={async () => flash((await copyText(getText())) ? "Copied" : "Copy failed: select the text and copy")}>{copyLabel}</button>
      {getTsv && <button type="button" className="rs-btn" onClick={async () => flash((await copyText(getTsv())) ? "Copied: paste into Excel or Sheets" : "Copy failed")}>Copy for Excel</button>}
      {csv && <button type="button" className="rs-btn" onClick={() => { downloadFile(csv.filename, csv.get()); flash("CSV saved"); }}>Download CSV</button>}
      {download && <button type="button" className="rs-btn" onClick={() => { downloadFile(download.filename, download.get(), download.mime ?? "text/plain;charset=utf-8"); flash("File saved"); }}>{download.label}</button>}
      <button type="button" className="rs-btn rs-btn-send" onClick={() => {
        try { sessionStorage.setItem("bredge_contact_prefill", JSON.stringify({ tool: document.title.split("|")[0].trim(), text: getText() })); } catch { /* storage blocked */ }
        window.location.href = "/contact?from=tool";
      }}>Send this result with a question</button>
      {onReset && <button type="button" className="rs-btn rs-btn-quiet" onClick={() => { if (window.confirm(confirmText)) onReset(); }}>{resetLabel}</button>}
      <span className="rs-status" role="status" aria-live="polite">{status}</span>
      <span className="rs-saved">Saved in this browser only</span>
    </div>
  );
}

/** Spreadsheet-safe cell text: a leading = + - @ (or tab/CR) makes Excel and
 * Sheets run the cell as a formula (=HYPERLINK, =IMPORTXML…), so prefix an
 * apostrophe, which both treat as "show as text". */
export const sheetSafe = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

export const fmtNum = (n: number, dp = 0) => (Number.isFinite(n) ? n.toLocaleString("en-GB", { maximumFractionDigits: dp, minimumFractionDigits: dp }) : "n/a");
export const fmtPct = (n: number, dp = 1) => (Number.isFinite(n) ? `${n >= 0 ? "" : "−"}${Math.abs(n * 100).toFixed(dp)}%` : "n/a");
/** Typed figure → number. Unparseable is 0; magnitudes are capped at 1e15 so
 * pasting 1e308 can't push results into exponent notation or Infinity. */
export const toNum = (s: string) => { const n = Number(String(s).replace(/[,\s₦£$€]/g, "")); return Number.isFinite(n) ? Math.max(-1e15, Math.min(1e15, n)) : 0; };
