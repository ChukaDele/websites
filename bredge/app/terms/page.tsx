import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { LegalPage } from "../../components/legal/LegalPage";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms | The Bredge",
  description: "Terms of use for The Bredge website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PageShell>
      <LegalPage
        label="Terms"
        path="/terms"
        title="Terms of use."
        dek="Provisional. This page will be completed with verified legal details before launch — we won’t publish placeholders dressed as fact."
        summary={[
          "This site gives general information about The Bredge's services, in good faith.",
          "It is not a contract or an offer. Engagements are governed by the specific agreement signed for that work.",
          "How contact and booking information is handled is covered on the Privacy and Cookies pages.",
          "Some legal details are still to be confirmed and are left blank rather than invented.",
        ]}
        sections={[
          {
            id: "using-this-site",
            heading: "Using this site",
            body: <p>This website presents information about The Bredge’s services. The content is provided in good faith for general information; it isn’t a contract or an offer, and engagements are governed by the specific agreement signed for that work.</p>,
          },
          {
            id: "contact-scheduling",
            heading: "Contact and scheduling",
            body: <p>When you contact us or book a call, you’re asking us to get in touch — see our <a href="/privacy">Privacy</a> and <a href="/cookies">Cookies</a> pages for how that information is handled.</p>,
          },
          {
            id: "to-confirm",
            heading: "Still to confirm before launch",
            body: (
              <>
                <p>The following require verified input from The Bredge and are intentionally left blank rather than invented:</p>
                <ul>
                  <li>Registered legal entity name and company registration number</li>
                  <li>Registered address</li>
                  <li>Governing law and jurisdiction</li>
                  <li>Data retention periods</li>
                  <li>Any limitation-of-liability and IP clauses the business wants stated</li>
                </ul>
                <p>Once provided, this page and the Privacy page will be updated to reflect them accurately.</p>
              </>
            ),
          },
        ]}
      />
    </PageShell>
  );
}
