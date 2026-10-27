import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { LegalPage } from "../../components/legal/LegalPage";
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
      <LegalPage
        label="Cookies"
        path="/cookies"
        title="Cookies & browser storage."
        dek="We keep this deliberately minimal. Nothing that tracks you loads unless you accept analytics."
        summary={[
          "Essential storage remembers your analytics choice and the one-time intro animation, and is not used to track you.",
          "Google Analytics 4 and Microsoft Clarity (where configured) load only if you accept analytics.",
          "Cal.com may set cookies necessary for booking, on the schedule page only.",
          "You can change your analytics choice at any time with the Cookie settings button on this page.",
        ]}
        sections={[
          {
            id: "essential",
            heading: "Essential storage",
            body: <p>We store your analytics choice in your browser so we don’t ask again, and use temporary per-session storage for the one-time intro animation. These are necessary for the site to behave correctly and are not used to track you.</p>,
          },
          {
            id: "analytics",
            heading: "Analytics — only after you accept",
            body: (
              <>
                <p>If you accept analytics, we load Google Analytics 4 and Microsoft Clarity (where configured), which set their own cookies to measure, in aggregate, how the site is used. If you reject, none of these load and no analytics cookies are set. You can change your mind at any time:</p>
                <div className="lg-control">
                  <div>
                    <strong>Your analytics choice</strong>
                    <span>Opens the consent bar again so you can accept or reject.</span>
                  </div>
                  <CookieSettings className="lg-control-btn" />
                </div>
              </>
            ),
          },
          {
            id: "scheduling",
            heading: "Scheduling",
            body: <p>The scheduling page embeds Cal.com, which may set cookies necessary for booking. That happens on the schedule page only.</p>,
          },
        ]}
        footnote={<p><strong>Being finalised:</strong> a full itemised cookie table (names, providers, durations) will be published once analytics IDs are configured and durations confirmed. We won’t list cookies we don’t actually set.</p>}
      />
    </PageShell>
  );
}
