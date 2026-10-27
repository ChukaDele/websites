/* Hero visuals for the service pages. Server components, decorative mock-ups
   drawn in the clay palette (cream, lime, deep green). Each is labelled
   "Illustrative" so no example reads as a client claim. Styles: app/services.css. */
import { Check, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { DocThumb } from "./DocThumb";

/** Embedded Data Team: one shared backlog worked by every discipline. */
export function BacklogCard() {
  const items: Array<[string, string, "done" | "doing" | "next"]> = [
    ["Connect billing to the warehouse", "Engineering", "done"],
    ["Automate the weekly sales report", "BI", "doing"],
    ["Why did churn rise last quarter?", "Analytics", "doing"],
    ["Monitor the nightly refresh", "Data ops", "next"],
  ];
  return (
    <figure className="sv-mock" aria-label="Illustration: one shared backlog worked by engineering, analytics, BI and data operations">
      <div className="sv-mock-head"><span>Shared backlog</span><em>Illustrative</em></div>
      <ul className="sv-backlog" aria-hidden="true">
        {items.map(([t, skill, st]) => (
          <li key={t} className={`is-${st}`}>
            <i className="sv-backlog-st">{st === "done" && <Check size={10} weight="bold" />}</i>
            <span>{t}</span>
            <b>{skill}</b>
          </li>
        ))}
      </ul>
      <div className="sv-mock-foot" aria-hidden="true"><span>One team</span><span>One fixed monthly fee</span></div>
    </figure>
  );
}

/** Data Projects: a scope card with acceptance criteria and a locked price. */
export function ScopeCard() {
  return (
    <figure className="sv-mock" aria-label="Illustration: a project scope with acceptance criteria, a fixed price and milestones">
      <div className="sv-mock-head"><span>Project scope</span><em>Illustrative</em></div>
      <div className="sv-scope" aria-hidden="true">
        <p className="sv-scope-q">“Finance and CRM revenue don’t agree.”</p>
        <p className="sv-k">Done means</p>
        <ul>
          <li><Check size={11} weight="bold" />One revenue definition, signed off</li>
          <li><Check size={11} weight="bold" />Reconciled to source every month</li>
          <li><Check size={11} weight="bold" />Board report refreshes on its own</li>
        </ul>
        <div className="sv-scope-price"><LockSimple size={16} weight="fill" /><span><b>Fixed price</b>Agreed in writing before work starts</span></div>
        <div className="sv-scope-ms"><i className="on" /><i /><i /><span>Milestones</span></div>
      </div>
    </figure>
  );
}

/** Data Diagnostic: the documents you leave with, fanned out. */
export function DocFan() {
  return (
    <figure className="sv-fan" aria-label="Illustration: the findings report, ranked fix list and roadmap you receive">
      <DocThumb kind="report" title="Findings report" className="f1" />
      <DocThumb kind="list" title="Ranked fix list" className="f2" />
      <DocThumb kind="roadmap" title="Roadmap" className="f3" />
      <figcaption>Yours to keep</figcaption>
    </figure>
  );
}
