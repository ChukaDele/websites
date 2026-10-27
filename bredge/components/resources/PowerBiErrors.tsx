"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions } from "./ToolActions";
import { PlainSummary } from "./Explainers";

/* Power BI refresh error lookup. The visitor pastes the message from refresh
 * history or the failure email; each known error is scored by how many of its
 * phrases appear, and the best matches show cause, fix and the Microsoft Learn
 * page. Every entry is taken from Microsoft's troubleshooting documentation
 * (checked 21 October 2026). Nothing is sent anywhere. */

type Entry = { id: string; title: string; match: string[]; plain: string; cause: string; fix: string[]; detail: string; doc: { label: string; href: string } };

const TS = "https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-troubleshooting-refresh-scenarios";
const IR = "https://learn.microsoft.com/en-us/power-bi/connect-data/incremental-refresh-troubleshoot";
const RD = "https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-data";
const GW = "https://learn.microsoft.com/en-us/data-integration/gateway/service-gateway-tshoot";

const ENTRIES: Entry[] = [
  { id: "memory", title: "Refresh ran out of memory", match: ["wasn't enough memory", "not enough memory", "query memory limit exceeded", "0xc13e0003", "memory", "resource governing", "out of memory"],
    plain: "The model needs more memory to refresh than its capacity allows, so the refresh is cancelled and the report keeps showing old data.",
    cause: "Refresh holds the existing model, the new copy being built and temporary structures in memory at once. When the peak passes the per-model limit of the capacity, resource governance cancels it. Large or wide tables, high-cardinality columns, calculated columns and tables, and parallel partition refresh all raise the peak.",
    fix: ["Retry once: a transient shortage during a busy period often clears", "Remove unused columns and rows, and reduce high-cardinality columns such as timestamps to the precision you need", "Move calculated columns and tables into the source or the transformation layer", "Use incremental refresh, or refresh single tables or partitions instead of the whole model", "Reduce refresh parallelism", "If the workspace recently moved capacity, check the new capacity's per-model memory limit; move to a larger F SKU if the model genuinely needs it"],
    detail: "The XMLA property DbpropMsmdRequestMemoryLimit governs command memory on Premium and Fabric capacities. On-demand paging models can hold more pages in memory later in the day, so an earlier refresh can succeed where a late one fails.",
    doc: { label: "Microsoft Learn: semantic model refresh fails with out-of-memory errors", href: TS } },
  { id: "throttle", title: "Too many refreshes at once on the capacity", match: ["capacity level limit exceeded", "node level limit exceeded", "exceeded the capacity limit for semantic model refreshes", "fewer semantic models are being processed", "throttl"],
    plain: "Too many reports are refreshing at the same moment on your Premium or Fabric capacity, so some wait or fail.",
    cause: "Each capacity SKU allows a maximum number of concurrent refreshes. When the schedule stacks refreshes at the same time, the capacity cancels or queues them.",
    fix: ["Open the refresh schedule view and spread refreshes across the hour or into off-peak times", "Retry: the scheduler retries throttled scheduled refreshes itself", "Use incremental refresh so each refresh is shorter", "Enable semantic model scale-out so refresh runs on a separate replica from user queries", "If refreshes are triggered by API or XMLA, add retry with backoff"],
    detail: "The concurrent refresh limit per SKU is in the Capacities and SKUs table of the Power BI Premium documentation.",
    doc: { label: "Microsoft Learn: refresh operation throttled by Power BI Premium", href: TS } },
  { id: "size", title: "Model too large for shared capacity", match: ["1 gb", "10 gb", "uncompressed", "exceeds the maximum size", "too large", "size limit", "larger than"],
    plain: "The model is bigger than a Pro workspace allows, so it cannot refresh until it is made smaller or moved to Premium, PPU or Fabric capacity.",
    cause: "On shared capacity (Pro workspaces), a published model can be at most 1 GB, and refresh can process at most 10 GB of uncompressed data. Premium, PPU and Fabric capacities are not bound by these two limits.",
    fix: ["Remove columns and history the reports do not use", "Aggregate detail tables to the grain the visuals need", "Use incremental refresh so only recent partitions reload", "Move the workspace to PPU or a Fabric capacity if the model must stay large"],
    detail: "On Premium capacity, turn on the large semantic model storage format before the first refresh for models over 1 GB.",
    doc: { label: "Microsoft Learn: uncompressed data limits for refresh", href: TS } },
  { id: "timeout", title: "Refresh timed out", match: ["timed out", "time-out", "timeout", "time limit", "exceeded the maximum", "took too long", "two hours", "five hours"],
    plain: "The refresh took longer than Power BI allows, so it stopped and the report still shows the previous data.",
    cause: "Scheduled refresh of an import model stops after two hours on shared capacity and five hours on Premium. Slow source queries, queries that do not fold, very large models, and source-side query timeouts all contribute. Sources signed in with Microsoft Entra ID OAuth have a token that expires in about one hour, so a long load can fail with a credentials error instead.",
    fix: ["Find the slow table: refresh tables one at a time in Power BI Desktop and time them", "Check query folding: filters and joins should run in the source, not in Power Query", "Use incremental refresh so each run loads recent data only", "Split one very large model into smaller ones", "Raise CommandTimeout in the M source call if the source query itself is slow", "Move heavy transformation upstream into a warehouse or dbt"],
    detail: "On Premium, you can bootstrap the first incremental refresh through XMLA so the initial load does not have to fit in one five-hour window.",
    doc: { label: "Microsoft Learn: scheduled refresh time-out", href: TS } },
  { id: "disabled", title: "Scheduled refresh was turned off", match: ["disabled", "four times", "consecutive", "turned off", "paused", "inactiv", "no user has visited"],
    plain: "Power BI has stopped refreshing this report on schedule, so it will keep showing the same data until someone fixes the cause and switches the schedule back on.",
    cause: "Power BI disables a scheduled refresh after four failures in a row. It also pauses the schedule when nobody has opened a report or dashboard built on the model for two months.",
    fix: ["Open refresh history and fix the error behind the failures first", "Run Refresh now to confirm it succeeds", "Switch the scheduled refresh back on in the semantic model settings", "Keep failure emails on for the model owner, or add a monitoring list"],
    detail: "If the model sits on an Embedded capacity that is switched off, the first failed refresh disables the schedule immediately.",
    doc: { label: "Microsoft Learn: scheduled refresh disabled", href: TS } },
  { id: "creds", title: "Credentials expired or invalid", match: ["credentials", "invalid", "access to the resource is forbidden", "forbidden", "password", "oauth", "token", "expired", "sign in", "authentication", "login failed"],
    plain: "The account Power BI uses to read the data has expired or changed its password, so the refresh cannot connect.",
    cause: "Stored credentials for the data source are out of date: a password changed, an OAuth token expired, or cached credentials in the browser are stale.",
    fix: ["Open the semantic model settings, then Data source credentials, and sign in again", "Clear your browser cache, sign in to Power BI, and open app.powerbi.com?alwaysPromptForContentProviderCreds=true to force a credential update", "For gateway sources, update the credentials on the gateway connection instead", "Use a service account or service principal rather than a personal account that changes password", "For SharePoint Online with OAuth, sign in with the same account you use for the Power BI service"],
    detail: "OAuth sources must be in the same tenant as the Power BI service; cross-tenant OAuth2 connections are not supported.",
    doc: { label: "Microsoft Learn: password change or expired credentials", href: TS } },
  { id: "gateway", title: "Gateway unreachable, offline or out of date", match: ["gateway", "gatewaynotreachable", "unreachable", "offline", "on-premises data gateway", "gateway version", "isn't supported", "unable to connect"],
    plain: "Power BI cannot reach the on-premises gateway that connects it to your internal databases or files, so nothing refreshes.",
    cause: "The gateway machine is off or asleep, its service has stopped, its version is out of support, or the model has no gateway or data source mapping selected.",
    fix: ["Check the gateway machine is on and the on-premises data gateway service is running", "Update the gateway: Microsoft supports only the last six monthly versions", "In the semantic model settings, confirm a gateway is selected and each data source is mapped to a gateway connection", "Check the gateway can reach the source: firewall, DNS, VPN", "Do not run a production gateway on a laptop; use a server, and add a second member to the cluster"],
    detail: "Web connector queries that use Web.Page always need a gateway for refresh.",
    doc: { label: "Microsoft Learn: troubleshoot the on-premises data gateway", href: GW } },
  { id: "folding", title: "Incremental refresh is slow or loads everything", match: ["fold", "rangestart", "rangeend", "incremental refresh", "query folding", "can be folded"],
    plain: "Incremental refresh is set up but Power BI is still reading all the history each time, so refreshes are slow and may time out.",
    cause: "Incremental refresh needs the RangeStart and RangeEnd filter to fold into a single query at the source. If the parameters and the filtered column are not both Date/Time, or a step before the filter breaks folding, the source returns everything and Power BI filters it.",
    fix: ["Make RangeStart, RangeEnd and the filtered column all Date/Time", "If the source column is an integer date key, convert the parameters to that integer in a function", "Apply the RangeStart/RangeEnd filter early, before steps that break folding", "Check with View Native Query, or trace the source, that each partition runs one filtered query", "Test with a short range of a few thousand rows before publishing"],
    detail: "On a Pro model, fix folding in Desktop, then delete the incomplete model in the service, republish and refresh again. On Premium, apply a metadata-only update through XMLA.",
    doc: { label: "Microsoft Learn: troubleshoot incremental refresh", href: IR } },
  { id: "dupes", title: "Duplicate value or partition-key conflict", match: ["duplicate value", "isn't unique", "not unique", "unique value", "partition-key", "partition key", "attribute key", "cannot be found"],
    plain: "A value that should appear once, such as a customer ID, now appears twice, so the model's relationships break and refresh fails.",
    cause: "With incremental refresh, a row whose date changed in the source can appear in two partitions. Without incremental refresh, the source has started returning duplicates on the one side of a one-to-many relationship.",
    fix: ["Find the duplicated key in the source and fix or de-duplicate it upstream", "Do not partition on a date that changes after the row is created; use a creation or posting date", "On Premium, refresh all partitions from the changed date to now in SQL Server Management Studio", "Add a uniqueness test upstream (for example a dbt unique test) so it fails before Power BI does"],
    detail: "Incremental refresh treats a date change as a delete plus an insert; a delete in the historical range is not picked up.",
    doc: { label: "Microsoft Learn: refresh fails because of duplicate values", href: IR } },
  { id: "dead", title: "Container exited unexpectedly (0x0000DEAD)", match: ["0x0000dead", "container exited"],
    plain: "An internal Power BI process stopped during refresh.",
    cause: "Microsoft documents this error without a specific root cause.",
    fix: ["Turn off the scheduled refresh", "Republish the semantic model from Power BI Desktop", "Turn the schedule back on and run Refresh now"],
    detail: "If it recurs after republishing, raise a support ticket with the refresh history activity ID.",
    doc: { label: "Microsoft Learn: container exited unexpectedly", href: TS } },
  { id: "type", title: "Type mismatch", match: ["type mismatch", "processing error"],
    plain: "A column's data type in the source no longer matches what the model expects.",
    cause: "An issue in the M script, a changed source column type, or an out-of-date Power BI Desktop.",
    fix: ["Update Power BI Desktop and republish", "Open Power Query and check the Changed Type steps against the current source", "Set explicit types after each source step"],
    detail: "Columns of type Any holding TRUE/FALSE refresh to -1/0 in the service; give them an explicit logical type.",
    doc: { label: "Microsoft Learn: Type Mismatch", href: TS } },
  { id: "unsupported", title: "Unsupported data source for refresh", match: ["unsupported data source", "web.page", "doesn't support refresh", "dynamic data source"],
    plain: "The report reads data in a way the Power BI service cannot refresh on its own.",
    cause: "A source the service cannot refresh, or a dynamic data source built from parameters at run time.",
    fix: ["Rewrite dynamic URLs with a static base URL and RelativePath or Query options", "Route the source through a gateway where required", "Land the data in a database or warehouse and connect to that instead"],
    detail: "See the Microsoft page on troubleshooting unsupported data source for refresh.",
    doc: { label: "Microsoft Learn: data refresh in Power BI", href: RD } },
  { id: "lost", title: "Connection timed out or was lost (Analysis Services / semantic model source)", match: ["connection either timed out or was lost", "was lost"],
    plain: "The link to another semantic model dropped part way through the refresh.",
    cause: "Usually a transient network failure. It can persist when the result feeds a complex M expression with several joins and is not read quickly enough.",
    fix: ["Retry: transient failures usually succeed", "Wrap the outer join table in Table.Buffer so it is read once", "Simplify the M joins or move them upstream"],
    detail: "Applies to the Analysis Services connector reading from another semantic model.",
    doc: { label: "Microsoft Learn: connection errors when refreshing from semantic models", href: TS } },
];

