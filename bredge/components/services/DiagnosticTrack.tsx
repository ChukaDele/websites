/* /data-diagnostic: the two weeks as a day-by-day track. Two lanes show who
   does what (your team's part is small), and the documents arrive at the end.
   Server component. Styles: app/services.css (`sv-dtrack`). On narrow screens
   the lanes give way to the phase list with a vertical rail. */
import { DocThumb } from "./DocThumb";

type Bar = { label: string; from: number; to: number };

/* Columns: 1 = before day 1, 2..11 = days 1..10.
   OWNER CONFIRM: ten working days and this day split (mirrors the timeline on app/data-diagnostic/page.tsx). */
const YOU: Bar[] = [
  { label: "Kick-off", from: 1, to: 1 },
  { label: "Short interviews", from: 2, to: 4 },
  { label: "Debrief", from: 11, to: 11 },
];
const US: Bar[] = [
  { label: "Map how data moves", from: 2, to: 4 },
  { label: "Test and reconcile", from: 5, to: 9 },
  { label: "Write up", from: 10, to: 11 },
];

export function DiagnosticTrack({ phases }: { phases: Array<[string, string, string]> }) {
  const days = ["Before", ...Array.from({ length: 10 }, (_, i) => `D${i + 1}`)];
  return (
    <div className="sv-dtrack">
      <div className="sv-dtrack-grid" aria-hidden="true">
        <span className="sv-lane-name" style={{ gridRow: 1 }} />
        {days.map((d, i) => <span key={d} className="sv-day" style={{ gridColumn: i + 2, gridRow: 1 }}>{d}</span>)}
        <span className="sv-lane-name" style={{ gridRow: 2 }}>Your team</span>
        {YOU.map((b) => <span key={b.label} className="sv-bar is-you" style={{ gridColumn: `${b.from + 1} / ${b.to + 2}`, gridRow: 2 }}>{b.label}</span>)}
        <span className="sv-lane-name" style={{ gridRow: 3 }}>The Bredge</span>
        {US.map((b) => <span key={b.label} className="sv-bar is-us" style={{ gridColumn: `${b.from + 1} / ${b.to + 2}`, gridRow: 3 }}>{b.label}</span>)}
        <span className="sv-dtrack-docs" style={{ gridColumn: "9 / 13", gridRow: 4 }}>
          <DocThumb kind="report" /><DocThumb kind="list" /><DocThumb kind="roadmap" />
          <em>Documents delivered</em>
        </span>
      </div>
      <ol className="sv-dtrack-phases">
        {phases.map(([when, h, p]) => (
          <li key={when}><span>{when}</span><b>{h}</b><p>{p}</p></li>
        ))}
      </ol>
    </div>
  );
}
