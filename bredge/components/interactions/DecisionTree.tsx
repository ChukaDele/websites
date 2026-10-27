/**
 * /services: how one business question travels through the stack, from
 * sources to a decision. Compact horizontal track (wraps to a vertical list on
 * small screens). Server component; styles in app/services.css (`sv-dt`).
 */

const stages: Array<[string, string]> = [
  ["Sources", "Product, billing, CRM and finance each have their own version of the month."],
  ["Reconcile", "Explain the differences instead of picking the number that looks right."],
  ["Model", "One shared model the whole business can query."],
  ["Analyse", "Segment and compare until the fall has an explanation."],
  ["Report", "The answer in one place, not a Monday-morning rebuild."],
  ["Decide", "One figure everyone in the room can trace to source."],
];

export function DecisionTree() {
  return (
    <div className="sv-dt">
      <div className="sv-dt-q">
        <span>The business question</span>
        <b>“Why did gross margin fall this month?”</b>
      </div>
      <ol className="sv-dt-track">
        {stages.map(([h, p], i) => (
          <li key={h} style={{ ["--i" as string]: i }}>
            <span className="sv-dt-dot" aria-hidden="true" />
            <b>{h}</b>
            <p>{p}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