function rank(text: string) {
  const t = text.toLowerCase();
  if (!t.trim()) return [];
  return ENTRIES.map((e) => ({ e, score: e.match.reduce((n, m) => n + (t.includes(m) ? (m.length > 12 ? 3 : 1) : 0), 0) }))
    .filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}

type State = { text: string };
const INITIAL: State = { text: "" };
const SAMPLES = [
  "This operation was canceled because there wasn't enough memory to finish running it.",
  "Scheduled refresh has been disabled due to at least four consecutive failures.",
  "The credentials provided for the SQL source are invalid.",
  "The on-premises data gateway is unreachable.",
];

export function PowerBiErrors() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:pbi-errors:v1", INITIAL);
  const hits = rank(s.text ?? "");
  const top = hits[0]?.e;

  const text = () => [
    "Power BI refresh error lookup",
    `Error: ${s.text.trim() || "(none pasted)"}`,
    "",
    ...(hits.length ? hits.flatMap(({ e }, i) => [`${i === 0 ? "Most likely" : "Also possible"}: ${e.title}`, `Cause: ${e.cause}`, "Fix:", ...e.fix.map((f) => `- ${f}`), `Docs: ${e.doc.href}`, ""]) : ["No known pattern matched. Check the refresh history details and the Microsoft troubleshooting page."]),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="lookup" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Paste the error</p>
          <h2>What does your Power BI refresh error say?</h2>
          <p className="rs-muted">Copy the message from the semantic model&apos;s refresh history or the failure email. It stays in your browser.</p>
        </header>
        <label className="rs-field rs-field-wide">
          <span>Error message</span>
          <textarea rows={4} value={s.text} placeholder="e.g. This operation was canceled because there wasn't enough memory to finish running it." onChange={(e) => set({ text: e.target.value })} />
        </label>
        <div className="rs-chips"><span>Try an example:</span>{SAMPLES.map((x, i) => <button key={x} type="button" className="rs-chip" onClick={() => set({ text: x })}>{["Memory", "Disabled", "Credentials", "Gateway"][i]}</button>)}</div>
      </section>

      <section id="result" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · Likely cause and fix</p>
          <h2>{top ? top.title : s.text.trim() ? "No known pattern matched" : "Paste an error to see the fix"}</h2>
          {top && <PlainSummary>{top.plain}</PlainSummary>}
        </header>
        {hits.map(({ e }, i) => (
          <article key={e.id} className={`rs-errcard${i === 0 ? " is-top" : ""}`}>
            {i > 0 && <p className="rs-label">Also possible</p>}
            {i > 0 && <h3>{e.title}</h3>}
            <p><b>Why it happens:</b> {e.cause}</p>
            <p><b>How to fix it:</b></p>
            <ol className="rs-plainlist">{e.fix.map((f) => <li key={f}>{f}</li>)}</ol>
            <p className="rs-muted"><b>For your data person:</b> {e.detail} <a href={e.doc.href} rel="noopener noreferrer" target="_blank">{e.doc.label}</a></p>
          </article>
        ))}
        {s.text.trim() && !hits.length && <p className="rs-verdict">Open the refresh history, select the failed refresh and copy the full details, including any error code. Then check <a href={TS} rel="noopener noreferrer" target="_blank">Microsoft&apos;s refresh troubleshooting page</a>.</p>}
      </section>

      <section id="all" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Every error in the lookup</p>
          <h2>Common Power BI refresh errors</h2>
        </header>
        {ENTRIES.map((e) => (
          <details key={e.id} className="rs-faq"><summary>{e.title}</summary><p>{e.plain} {e.cause}</p><p><a href={e.doc.href} rel="noopener noreferrer" target="_blank">{e.doc.label}</a></p></details>
        ))}
      </section>

      <ToolActions getText={text} copyLabel="Copy the diagnosis" onReset={reset} resetLabel="Clear" />
    </div>
  );
}
