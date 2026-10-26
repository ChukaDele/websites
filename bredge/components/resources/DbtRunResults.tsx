"use client";
import { useMemo, useState } from "react";
import { ToolActions, fmtNum } from "./ToolActions";
import { PlainSummary, Terms } from "./Explainers";

/* dbt run_results.json analyser. Reads dbt's run_results.json (and, if given,
 * manifest.json) in the browser: slowest nodes, time by materialisation or
 * resource type, thread utilisation, failing and warning tests, and, with
 * the manifest, the critical path: the chain of dependent nodes whose run
 * times add up to the longest, which bounds the wall-clock time however many
 * threads you add. Files stay in memory on this page and are never uploaded. */

type Result = { unique_id: string; status: string; execution_time: number; thread_id?: string; message?: string | null; failures?: number | null; timing?: { name: string; started_at?: string; completed_at?: string }[] };
type RunResults = { metadata?: { dbt_version?: string; generated_at?: string }; elapsed_time?: number; args?: { threads?: number; which?: string }; results: Result[] };
type Manifest = { nodes?: Record<string, { resource_type?: string; config?: { materialized?: string }; depends_on?: { nodes?: string[] }; name?: string }> };

/** Hand-edited or truncated artifacts: keep only well-formed results and coerce
 * every field the analysis reads, so one bad row can't crash or skew the page. */
function normaliseRunResults(j: Partial<RunResults>): RunResults {
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
  const results = (j.results ?? [])
    .filter((r): r is Result => !!r && typeof r === "object" && typeof (r as Result).unique_id === "string" && (r as Result).unique_id !== "")
    .map((r) => ({
      unique_id: r.unique_id,
      status: typeof r.status === "string" ? r.status : "unknown",
      execution_time: num(r.execution_time),
      thread_id: typeof r.thread_id === "string" ? r.thread_id : undefined,
      message: typeof r.message === "string" ? r.message : null,
      failures: typeof r.failures === "number" && Number.isFinite(r.failures) ? r.failures : null,
    }));
  const threads = Number(j.args?.threads);
  return {
    metadata: { dbt_version: typeof j.metadata?.dbt_version === "string" ? j.metadata.dbt_version.slice(0, 40) : undefined },
    elapsed_time: typeof j.elapsed_time === "number" && Number.isFinite(j.elapsed_time) ? j.elapsed_time : undefined,
    args: { threads: Number.isFinite(threads) && threads > 0 ? Math.floor(threads) : undefined },
    results,
  };
}

const short = (id: string) => id.split(".").slice(2).join(".") || id;
const kind = (id: string) => id.split(".")[0];

