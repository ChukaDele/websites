"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions } from "./ToolActions";

/* Data audit checklist: rate ten areas, mark impact and effort for problems,
 * then place them on a priority matrix and sequence foundations first. */

type Status = "" | "ok" | "shaky" | "broken";
type Level = "" | "high" | "low";
type Item = { status: Status; impact: Level; effort: Level; note: string };

const AREAS: { id: string; name: string; q: string; signs: string; foundation: number }[] = [
  { id: "questions", name: "Business questions", q: "Can leadership's recurring questions be answered today without a special project?", signs: "The same question is answered differently each month, or needs an analyst for a week.", foundation: 1 },
  { id: "definitions", name: "Metric definitions", q: "Do key metrics have one written, agreed definition?", signs: "Revenue, margin or active customer mean different things to different teams.", foundation: 0 },
  { id: "identity", name: "Customer and product identity", q: "Is each customer, supplier or product represented once, consistently, across systems?", signs: "The same customer appears under several names or IDs in the ERP, CRM and spreadsheets.", foundation: 0 },
  { id: "sources", name: "Source systems", q: "Do you know every system that holds decision data, and who owns each?", signs: "Important numbers live in personal spreadsheets, email threads or a system only one person can access.", foundation: 0 },
  { id: "movement", name: "Data movement", q: "Does data move between systems reliably, without manual exports?", signs: "Monthly CSV exports, copy and paste between files, syncs that silently stop.", foundation: 1 },
  { id: "quality", name: "Data quality", q: "Are completeness, duplicates and reconciliation checked on critical datasets?", signs: "Errors are found by the board or a customer, not by a check.", foundation: 1 },
  { id: "lineage", name: "Lineage and freshness", q: "Can you trace a reported number back to its source, and say how fresh it is?", signs: "Nobody can explain how a figure in the pack was built, or when it was last refreshed.", foundation: 1 },
  { id: "reporting", name: "Reporting and manual effort", q: "Do recurring reports run without days of manual preparation?", signs: "Month-end reporting takes days of exports, lookups and reformatting.", foundation: 2 },
  { id: "ownership", name: "Ownership and skills", q: "Is someone accountable for the data and able to change it?", signs: "Fixes wait for one busy person, an absent vendor, or nobody at all.", foundation: 1 },
  { id: "security", name: "Security, access and cost", q: "Is access controlled and is the tooling cost proportionate to its use?", signs: "Shared logins, sensitive data in email attachments, licences nobody uses.", foundation: 2 },
];

const QUADS = [
  { id: "do", impact: "high", effort: "low", name: "Do first", text: "High impact, low effort." },
  { id: "plan", impact: "high", effort: "high", name: "Plan as a foundation project", text: "High impact, high effort." },
  { id: "fill", impact: "low", effort: "low", name: "Fill in when convenient", text: "Low impact, low effort." },
  { id: "park", impact: "low", effort: "high", name: "Park for now", text: "Low impact, high effort." },
] as const;

const emptyItem: Item = { status: "", impact: "", effort: "", note: "" };
type State = { items: Record<string, Item> };
const INITIAL: State = { items: {} };

