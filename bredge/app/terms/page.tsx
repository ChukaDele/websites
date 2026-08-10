import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms | The Bredge",
  description: "Terms of use for The Bredge website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell>
      <article className="article section-wrap">
        <p className="eyebrow">TERMS</p>
        <h1>Terms of use.</h1>
        <p className="article-lede">Provisional. This page will be completed with verified legal details before launch — we won’t publish placeholders dressed as fact.</p>
        <div className="article-body">
          <h2>Using this site</h2>
          <p>This website presents information about The Bredge’s services. The content is provided in good faith for general information; it isn’t a contract or an offer, and engagements are governed by the specific agreement signed for that work.</p>

          <h2>Contact and scheduling</h2>
          <p>When you contact us or book a call, you’re asking us to get in touch — see our <a href="/privacy">Privacy</a> and <a href="/cookies">Cookies</a> pages for how that information is handled.</p>

          <h2>Still to confirm before launch</h2>
          <p>The following require verified input from The Bredge and are intentionally left blank rather than invented:</p>
          <ul>
            <li>Registered legal entity name and company registration number</li>
            <li>Registered address</li>
            <li>Governing law and jurisdiction</li>
            <li>Data retention periods</li>
            <li>Any limitation-of-liability and IP clauses the business wants stated</li>
          </ul>
          <p>Once provided, this page and the Privacy page will be updated to reflect them accurately.</p>
        </div>
      </article>
    </PageShell>
  );
}
