import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { DisciplineIntersections } from "../../components/interactions/DisciplineIntersections";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About The Bredge | Data Engineering & Analytics Partner",
  description: "The Bredge brings data engineering, analytics and business intelligence together around one idea: data is only valuable when someone can use it to make a better decision.",
  path: "/about",
});

const gaps: Array<[string, string]> = [
  ["A metric is technically correct but commercially meaningless.", "Right formula, wrong question."],
  ["A dashboard looks polished but sits on unreliable data.", "The last 10% hides the missing 90%."],
  ["A warehouse gets built without understanding what the business needs.", "Infrastructure ahead of the decision it should serve."],
];

const beliefs: Array<[string, string]> = [
  ["The dashboard isn’t the work.", "It’s usually the visible end of a much larger system."],
  ["Business context is technical context.", "Understanding revenue, customers, operations or product behaviour changes how the data should be modelled."],
  ["Complexity should earn its place.", "A more sophisticated architecture is not automatically a better one."],
  ["Reliability beats theatre.", "A simple answer your team can defend beats an impressive system nobody understands."],
  ["Good partners reduce dependency.", "We should leave your data environment clearer than we found it."],
];

export default function AboutPage() {
  return (
    <PageShell>
      <section className="section-wrap page-hero">
        <p className="eyebrow">ABOUT THE BREDGE</p>
        <h1>Technical enough to build it. Close enough to the business to know why it matters.</h1>
        <p className="lede">The Bredge brings together data engineering, analytics and business intelligence around a simple idea: data is only valuable when somebody can use it to make a better decision.</p>
        <p className="lede">We work with organisations that need stronger data capability without the layers, hand-offs and overhead that often come with traditional consulting.</p>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead">
            <h2>Too much data work falls into the gaps between disciplines.</h2>
            <p>Engineers build pipelines. Analysts investigate data. BI teams create reports. Business teams make decisions. The failure often happens between those steps — so we work across them.</p>
          </div>
          <DisciplineIntersections />
        </div>
      </section>

      <section className="section">
        <div className="section-wrap">
          <div className="section-lead"><h2>Where it usually breaks.</h2></div>
          <div className="ruled">
            {gaps.map(([h, p]) => (
              <div className="ruled-row" key={h}><span>—</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead"><h2>What we believe.</h2></div>
          <div className="ruled">
            {beliefs.map(([h, p], i) => (
              <div className="ruled-row" key={h}><span>{String(i + 1).padStart(2, "0")}</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Team profile section intentionally omitted until verified people are ready —
          no stock photos or invented bios. See NON-NEGOTIABLE TRUST RULES. */}

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead"><h2>UK and US engagements.</h2><p>The Bredge works with growing and mid-market organisations across the United Kingdom and United States, collaborating remotely with teams and stakeholders wherever the work sits. We don’t run a network of offices — you work directly with the people doing the work.</p></div>
        </div>
      </section>

      <section className="section-wrap callout">
        <div className="callout-inner">
          <div><h2>Bring us the complicated version.</h2><p>The messy, cross-system, nobody-owns-it problem is the one we like.</p></div>
          <div><a className="button" href="/contact">Start a conversation <span className="arrow" aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </PageShell>
  );
}