export function AuditChecklist() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:data-audit:v1", INITIAL);
  const items = s.items ?? {};
  const get = (id: string): Item => ({ ...emptyItem, ...items[id] });
  const setItem = (id: string, patch: Partial<Item>) => set((p) => ({ ...p, items: { ...p.items, [id]: { ...emptyItem, ...p.items?.[id], ...patch } } }));

  const rated = AREAS.filter((a) => get(a.id).status);
  const counts = { ok: 0, shaky: 0, broken: 0 };
  rated.forEach((a) => { counts[get(a.id).status as "ok" | "shaky" | "broken"]++; });
  const problems = AREAS.filter((a) => ["shaky", "broken"].includes(get(a.id).status));
  const placed = problems.filter((a) => get(a.id).impact && get(a.id).effort);
  const unplaced = problems.filter((a) => !(get(a.id).impact && get(a.id).effort));
  const quadOf = (a: (typeof AREAS)[number]) => QUADS.findIndex((q) => q.impact === get(a.id).impact && q.effort === get(a.id).effort);
  const sequence = [...placed].sort((x, y) => quadOf(x) - quadOf(y) || x.foundation - y.foundation || (get(y.id).status === "broken" ? 1 : 0) - (get(x.id).status === "broken" ? 1 : 0));
  const brokenHigh = problems.filter((a) => get(a.id).status === "broken" && get(a.id).impact === "high").length;

  const text = () => [
    "Data audit checklist",
    `Rated ${rated.length} of ${AREAS.length} areas: ${counts.ok} working, ${counts.shaky} shaky, ${counts.broken} broken`,
    "",
    ...AREAS.map((a) => { const it = get(a.id); return `- ${a.name}: ${it.status || "not rated"}${it.impact ? `, impact ${it.impact}` : ""}${it.effort ? `, effort ${it.effort}` : ""}${it.note ? `. ${it.note}` : ""}`; }),
    "",
    "What to fix first:",
    ...sequence.map((a, i) => `${i + 1}. ${a.name} (${QUADS[quadOf(a)].name})`),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="audit" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Rate ten areas</p>
          <h2>How each part of your data setup is doing</h2>
          <p className="rs-muted">Rate how things work today. For anything shaky or broken, say how much it hurts decisions and how big the fix is.</p>
        </header>
        <ol className="rs-audit">
          {AREAS.map((a, i) => {
            const it = get(a.id);
            const bad = it.status === "shaky" || it.status === "broken";
            return (
              <li key={a.id} className={it.status ? `is-${it.status}` : undefined}>
                <div className="rs-audit-q">
                  <b>{i + 1}. {a.name}</b>
                  <p id={`aq-${a.id}`}>{a.q}</p>
                  <small>Signs of trouble: {a.signs}</small>
                </div>
                <div className="rs-audit-a">
                  <div className="rs-seg" role="radiogroup" aria-labelledby={`aq-${a.id}`}>
                    {(["ok", "shaky", "broken"] as const).map((st) => (
                      <label key={st} className={it.status === st ? `is-on is-${st}` : undefined}>
                        <input type="radio" name={`st-${a.id}`} checked={it.status === st} onChange={() => setItem(a.id, { status: st })} />
                        {st === "ok" ? "Working" : st === "shaky" ? "Shaky" : "Broken"}
                      </label>
                    ))}
                  </div>
                  {bad && (
                    <div className="rs-audit-more">
                      <div className="rs-seg rs-seg-sm" role="radiogroup" aria-label={`${a.name}: impact on decisions`}>
                        <span>Impact</span>
                        {(["high", "low"] as const).map((l) => (
                          <label key={l} className={it.impact === l ? "is-on" : undefined}><input type="radio" name={`im-${a.id}`} checked={it.impact === l} onChange={() => setItem(a.id, { impact: l })} />{l === "high" ? "Distorts decisions" : "Annoying"}</label>
                        ))}
                      </div>
                      <div className="rs-seg rs-seg-sm" role="radiogroup" aria-label={`${a.name}: effort to fix`}>
                        <span>Effort</span>
                        {(["low", "high"] as const).map((l) => (
                          <label key={l} className={it.effort === l ? "is-on" : undefined}><input type="radio" name={`ef-${a.id}`} checked={it.effort === l} onChange={() => setItem(a.id, { effort: l })} />{l === "low" ? "Days or weeks" : "A project"}</label>
                        ))}
                      </div>
                      <label className="rs-field rs-field-inline"><span className="rs-sr">{a.name} note</span><input value={it.note} placeholder="What you see (optional)" onChange={(e) => setItem(a.id, { note: e.target.value })} /></label>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="matrix" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · Priority matrix</p>
          <h2>What to fix first</h2>
          <p className="rs-progress">Rated {rated.length} of {AREAS.length}: {counts.ok} working, {counts.shaky} shaky, {counts.broken} broken</p>
        </header>
        <div className="rs-matrix">
          <span className="rs-axis rs-axis-y">Impact on decisions ↑</span>
          <span className="rs-axis rs-axis-x">Effort to fix →</span>
          {QUADS.map((q) => (
            <div key={q.id} className={`rs-quad rs-quad-${q.id}`}>
              <p><b>{q.name}</b><small>{q.text}</small></p>
              <ul>{placed.filter((a) => QUADS[quadOf(a)].id === q.id).map((a) => <li key={a.id} className={get(a.id).status === "broken" ? "is-broken" : undefined}>{a.name}</li>)}</ul>
            </div>
          ))}
        </div>
        {unplaced.length > 0 && <p className="rs-note">Still to place: {unplaced.map((a) => a.name).join(", ")}. Mark impact and effort above.</p>}
        {sequence.length > 0 ? (
          <>
            <h3 className="rs-h3">Sequenced list</h3>
            <ol className="rs-fixes">
              {sequence.map((a) => <li key={a.id}><b>{a.name}</b>{QUADS[quadOf(a)].name}{a.foundation === 0 ? ". Foundational: later fixes depend on it." : "."}</li>)}
            </ol>
            <p className="rs-muted">Within each box, foundations (definitions, identity, sources) come before the reporting built on them, so nothing gets fixed twice.</p>
            {brokenHigh >= 3 && <p className="rs-verdict is-warn">You have {brokenHigh} broken areas that distort decisions. Fixing them one at a time in the wrong order is where cost and time usually run away; this is the point to get the sequence right before spending.</p>}
          </>
        ) : <p className="rs-muted">Rate the areas above. Anything shaky or broken with impact and effort marked appears here, in order.</p>}
      </section>
      <ToolActions getText={text} onReset={reset} />
    </div>
  );
}
