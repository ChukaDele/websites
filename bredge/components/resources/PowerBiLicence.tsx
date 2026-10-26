"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";
import { PlainSummary, Terms, DataPersonNote } from "./Explainers";

/* Power BI licensing cost: Pro for everyone, Premium Per User for everyone,
 * or a Fabric F64 capacity with Pro only for people who build and share.
 * Licensing rules from Microsoft Learn "Understand Microsoft Fabric licenses
 * and capacity"; list prices from Microsoft's Power BI pricing page, both
 * checked 21 October 2026. Every price is editable. F SKU prices vary by
 * region and are entered by the visitor. */

const AS_OF = "21 October 2026";
type State = { builders: string; viewers: string; e5: string; premium: boolean; fabric: boolean; cur: string; pro: string; ppu: string; f64: string; small: string };
const INITIAL: State = { builders: "5", viewers: "60", e5: "0", premium: false, fabric: false, cur: "$", pro: "14", ppu: "24", f64: "", small: "" };

export function PowerBiLicence() {
  const [raw, set, reset] = useStoredState<State>("bredge:rs:pbi-licence:v1", INITIAL);
  const s: State = { ...INITIAL, ...raw };
  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const n = (k: keyof State) => Math.max(0, toNum(String(s[k] ?? "")));
  const b = Math.round(n("builders")), v = Math.round(n("viewers")), e5 = Math.min(b + v, Math.round(n("e5")));
  const people = b + v;
  const pro = n("pro"), ppu = n("ppu"), f64 = n("f64"), small = n("small");
  const c = s.cur || "$";
  const money = (x: number) => (Number.isFinite(x) ? `${c}${fmtNum(x)}` : "Enter a price");
  // E5 includes Pro; assume E5 holders are builders first, then viewers.
  const e5Builders = Math.min(b, e5);
  const options = [
    { id: "pro", name: "Pro for everyone", ok: !s.premium && !s.fabric, why: s.premium ? "Premium features need PPU or capacity." : s.fabric ? "Pro does not include Fabric items such as lakehouses." : "Every builder and viewer needs Pro to share and view in Pro workspaces.", month: (people - e5) * pro },
    { id: "ppu", name: "Premium Per User for everyone", ok: !s.fabric, why: s.fabric ? "PPU does not provision Fabric capacity." : "Everyone who opens PPU content needs PPU. Adds 48 refreshes a day, models over 1 GB and the XMLA endpoint.", month: people * ppu },
    { id: "f64", name: "Fabric F64 capacity + Pro for builders", ok: true, why: "On F64 or larger, viewers with a free licence and a viewer role can open Power BI content. Builders still need Pro.", month: f64 > 0 ? f64 + (b - e5Builders) * pro : NaN },
    ...(s.fabric ? [{ id: "small", name: "Smaller F SKU (F2 to F32) + Pro for everyone", ok: true, why: "Below F64, every viewer of Power BI content still needs Pro or PPU.", month: small > 0 ? small + (people - e5) * pro : NaN }] : []),
  ];
  const valid = options.filter((o) => o.ok && Number.isFinite(o.month));
  const best = [...valid].sort((a, b2) => a.month - b2.month)[0];
  const breakEven = pro > 0 && f64 > 0 ? Math.ceil(f64 / pro) : NaN;
  const max = Math.max(1, ...options.filter((o) => Number.isFinite(o.month)).map((o) => o.month));

  const text = () => [
    `Power BI licensing estimate (list prices as of ${AS_OF}; edit to your own)`,
    `${b} people who build and share, ${v} who only view${e5 ? `, ${e5} already licensed through Microsoft 365 E5` : ""}`,
    ...options.map((o) => `- ${o.name}: ${o.ok ? `${money(o.month)} a month, ${money(o.month * 12)} a year` : `not suitable (${o.why})`}`),
    best ? `Lowest cost that meets the needs: ${best.name}.` : "",
    Number.isFinite(breakEven) ? `F64 costs the same as Pro for about ${fmtNum(breakEven)} licensed users.` : "",
  ].filter(Boolean).join("\n");

  const num = (k: keyof State, label: string, hint?: string, ph?: string) => (
    <label key={k} className="rs-field"><span>{label}</span><input inputMode="decimal" value={String(s[k] ?? "")} placeholder={ph} onChange={(e) => update({ [k]: e.target.value } as Partial<State>)} />{hint && <small className="rs-hint">{hint}</small>}</label>
  );

  return (
    <div className="rs-toolwrap">
      <section id="inputs" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Who uses Power BI</p>
          <h2>How many people build reports, and how many only view them?</h2>
          <Terms items={[
            ["Pro", "Per-user licence to publish and share reports, and to view content in Pro workspaces."],
            ["Premium Per User (PPU)", "Per-user licence with most Premium features: 48 scheduled refreshes a day, models over 1 GB, XMLA endpoint. Everyone who opens PPU content needs PPU."],
            ["Fabric capacity (F SKU)", "Compute you rent from Azure by size (F2 to F2048), billed per second or reserved yearly. From F64 up, people with a free licence can view Power BI content."],
            ["Builder", "Someone who creates, publishes or shares reports, or edits in a workspace. Needs Pro or PPU on every option."],
          ]} />
        </header>
        <div className="rs-cost-fields">
          {num("builders", "People who build or share reports")}
          {num("viewers", "People who only view reports")}
          {num("e5", "Of these, people on Microsoft 365 E5", "E5 includes Power BI Pro. Check your agreement.")}
          <label className="rs-field rs-field-check"><input type="checkbox" checked={s.premium} onChange={(e) => update({ premium: e.target.checked })} /><span>We need Premium features: more than 8 refreshes a day, models over 1 GB, or the XMLA endpoint</span></label>
          <label className="rs-field rs-field-check"><input type="checkbox" checked={s.fabric} onChange={(e) => update({ fabric: e.target.checked })} /><span>We want Fabric items too: lakehouse, warehouse, notebooks, pipelines</span></label>
        </div>
      </section>

      <section id="prices" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · Prices</p>
          <h2>Microsoft list prices, editable</h2>
          <p className="rs-note"><b>Pro and PPU defaults are Microsoft&apos;s US list prices per user per month, paid yearly, as of {AS_OF}.</b> Prices differ by currency, region and agreement. Fabric capacity prices vary by Azure region, so enter yours from the Azure pricing calculator.</p>
        </header>
        <div className="rs-cost-fields">
          <label className="rs-field"><span>Currency symbol</span><input value={s.cur} maxLength={3} onChange={(e) => update({ cur: e.target.value })} /></label>
          {num("pro", "Pro, per user per month")}
          {num("ppu", "PPU, per user per month")}
          {num("f64", "F64, per month", "Pay-as-you-go or reserved price for your region.", "Your region's price")}
          {s.fabric && num("small", "Smaller F SKU, per month", "e.g. F8 or F16 for your region.", "Your region's price")}
        </div>
      </section>

      <section id="compare" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 3 · The comparison</p>
          <h2>{best ? `Lowest cost: ${best.name}` : "Enter prices to compare"}</h2>
          {best && <PlainSummary>{best.name} costs about {money(best.month * 12)} a year for {fmtNum(people)} people.{Number.isFinite(breakEven) ? ` A capacity starts to pay off once about ${fmtNum(breakEven)} people would otherwise need Pro.` : " Enter your F64 price to see when a capacity pays off."}</PlainSummary>}
        </header>
        <ul className="rs-cost-bars">
          {options.map((o) => (
            <li key={o.id} className={!o.ok ? "is-proj" : best?.id === o.id ? "is-frac" : undefined}>
              <span><b>{o.name}</b><small>{o.ok ? o.why : `Not suitable: ${o.why}`}</small></span>
              <span className="rs-track"><i style={{ width: `${o.ok && Number.isFinite(o.month) ? Math.max(0.5, (o.month / max) * 100) : 0}%` }} /></span>
              <strong>{o.ok ? money(o.month) : "n/a"}</strong>
            </li>
          ))}
        </ul>
        <p className="rs-muted">Monthly figures. Multiply by 12 for the yearly commitment.</p>
      </section>

      <DataPersonNote>
        <ul className="rs-plainlist">
          <li><b>Viewing on F64 and above:</b> users with a Microsoft Fabric free licence and a viewer role can view Power BI content. Below F64, each viewer needs Pro, PPU or an individual trial (<a href="https://learn.microsoft.com/en-us/fabric/enterprise/licenses" rel="noopener noreferrer" target="_blank">Microsoft Learn: Fabric licences and capacity</a>).</li>
          <li><b>Creating and sharing:</b> creating Power BI items outside My workspace needs Pro or PPU on every option, including capacity.</li>
          <li><b>PPU is not capacity:</b> it does not provision Fabric, so lakehouses, warehouses and notebooks need an F capacity.</li>
          <li><b>Refresh limits:</b> 8 scheduled refreshes a day on shared capacity, 48 on PPU, Premium or Fabric (<a href="https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-data" rel="noopener noreferrer" target="_blank">Microsoft Learn: data refresh</a>).</li>
          <li><b>P SKUs are being retired</b> in favour of F SKUs; F64 matches the old P1 in capacity units.</li>
          <li><b>F SKUs bill per second</b> with a one-minute minimum and can be paused; a yearly reservation is cheaper if it runs all month. Throttling on a busy capacity is the hidden cost: size for peak refresh and query load, not the average.</li>
          <li><b>Prices:</b> <a href="https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing" rel="noopener noreferrer" target="_blank">Microsoft Power BI pricing</a>, checked {AS_OF}.</li>
        </ul>
      </DataPersonNote>

      <ToolActions getText={text} copyLabel="Copy the comparison" onReset={reset} resetLabel="Restore the defaults" confirmText="Replace your figures with the defaults?" />
    </div>
  );
}
