"use client";

import { useEffect, useRef } from "react";

/* The Invisible 90% — the reconciliation model is authored, character by
   character, as the visitor scrolls. Forward writes, reverse unwrites. This is
   the same customer-identity → billing/product rollup → canonical model the
   rest of the page describes. Reference environment, synthetic data. */

const SQL = `WITH ranked_identity AS (
    SELECT
        source_system,
        source_customer_id,
        canonical_customer_id,
        match_confidence,
        ROW_NUMBER() OVER (
            PARTITION BY source_system, source_customer_id
            ORDER BY match_confidence DESC, matched_at DESC
        ) AS match_rank
    FROM core.customer_identity_map
    WHERE match_status = 'confirmed'
),

identity AS (
    SELECT source_system, source_customer_id, canonical_customer_id
    FROM ranked_identity
    WHERE match_rank = 1
),

billing_monthly AS (
    SELECT
        i.canonical_customer_id,
        DATE_TRUNC('month', inv.paid_at)::date AS month,
        SUM(inv.amount_paid) AS cash_collected
    FROM billing.invoices inv
    JOIN identity i
      ON i.source_system = 'billing'
     AND i.source_customer_id = inv.account_id
    WHERE inv.status = 'paid'
    GROUP BY 1, 2
),

product_health AS (
    SELECT
        i.canonical_customer_id,
        COUNT(DISTINCT e.user_id) FILTER (
            WHERE e.occurred_at >= CURRENT_DATE - INTERVAL '28 days'
        ) AS active_users_28d,
        MAX(e.occurred_at) AS last_active_at
    FROM product.events e
    JOIN identity i
      ON i.source_system = 'product'
     AND i.source_customer_id = e.account_id
    GROUP BY 1
)

SELECT
    c.canonical_customer_id,
    c.account_name,
    b.month,
    b.cash_collected,
    p.active_users_28d,
    p.last_active_at
FROM core.customers c
LEFT JOIN billing_monthly b
    USING (canonical_customer_id)
LEFT JOIN product_health p
    USING (canonical_customer_id);`;

const STAGES = ["Profile", "Resolve", "Reconcile", "Define", "Test", "Operate"];

const KEYWORDS = new Set(["WITH", "AS", "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "ON", "AND", "OR", "GROUP", "BY", "ORDER", "PARTITION", "OVER", "DESC", "ASC", "USING", "INTERVAL", "FILTER", "DISTINCT", "NOT", "NULL", "IS", "IN"]);
const FUNCS = new Set(["ROW_NUMBER", "DATE_TRUNC", "SUM", "COUNT", "MAX", "MIN", "AVG", "CURRENT_DATE"]);

type Tok = { text: string; cls: string };

function tokenize(sql: string): Tok[] {
  const re = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)|(\s+)|([(),;.*=<>+\-/:]+)/g;
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    if (m[1]) out.push({ text: m[1], cls: "com" });
    else if (m[2]) out.push({ text: m[2], cls: "str" });
    else if (m[3]) out.push({ text: m[3], cls: "num" });
    else if (m[4]) {
      const up = m[4].toUpperCase();
      const bare = up.split(".")[0];
      if (KEYWORDS.has(up)) out.push({ text: m[4], cls: "kw" });
      else if (FUNCS.has(bare)) out.push({ text: m[4], cls: "fn" });
      else out.push({ text: m[4], cls: "id" });
    } else if (m[5]) out.push({ text: m[5], cls: "ws" });
    else out.push({ text: m[6] || "", cls: "pu" });
  }
  return out;
}

const CHECKS = ["identity uniqueness", "referential integrity", "source reconciliation", "valid date ordering", "bounded rates", "controlled vocabulary"];

