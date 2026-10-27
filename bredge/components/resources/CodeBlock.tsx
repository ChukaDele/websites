"use client";
import { useState } from "react";
import { copyText } from "./ToolActions";

/** A generated code or YAML block with its own copy button. Scrolls inside
 *  itself so long lines never widen the page. */
export function CodeBlock({ code, label, lang }: { code: string; label: string; lang?: string }) {
  const [status, setStatus] = useState("");
  return (
    <figure className="rs-code">
      <figcaption>
        <span>{label}{lang ? <small> · {lang}</small> : null}</span>
        <button type="button" className="rs-btn rs-btn-sm" onClick={async () => { setStatus((await copyText(code)) ? "Copied" : "Copy failed"); window.setTimeout(() => setStatus(""), 2000); }}>
          {status || "Copy"}
        </button>
      </figcaption>
      <pre><code>{code}</code></pre>
    </figure>
  );
}
