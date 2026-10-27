"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";

/* Revenue reconciliation: a bridge from figure A to figure B, every difference
 * assigned to a class, plus the seven checks to run before trusting either. */

type Cls = "timing" | "identity" | "scope" | "duplication" | "currency" | "grain" | "definition";
const CLASSES: { id: Cls; label: string; hint: string }[] = [
  { id: "timing", label: "Timing", hint: "Same item, different date: close date versus invoice date, cut-off, time zone." },
  { id: "identity", label: "Identity", hint: "Same customer or product under different IDs. Often nets to zero in total but moves revenue between customers." },
  { id: "scope", label: "Scope", hint: "One system includes something the other excludes: VAT, a branch, a product line, internal or test accounts." },
  { id: "duplication", label: "Duplication", hint: "The same deal, invoice or renewal counted twice." },
  { id: "currency", label: "Currency", hint: "Different rates or rate dates for foreign-currency items." },
  { id: "grain", label: "Grain", hint: "Rows mean different things: order versus invoice line, deal versus subscription." },
  { id: "definition", label: "Definition", hint: "Different rules: contract value versus recognised revenue, gross versus net of credit notes or discounts." },
];

type Row = { amount: string; note: string };
type ExampleId = "uk" | "us";
type State = {
  currency: string; labelA: string; labelB: string; a: string; b: string; tolerance: string;
  rows: Record<Cls, Row>; checks: boolean[]; example: "" | ExampleId;
};

const emptyRows = Object.fromEntries(CLASSES.map((c) => [c.id, { amount: "", note: "" }])) as Record<Cls, Row>;
const INITIAL: State = { currency: "£", labelA: "Finance (accounting system)", labelB: "CRM", a: "", b: "", tolerance: "0.25", rows: emptyRows, checks: [], example: "" };

const EXAMPLES: Record<ExampleId, Omit<State, "checks">> = {
  uk: {
    example: "uk", currency: "£", labelA: "Sage, September invoiced revenue", labelB: "CRM, September closed-won", a: "1846000", b: "2013000", tolerance: "0.25",
    rows: {
      ...emptyRows,
      timing: { amount: "84000", note: "Orders closed in the CRM on 26 to 30 Sept, invoiced in October." },
      scope: { amount: "52000", note: "Some CRM deal values include 20% VAT; Sage revenue excludes it." },
      duplication: { amount: "21000", note: "Two wholesale orders entered twice by different reps." },
      currency: { amount: "6500", note: "One euro order: the CRM used the deal-date rate, Sage the invoice-date rate." },
      identity: { amount: "0", note: "One customer under two account names. Nets to zero, but splits its revenue." },
    },
  },
  us: {
    example: "us", currency: "$", labelA: "Stripe, September recognised revenue", labelB: "HubSpot, September closed-won", a: "412300", b: "447900", tolerance: "0.25",
    rows: {
      ...emptyRows,
      timing: { amount: "18000", note: "Annual deals signed in September, first invoice in October." },
      definition: { amount: "9500", note: "HubSpot amount includes one-off onboarding fees; finance books them separately." },
      duplication: { amount: "4800", note: "Renewals created as new deals." },
      scope: { amount: "2300", note: "Sales tax included in some HubSpot amounts; Stripe revenue excludes it." },
    },
  },
};

const CHECKS: { title: string; how: string; tip: string }[] = [
  { title: "Write the definition in one sentence", how: "State the event that counts as revenue and the date it is recognised. If the two teams write different sentences, that difference is your first finding.", tip: "Example: revenue is invoiced value excluding VAT, net of credit notes, dated by invoice posting date." },
  { title: "Use the exact same time range", how: "Same start and end, same time zone, same treatment of the last day. Many gaps are a midnight boundary.", tip: "Check whether one system filters by created date and the other by close or posting date." },
  { title: "Compare refresh timestamps", how: "Note when each extract was taken. A live CRM compared with last night's ERP extract will never agree.", tip: "Write the extract time next to each total in the close file." },
  { title: "State the grain of each dataset", how: "Say what one row means: an invoice line, an invoice, an order, a deal, a subscription month.", tip: "In most accounting systems invoices and credit notes are separate documents, and one CRM deal can cover many invoices." },
  { title: "Match records, not totals", how: "Join the two sources on a shared key (invoice number, order ID, customer ID) and compare row by row. List rows that appear on one side only.", tip: "If there is no shared key, that is an identity finding, and it belongs in the bridge." },
  { title: "Classify every difference", how: "Put each unmatched or mismatched amount into one class in the bridge above, with a note of the evidence.", tip: "Keep going until the residual is inside your tolerance." },
  { title: "Give each class one owner and one fix location", how: "Decide whether each class is fixed at source, in the data model, or by agreeing the definition. Write the owner's name.", tip: "A fix in a dashboard formula is a sign the fix is in the wrong place." },
];