export function InvisibleQuery() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tokens = tokenize(SQL);
    const total = SQL.length;
    const resolveEnd = SQL.indexOf("billing_monthly AS");
    const defineStart = SQL.indexOf("SELECT\n    c.canonical_customer_id");

    let disposed = false;
    let mm: { revert: () => void } | undefined;

    (async () => {
      let gsap, ST;
      try {
        [{ default: gsap }, { ScrollTrigger: ST }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      } catch { return; }
      if (disposed) return;
      gsap.registerPlugin(ST);
      const m = gsap.matchMedia();
      mm = m;

      const codeEl = root.querySelector<HTMLElement>(".iq-code");
      const cursor = root.querySelector<HTMLElement>(".iq-cursor");
      const spans: HTMLElement[] = [];
      // Build spans once (desktop + reduced-motion share the same code element).
      if (codeEl) {
        codeEl.textContent = "";
        for (const t of tokens) {
          const s = document.createElement("span");
          s.className = `t-${t.cls}`;
          s.dataset.full = t.text;
          spans.push(s);
          codeEl.appendChild(s);
        }
        if (cursor) codeEl.appendChild(cursor);
      }

      const setVisibleChars = (n: number) => {
        let acc = 0;
        for (const s of spans) {
          const full = s.dataset.full || "";
          const end = acc + full.length;
          if (end <= n) { if (s.textContent !== full) s.textContent = full; }
          else if (acc >= n) { if (s.textContent !== "") s.textContent = ""; }
          else s.textContent = full.slice(0, n - acc);
          acc = end;
        }
        // keep the writing edge in view
        if (codeEl && cursor) {
          const target = cursor.offsetTop - codeEl.clientHeight * 0.6;
          codeEl.scrollTop = Math.max(0, target);
        }
      };

      const setStage = (idx: number) => {
        root.querySelectorAll<HTMLElement>(".iq-stage").forEach((el, i) => el.classList.toggle("active", i === idx));
      };

      // DESKTOP — pinned, scrubbed authoring
      m.add("(min-width: 1001px) and (prefers-reduced-motion: no-preference)", () => {
        setVisibleChars(0);
        setStage(0);
        const st = ST.create({
          trigger: root,
          start: "top top",
          end: "+=2800",
          pin: ".iq-scene",
          scrub: 0.4,
          onUpdate: (self: { progress: number }) => {
            const p = self.progress;
            let chars = 0;
            if (p < 0.1) chars = 0;
            else if (p < 0.4) chars = ((p - 0.1) / 0.3) * resolveEnd;
            else if (p < 0.64) chars = resolveEnd + ((p - 0.4) / 0.24) * (defineStart - resolveEnd);
            else if (p < 0.82) chars = defineStart + ((p - 0.64) / 0.18) * (total - defineStart);
            else chars = total;
            setVisibleChars(Math.round(chars));
            const stageIdx = p < 0.1 ? 0 : p < 0.4 ? 1 : p < 0.64 ? 2 : p < 0.82 ? 3 : p < 0.9 ? 4 : 5;
            setStage(stageIdx);
            root.classList.toggle("iq-testing", p >= 0.82 && p < 0.9);
            root.classList.toggle("iq-done", p >= 0.9);
            if (cursor) cursor.style.opacity = p >= 0.82 ? "0" : "1";
          },
        });
        // The pin start/end are measured now, but fonts, the hero video and the
        // preloader all shift layout after this tick — refresh once they settle,
        // or the trigger's active range goes stale (scene never pins).
        const refresh = () => ST.refresh();
        refresh();
        document.fonts?.ready?.then(refresh).catch(() => {});
        window.addEventListener("load", refresh);
        const t1 = window.setTimeout(refresh, 1500);
        return () => { window.clearTimeout(t1); window.removeEventListener("load", refresh); st.kill(); };
      });

      // REDUCED MOTION (desktop) — show the finished model + result, no typing
      m.add("(min-width: 1001px) and (prefers-reduced-motion: reduce)", () => {
        setVisibleChars(total);
        setStage(5);
        root.classList.add("iq-done");
        if (cursor) cursor.style.opacity = "0";
        return () => {};
      });

      ST.refresh();
    })();

    return () => { disposed = true; mm?.revert(); };
  }, []);

  return (
    <section ref={rootRef} className="iq" aria-label="How a reliable metric is modelled">
      <div className="iq-scene">
        <div className="section-wrap iq-grid">
          <div className="iq-side">
            <p className="eyebrow light">THE INVISIBLE 90%</p>
            <h2>The dashboard is the last 10%.</h2>
            <p className="iq-lead">Before a number reaches a chart, it is modelled, reconciled and tested. Watch one reliable metric get built.</p>
            <ol className="iq-stages">
              {STAGES.map((s, i) => (
                <li key={s} className="iq-stage"><span>{String(i + 1).padStart(2, "0")}</span>{s}</li>
              ))}
            </ol>
          </div>

          <div className="iq-editor">
            <div className="iq-bar"><i /><i /><i /><span className="iq-file">customer_health.sql</span><span className="iq-env">reference · synthetic</span></div>
            <div className="iq-codewrap">
              <pre className="iq-code" aria-hidden="true"></pre>
              <span className="iq-cursor" aria-hidden="true" />
            </div>
            <div className="iq-result" aria-hidden="true">
              <dl>
                <div><dt>model</dt><dd>customer_health_monthly</dd></div>
                <div><dt>grain</dt><dd>canonical customer · month</dd></div>
                <div><dt>source rows</dt><dd>1,842</dd></div>
                <div><dt>canonical entities</dt><dd>1,772</dd></div>
                <div><dt>exceptions isolated</dt><dd>70</dd></div>
              </dl>
              <ul className="iq-checks">
                {CHECKS.map((c) => <li key={c}>✓ {c}</li>)}
              </ul>
              <strong>6 / 6 checks passed</strong>
              <small>REFERENCE ENVIRONMENT · SYNTHETIC DATA</small>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: three legible excerpts, no desktop pin */}
      <div className="iq-mobile section-wrap">
        <p className="eyebrow light">THE INVISIBLE 90%</p>
        <h2>The dashboard is the last 10%.</h2>
        <MobileExcerpt label="IDENTITY" code={`identity AS (
  SELECT canonical_customer_id
  FROM ranked_identity
  WHERE match_rank = 1
)`} />
        <MobileExcerpt label="JOIN" code={`JOIN identity i
  ON i.source_system = 'billing'
 AND i.source_customer_id = inv.account_id
WHERE inv.status = 'paid'`} />
        <MobileExcerpt label="TEST" code={`✓ identity uniqueness
✓ source reconciliation
6 / 6 checks passed`} />
        <small className="iq-m-env">Reference environment · synthetic data</small>
      </div>
    </section>
  );
}

function MobileExcerpt({ label, code }: { label: string; code: string }) {
  return (
    <div className="iq-excerpt">
      <span className="iq-ex-label">{label}</span>
      <pre>{code}</pre>
    </div>
  );
}