export function DbtRunResults() {
  const [rr, setRr] = useState<RunResults | null>(null);
  const [mf, setMf] = useState<Manifest | null>(null);
  const [err, setErr] = useState("");
  const [paste, setPaste] = useState("");

  const load = (txt: string, which: "rr" | "mf") => {
    try {
      const j = JSON.parse(txt) as unknown;
      if (!j || typeof j !== "object" || Array.isArray(j)) throw new Error("That is JSON, but not a dbt artifact.");
      if (which === "rr") {
        const rrj = j as Partial<RunResults>;
        if (!Array.isArray(rrj.results)) throw new Error("No results array: is this run_results.json?");
        setRr(normaliseRunResults(rrj)); setErr("");
      } else {
        const nodes = (j as Manifest).nodes;
        if (!nodes || typeof nodes !== "object" || Array.isArray(nodes)) throw new Error("No nodes: is this manifest.json?");
        setMf({ nodes }); setErr("");
      }
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not read the file as JSON."); }
  };
  const onFile = (f: File | undefined, which: "rr" | "mf") => { if (!f) return; const r = new FileReader(); r.onload = () => load(String(r.result ?? ""), which); r.readAsText(f); };

  const a = useMemo(() => {
    if (!rr) return null;
    const res = rr.results;
    const node = (id: string) => mf?.nodes?.[id];
    const mat = (r: Result) => { const m = node(r.unique_id)?.config?.materialized; return typeof m === "string" && m ? m : kind(r.unique_id); };
    const total = res.reduce((s, r) => s + (r.execution_time || 0), 0);
    const elapsed = rr.elapsed_time ?? NaN;
    const threads = rr.args?.threads ?? new Set(res.map((r) => r.thread_id).filter(Boolean)).size;
    const util = elapsed > 0 && threads > 0 ? total / (elapsed * threads) : NaN;
    const slow = [...res].filter((r) => kind(r.unique_id) !== "test").sort((x, y) => y.execution_time - x.execution_time).slice(0, 15);
    const slowTests = [...res].filter((r) => kind(r.unique_id) === "test").sort((x, y) => y.execution_time - x.execution_time).slice(0, 5);
    const byMat = new Map<string, { n: number; t: number }>();
    res.forEach((r) => { const k = mat(r); const v = byMat.get(k) ?? { n: 0, t: 0 }; v.n++; v.t += r.execution_time || 0; byMat.set(k, v); });
    const problems = res.filter((r) => ["error", "fail", "warn", "runtime error"].includes(r.status));
    const statuses = new Map<string, number>();
    res.forEach((r) => statuses.set(r.status, (statuses.get(r.status) ?? 0) + 1));
    // Critical path through executed nodes, using manifest dependencies.
    let path: { id: string; t: number }[] = [];
    if (mf?.nodes) {
      const time = new Map(res.map((r) => [r.unique_id, r.execution_time || 0]));
      const memo = new Map<string, { t: number; chain: string[] }>();
      const visiting = new Set<string>(); // a hand-edited manifest can contain cycles
      const visit = (id: string, depth = 0): { t: number; chain: string[] } => {
        if (memo.has(id)) return memo.get(id)!;
        if (depth > 500 || visiting.has(id)) return { t: 0, chain: [] };
        visiting.add(id);
        const raw = mf.nodes?.[id]?.depends_on?.nodes;
        const deps = (Array.isArray(raw) ? raw : []).filter((d) => typeof d === "string" && time.has(d));
        let best = { t: 0, chain: [] as string[] };
        deps.forEach((d) => { const v = visit(d, depth + 1); if (v.t > best.t) best = v; });
        const out = { t: best.t + (time.get(id) ?? 0), chain: [...best.chain, id] };
        memo.set(id, out);
        visiting.delete(id);
        return out;
      };
      let top = { t: 0, chain: [] as string[] };
      time.forEach((_, id) => { const v = visit(id); if (v.t > top.t) top = v; });
      path = top.chain.map((id) => ({ id, t: time.get(id) ?? 0 }));
    }
    return { res, total, elapsed, threads, util, slow, slowTests, byMat: [...byMat.entries()].sort((x, y) => y[1].t - x[1].t), problems, statuses, path, mat };
  }, [rr, mf]);

  const s1 = (v: number) => (Number.isFinite(v) ? (v >= 120 ? `${fmtNum(v / 60, 1)} min` : `${fmtNum(v, 1)}s`) : "n/a");
  const pathT = a?.path.reduce((x, p) => x + p.t, 0) ?? 0;
  const max = Math.max(1, ...(a?.slow.map((r) => r.execution_time) ?? [1]));

  const text = () => !a ? "No run_results.json loaded." : [
    `dbt run analysis${rr?.metadata?.dbt_version ? ` (dbt ${rr.metadata.dbt_version})` : ""}`,
    `Elapsed ${s1(a.elapsed)}, ${a.res.length} nodes, ${a.threads} threads, utilisation ${Number.isFinite(a.util) ? `${fmtNum(a.util * 100)}%` : "n/a"}`,
    "", "Slowest nodes:", ...a.slow.map((r) => `- ${short(r.unique_id)} (${a.mat(r)}): ${s1(r.execution_time)}`),
    ...(a.path.length ? ["", `Critical path (${s1(pathT)}):`, ...a.path.map((p) => `- ${short(p.id)}: ${s1(p.t)}`)] : []),
    ...(a.problems.length ? ["", "Errors, failures and warnings:", ...a.problems.map((r) => `- ${r.status.toUpperCase()} ${short(r.unique_id)}${r.failures ? ` (${r.failures} failing rows)` : ""}${r.message ? `: ${r.message}` : ""}`)] : []),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="load" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Load your run</p>
          <h2>Upload run_results.json, and manifest.json if you have it</h2>
          <p className="rs-note"><b>Your files never leave this browser.</b> They are read on this page and kept in memory only; nothing is uploaded or saved. Both files are in your project&apos;s <code>target/</code> folder after <code>dbt run</code> or <code>dbt build</code>, or in the artifacts of a dbt Cloud job run.</p>
          <Terms items={[
            ["run_results.json", "The file dbt writes after each run: every model, test, seed and snapshot with its status and run time."],
            ["manifest.json", "The file describing the whole project: each node's materialisation and what it depends on. Needed for the critical path."],
            ["Threads", "How many models dbt runs at once (the threads setting in your profile)."],
            ["Utilisation", "Total node run time ÷ (elapsed time × threads). Low utilisation means threads sat idle waiting on dependencies."],
            ["Critical path", "The chain of dependent nodes with the longest total run time. The run cannot finish faster than this chain, whatever the thread count."],
          ]} />
        </header>
        <div className="rs-chips">
          <label className="rs-btn rs-btn-dark"><input type="file" accept=".json,application/json" className="rs-sr" onChange={(e) => onFile(e.target.files?.[0], "rr")} />Upload run_results.json</label>
          <label className="rs-btn"><input type="file" accept=".json,application/json" className="rs-sr" onChange={(e) => onFile(e.target.files?.[0], "mf")} />Add manifest.json (optional)</label>
          <span>{rr ? `${fmtNum(rr.results.length)} nodes loaded` : "Nothing loaded"}{mf ? " · manifest loaded" : ""}</span>
        </div>
        <details className="rs-helper dd-disclosure">
          <summary>Or paste run_results.json</summary>
          <label className="rs-field rs-field-wide"><span className="rs-sr">run_results.json</span><textarea rows={5} spellCheck={false} value={paste} onChange={(e) => setPaste(e.target.value)} /></label>
          <button type="button" className="rs-btn rs-gap" onClick={() => load(paste, "rr")}>Analyse pasted JSON</button>
        </details>
        {err && <p className="rs-verdict is-warn">{err}</p>}
      </section>

      {a && (
        <section id="summary" className="rs-card" aria-live="polite">
          <header className="rs-card-head">
            <p className="rs-label">Step 2 · Where the time goes</p>
            <h2>{s1(a.elapsed)} for {fmtNum(a.res.length)} nodes</h2>
            <div className="rs-kpis">
              <div><small>Threads</small><b>{a.threads || "n/a"}</b></div>
              <div className={Number.isFinite(a.util) && a.util < 0.5 ? "is-warn" : undefined}><small>Thread utilisation</small><b>{Number.isFinite(a.util) ? `${fmtNum(a.util * 100)}%` : "n/a"}</b></div>
              <div><small>Slowest node</small><b>{a.slow[0] ? s1(a.slow[0].execution_time) : "n/a"}</b></div>
              <div className={a.problems.length ? "is-warn" : "is-good"}><small>Errors, failures, warnings</small><b>{a.problems.length}</b></div>
            </div>
            <PlainSummary>
              {a.slow[0] ? <>the slowest {Math.min(5, a.slow.length)} models take {fmtNum((a.slow.slice(0, 5).reduce((x, r) => x + r.execution_time, 0) / Math.max(1, a.total)) * 100)}% of all run time, so fixing those few is what shortens the nightly build. </> : null}
              {a.path.length ? <>Even with unlimited threads this run cannot finish in under {s1(pathT)}, the length of its critical path.</> : <>Add manifest.json to see the chain that sets the minimum run time.</>}
            </PlainSummary>
          </header>
          <h3>Slowest models, seeds and snapshots</h3>
          <ul className="rs-cost-bars">
            {a.slow.map((r) => (
              <li key={r.unique_id} className={r.status === "error" ? "is-warn" : undefined}>
                <span><b className="rs-mono">{short(r.unique_id)}</b><small>{a.mat(r)} · {r.status}</small></span>
                <span className="rs-track"><i style={{ width: `${Math.max(0.5, (r.execution_time / max) * 100)}%` }} /></span>
                <strong>{s1(r.execution_time)}</strong>
              </li>
            ))}
          </ul>
          <h3>Time by {mf ? "materialisation" : "resource type"}</h3>
          <div className="rs-table-scroll">
            <table className="rs-cost-table"><thead><tr><th scope="col">{mf ? "Materialisation" : "Type"}</th><th scope="col">Nodes</th><th scope="col">Run time</th><th scope="col">Share</th></tr></thead>
              <tbody>{a.byMat.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{fmtNum(v.n)}</td><td>{s1(v.t)}</td><td>{fmtNum((v.t / Math.max(1e-9, a.total)) * 100)}%</td></tr>)}</tbody>
            </table>
          </div>
          {a.path.length > 0 && (
            <>
              <h3>Critical path: {s1(pathT)}</h3>
              <ol className="rs-plainlist rs-mono-list">{a.path.map((p) => <li key={p.id}>{short(p.id)} <span className="rs-muted">{s1(p.t)}</span></li>)}</ol>
            </>
          )}
          <h3>What to do with this</h3>
          <ul className="rs-plainlist">
            <li><b>Slow table models over large data:</b> make them incremental. The <a href="/resources/dbt-incremental-strategy-picker">incremental strategy picker</a> gives the config.</li>
            <li><b>Low utilisation:</b> threads are waiting on a long chain. Shorten the critical path (split or speed up its slowest model) before adding threads or warehouse size.</li>
            <li><b>Slow tests:</b> test on the last few days with a where config, or move heavy tests to a separate, less frequent job.</li>
            <li><b>Check what each model costs</b> in bytes or credits with the <a href="/resources/warehouse-query-cost-estimator">warehouse cost estimator</a>.</li>
          </ul>
        </section>
      )}

      {a && a.problems.length > 0 && (
        <section id="failures" className="rs-card">
          <header className="rs-card-head"><p className="rs-label">Step 3 · Failures and warnings</p><h2>{a.problems.length} node{a.problems.length > 1 ? "s" : ""} need attention</h2></header>
          <ul className="rs-checks rs-checks-plain">
            {a.problems.map((r) => <li key={r.unique_id}><span><b>{r.status.toUpperCase()}</b> <span className="rs-mono">{short(r.unique_id)}</span>{r.failures ? ` · ${fmtNum(r.failures)} failing rows` : ""}{r.message ? <><br /><small>{r.message.slice(0, 400)}</small></> : null}</span></li>)}
          </ul>
        </section>
      )}

      <ToolActions getText={text} copyLabel="Copy the analysis" onReset={() => { setRr(null); setMf(null); setPaste(""); setErr(""); }} resetLabel="Clear the files" confirmText="Clear the loaded files?" />
    </div>
  );
}