export function ReconciliationTool() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:revenue-reconciliation:v2", INITIAL);
  const rows = { ...emptyRows, ...s.rows };
  const a = toNum(s.a), b = toNum(s.b);
  const gap = b - a;
  const explained = CLASSES.reduce((sum, c) => sum + toNum(rows[c.id].amount), 0);
  const residual = gap - explained;
  const tolPct = toNum(s.tolerance) / 100;
  const base = Math.max(Math.abs(a), Math.abs(b));
  const hasFigures = a !== 0 || b !== 0;
  const within = hasFigures && Math.abs(residual) <= base * tolPct;
  const pctExplained = gap !== 0 ? Math.min(1, Math.max(0, explained / gap)) : hasFigures ? 1 : 0;
  const cur = s.currency;
  const money = (n: number) => `${n < 0 ? "−" : ""}${cur}${fmtNum(Math.abs(n))}`;
  const maxBar = Math.max(1, ...CLASSES.map((c) => Math.abs(toNum(rows[c.id].amount))), Math.abs(residual));

  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const setRow = (id: Cls, patch: Partial<Row>) => set((p) => ({ ...p, rows: { ...emptyRows, ...p.rows, [id]: { ...emptyRows[id], ...p.rows?.[id], ...patch } } }));
  const toggle = (i: number) => set((p) => { const c = [...(p.checks ?? [])]; c[i] = !c[i]; return { ...p, checks: c }; });
  const done = CHECKS.filter((_, i) => s.checks?.[i]).length;

  const text = () => [
    `Revenue reconciliation${s.example ? " (illustrative example)" : ""}`,
    `${s.labelA}: ${money(a)}`,
    `${s.labelB}: ${money(b)}`,
    `Gap to explain: ${money(gap)}`,
    ...CLASSES.filter((c) => toNum(rows[c.id].amount) !== 0 || rows[c.id].note).map((c) => `- ${c.label}: ${money(toNum(rows[c.id].amount))}${rows[c.id].note ? `. ${rows[c.id].note}` : ""}`),
    `Explained: ${money(explained)}`,
    `Unexplained residual: ${money(residual)} (tolerance ${s.tolerance}%): ${within ? "within tolerance" : "keep matching records"}`,
    "",
    `Checks done: ${done} of ${CHECKS.length}`,
    ...CHECKS.map((c, i) => `[${s.checks?.[i] ? "x" : " "}] ${i + 1}. ${c.title}`),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="bridge" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · The bridge</p>
          <h2>Explain the gap, class by class</h2>
          <p className="rs-muted">Enter the two figures and each difference as the amount that takes you from the first to the second. Positive if the second figure is higher because of it.</p>
          <div className="rs-chips" role="group" aria-label="Load an illustrative example">
            <span>Try an illustrative example:</span>
            <button type="button" className={`rs-chip${s.example === "uk" ? " is-on" : ""}`} onClick={() => set((p) => ({ ...p, ...EXAMPLES.uk }))}>UK wholesaler, Sage vs CRM (£)</button>
            <button type="button" className={`rs-chip${s.example === "us" ? " is-on" : ""}`} onClick={() => set((p) => ({ ...p, ...EXAMPLES.us }))}>US SaaS, Stripe vs HubSpot ($)</button>
            {s.example && <button type="button" className="rs-chip" onClick={() => set((p) => ({ ...p, example: "", labelA: INITIAL.labelA, labelB: INITIAL.labelB, a: "", b: "", rows: emptyRows }))}>Start blank</button>}
          </div>
          {s.example && <p className="rs-note">Illustrative example with invented figures, to show how a bridge reads. Replace them with yours.</p>}
        </header>

        <div className="rs-grid-figs">
          <label className="rs-field rs-field-sm"><span>Currency</span>
            <select value={cur} onChange={(e) => update({ currency: e.target.value })}>
              <option value="£">£ Sterling</option><option value="$">$ Dollar</option><option value="€">€ Euro</option>
            </select>
          </label>
          <label className="rs-field"><span>First figure: source</span><input value={s.labelA} onChange={(e) => update({ labelA: e.target.value, example: "" })} /></label>
          <label className="rs-field"><span>Amount</span><input inputMode="decimal" value={s.a} placeholder="0" onChange={(e) => update({ a: e.target.value, example: "" })} /></label>
          <span className="rs-grid-gap" aria-hidden="true" />
          <label className="rs-field"><span>Second figure: source</span><input value={s.labelB} onChange={(e) => update({ labelB: e.target.value, example: "" })} /></label>
          <label className="rs-field"><span>Amount</span><input inputMode="decimal" value={s.b} placeholder="0" onChange={(e) => update({ b: e.target.value, example: "" })} /></label>
        </div>

        <div className="rs-kpis">
          <div><small>Gap to explain</small><b>{money(gap)}</b></div>
          <div><small>Explained</small><b>{money(explained)}</b></div>
          <div className={hasFigures ? (within ? "is-good" : "is-warn") : undefined}><small>Unexplained</small><b>{money(residual)}</b></div>
          <div><small>Share explained</small><b>{hasFigures ? `${Math.round(pctExplained * 100)}%` : "n/a"}</b></div>
        </div>

        <ul className="rs-bridge">
          {CLASSES.map((c) => {
            const v = toNum(rows[c.id].amount);
            return (
              <li key={c.id}>
                <div className="rs-bridge-label"><b>{c.label}</b><small>{c.hint}</small></div>
                <label className="rs-field rs-field-inline"><span className="rs-sr">{c.label} amount</span><input inputMode="decimal" placeholder="0" value={rows[c.id].amount} onChange={(e) => { setRow(c.id, { amount: e.target.value }); update({ example: "" }); }} /></label>
                <label className="rs-field rs-field-inline rs-bridge-note"><span className="rs-sr">{c.label} evidence note</span><input placeholder="Evidence, e.g. invoice numbers" value={rows[c.id].note} onChange={(e) => setRow(c.id, { note: e.target.value })} /></label>
                <span className="rs-bar" aria-hidden="true"><i className={v < 0 ? "is-neg" : undefined} style={{ width: `${(Math.abs(v) / maxBar) * 100}%` }} /></span>
              </li>
            );
          })}
          <li className="rs-bridge-residual">
            <div className="rs-bridge-label"><b>Still unexplained</b><small>Keep matching records until this is inside tolerance.</small></div>
            <label className="rs-field rs-field-inline"><span>Tolerance, % of the larger figure</span><input inputMode="decimal" value={s.tolerance} onChange={(e) => update({ tolerance: e.target.value })} /></label>
            <p className={`rs-verdict ${hasFigures ? (within ? "is-good" : "is-warn") : ""}`}>
              {!hasFigures ? "Enter both figures to start." : within ? `Reconciled within ${s.tolerance}%. Record the classes and owners in the close file.` : `${money(residual)} is still unexplained. Match records on a shared key and classify what you find.`}
            </p>
            <span className="rs-bar" aria-hidden="true"><i className="is-warn" style={{ width: `${(Math.abs(residual) / maxBar) * 100}%` }} /></span>
          </li>
        </ul>
      </section>

      <section id="checks" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · Before you trust either number</p>
          <h2>The seven checks <span className="rs-count">{done} of {CHECKS.length} done</span></h2>
        </header>
        <ol className="rs-checks">
          {CHECKS.map((c, i) => (
            <li key={c.title} className={s.checks?.[i] ? "is-done" : undefined}>
              <label>
                <input type="checkbox" checked={!!s.checks?.[i]} onChange={() => toggle(i)} />
                <span><b>{i + 1}. {c.title}</b>{c.how}<em>{c.tip}</em></span>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <ToolActions getText={text} onReset={reset} />
    </div>
  );
}
