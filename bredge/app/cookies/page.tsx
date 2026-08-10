import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";
import { CookieSettings } from "../../components/site/CookieSettings";

export const metadata: Metadata = pageMetadata({
  title: "Cookies | The Bredge",
  description: "How The Bredge uses cookies and browser storage, and how to change your analytics choice.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <PageShell>
      <article className="article section-wrap">
        <p className="eyebrow">COOKIES</p>
        <h1>Cookies &amp; browser storage.</h1>
        <p className="article-lede">We keep this deliberately minimal. Nothing that tracks you loads unless you accept analytics.</p>
        <div className="article-body">
          <h2>Essential storage</h2>
          <p>We store your analytics choice in your browser so we don’t ask again, and use temporary per-session storage for the one-time intro animation. These are necessary for the site to behave correctly and are not used to track you.</p>

          <h2>Analytics — only after you accept</h2>
          <p>If you accept analytics, we load Google Analytics 4 and Microsoft Clarity (where configured), which set their own cookies to measure, in aggregate, how the site is used. If you reject, none of these load and no analytics cookies are set. You can change your mind at any time:</p>
          <p><CookieSettings /></p>

          <h2>Scheduling</h2>
          <p>The scheduling page embeds Cal.com, which may set cookies necessary for booking. That happens on the schedule page only.</p>

          <p><strong>Being finalised:</strong> a full itemised cookie table (names, providers, durations) will be published once analytics IDs are configured and durations confirmed. We won’t list cookies we don’t actually set.</p>
        </div>
      </article>
    </PageShell>
  );
}
