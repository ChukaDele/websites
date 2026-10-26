import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "../../components/site/PageShell";
import { ResearchBriefs } from "../../components/work/ResearchBriefs";
import { ARTICLES } from "../../components/research/registry";
import { pageMetadata } from "../../lib/seo";
import "../research.css";
import { Picture } from "../../components/site/Picture";

/** Card art per series (Higgsfield renders, 16:9). */
const ART: Record<string, string> = { inflation: "/research/inflation.jpg", diet: "/research/diet.jpg", petrol: "/research/petrol.jpg" };
const artFor = (slug: string) => ART[Object.keys(ART).find((k) => slug.includes(k)) ?? ""];

export const metadata: Metadata = pageMetadata({
  title: "Nigeria Data Briefs: Inflation, Food & Fuel Prices | The Bredge Research",
  description: "Monthly analysis of Nigeria's official statistics: inflation, the cost of a healthy diet and petrol prices, checked and explained for business leaders and investors.",
  path: "/research",
});

export default function ResearchPage() {
  return (
    <PageShell>
      <section className="section-wrap rx-hero">
        <p className="eyebrow">RESEARCH</p>
        <h1>Nigeria&rsquo;s numbers, read for business.</h1>
        <p className="lede">A monthly series where we do to public data what we do for clients: take Nigeria&rsquo;s official releases on prices, food and fuel, recompute and check every figure, then explain what it means for the people running and investing in businesses there. Read the analysis, then try the numbers yourself.</p>
      </section>

      <ul className="rx-list section-wrap" aria-label="Latest analysis">
        {ARTICLES.map((a) => (
          <li key={a.slug}>
            <a className="rx-card" href={`/research/${a.slug}`}>
              <figure className="rx-media">
                {artFor(a.slug) && <Picture src={artFor(a.slug)} srcWidth={1344} sizes="(max-width: 900px) 100vw, 60vw" alt="" width={1344} height={752} />}
                <figcaption><strong>{a.hero.value}</strong><span>{a.hero.label}</span></figcaption>
              </figure>
              <small>{a.series} · {a.period}</small>
              <div><h2>{a.title}</h2><p>{a.dek}</p></div>
              <footer><span>{a.readingMinutes} min read</span><span className="rx-go" aria-hidden="true"><ArrowUpRight size={14} weight="bold" /></span></footer>
            </a>
          </li>
        ))}
      </ul>

      <ResearchBriefs />
    </PageShell>
  );
}
