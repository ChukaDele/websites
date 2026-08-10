import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Before You Build a Data Warehouse | The Bredge",
  description: "The questions to answer before building a data warehouse — do you need one yet, requirements, architecture, and build versus managed.",
  path: "/insights/before-you-build-a-data-warehouse",
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Before you build a data warehouse, answer these questions",
  description: "The questions to answer before building a data warehouse — do you need one yet, requirements, architecture, and build versus managed.",
  author: { "@type": "Organization", name: "The Bredge" },
  publisher: { "@type": "Organization", name: "The Bredge" },
  mainEntityOfPage: "https://thebredge.com/insights/before-you-build-a-data-warehouse",
  articleSection: "Data engineering",
};

export default function Article() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="article section-wrap">
        <p className="eyebrow">INSIGHTS · ARCHITECTURE</p>
        <h1>Before you build a data warehouse, answer these questions.</h1>
        <p className="article-lede">Before you build a data warehouse, the useful question is not &ldquo;which warehouse?&rdquo; but &ldquo;do we need one yet, and what will it be for?&rdquo; A warehouse earns its keep when data is spread across several systems, when questions routinely span those systems, and when spreadsheets and direct connections can no longer keep up. If your reporting still comes from one or two tools, a warehouse is probably premature — and building one early tends to produce impressive plumbing that answers no one&rsquo;s question.</p>
        <div className="article-body">
          <h2>Do you actually need a warehouse yet?</h2>
          <p>A data warehouse is a central place that consolidates data from many sources so it can be modelled and analysed together. It is worth building when:</p>
          <ul>
            <li>Your data lives in several systems — a CRM, a billing platform, a product database, a finance tool — and real questions require joining them.</li>
            <li>Reporting directly against production systems is slowing them down, or you are being rate-limited by source-system APIs.</li>
            <li>Definitions and history need to live somewhere stable, independent of any one operational tool.</li>
            <li>The volume or complexity of transformations has outgrown what a spreadsheet or a single BI tool can maintain.</li>
          </ul>
          <p>If none of these are true yet — one core system, modest volume, a handful of reports — a well-structured BI tool connected directly to your source, or a lightweight managed pipeline into a simple database, will serve you better and cost far less to run.</p>

          <h2>Answer these questions first</h2>
          <p>The scope, cost and shape of a warehouse are decided by requirements, not by the technology. Establish these before anyone provisions anything:</p>
          <ul>
            <li><strong>What decisions must this support?</strong> Name them. A warehouse with no decisions attached is a museum.</li>
            <li><strong>Which sources feed it, and how do they identify the same entities?</strong> Identity across systems is the hardest part, and it does not solve itself.</li>
            <li><strong>What freshness is required?</strong> Daily is cheap and simple; near-real-time is a different and more expensive system. Do not pay for real-time to serve a monthly board pack.</li>
            <li><strong>Who owns definitions?</strong> Where does &ldquo;active customer&rdquo; or &ldquo;gross margin&rdquo; live, and who arbitrates when teams disagree?</li>
            <li><strong>Who will operate it after launch?</strong> A warehouse is a system to run, not a project to finish.</li>
            <li><strong>What does history need to look like?</strong> Do you need to reconstruct what a figure was on a past date, or only see the current state?</li>
          </ul>
          <p>If you cannot answer the first two clearly, you are not ready to build — you are ready to do discovery.</p>

          <h2>Architecture for a growing company</h2>
          <p>Most growing companies do not need an elaborate architecture. A sound, boring shape works: managed extract-and-load into a cloud warehouse, a modelling layer that turns raw source tables into clean, tested datasets (staging models close to the source, then business-level models with a clearly stated grain), a semantic layer where metrics are defined once, and a BI tool on top. Incremental models keep cost down as volume grows, by processing only new or changed data rather than rebuilding everything nightly.</p>
          <p>Resist the urge to design for a scale you do not have. The cost of an over-built platform is not only money; it is the ongoing operational burden of a system more complicated than the problem it serves.</p>

          <h2>Build versus managed</h2>
          <p>For almost every growing company, buy the commodity parts and build only what is specific to you. Ingestion is a solved problem — managed connectors move data from common sources reliably and are cheaper than the engineering time to hand-roll and maintain your own. Where your effort belongs is in modelling, definitions and the business logic no vendor can know: what your metrics mean and how your entities reconcile. Building custom pipelines for standard sources is where early data teams quietly lose a year.</p>

          <h2>When a warehouse is premature</h2>
          <p>It is too early if your data is effectively in one place, your questions do not cross systems, your volumes are small, and no one is waiting on answers. In that situation a warehouse adds cost, latency and a system to maintain while solving a problem you do not yet have. The right first move is often narrower: connect your BI tool directly, tidy your definitions, and revisit the warehouse when a real, cross-system question arrives — and keeps arriving.</p>

          <h2>Common mistakes</h2>
          <ul>
            <li>Choosing the technology before writing down the decisions it must support.</li>
            <li>Building custom ingestion for sources a managed connector already handles.</li>
            <li>Designing for real-time when the business needs yesterday&rsquo;s numbers, reliably.</li>
            <li>Ignoring identity resolution until the first cross-system join produces nonsense.</li>
            <li>Treating launch as the finish line, with no owner for operation or definitions.</li>
          </ul>

          <h2>A short way to decide</h2>
          <ul>
            <li>One system, small volume, no cross-system questions → not yet. Connect directly and revisit.</li>
            <li>Several systems, questions that span them, reporting straining under load → build, but scope it to the decisions.</li>
            <li>Requirements still vague → do discovery first; a warehouse built on unclear requirements is expensive to unpick.</li>
            <li>Tempted to build custom pipelines → buy the commodity parts; spend your effort on modelling and definitions.</li>
          </ul>

          <h2>When The Bredge is relevant</h2>
          <p>We are as happy to tell you not to build a warehouse yet as to build one. The value is in getting the requirements and the architecture right for the scale you are actually at — not the scale a vendor deck imagines. When a warehouse is the right move, we scope it to the decisions it has to support, and leave your team able to run it.</p>

          <p>When it is time, see our <a href="/services/data-projects">data warehouse projects</a>, or begin with <a href="/data-diagnostic">a Data Diagnostic</a> to pin down requirements before you build.</p>
        </div>
      </article>
    </PageShell>
  );
}
