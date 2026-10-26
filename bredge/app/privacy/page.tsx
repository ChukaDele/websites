import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { LegalPage } from "../../components/legal/LegalPage";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy | The Bredge",
  description: "How The Bredge handles the information you share — contact submissions, scheduling, and privacy-friendly analytics with consent.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PageShell>
      <LegalPage
        label="Privacy"
        path="/privacy"
        title="What we collect, and why."
        dek="Plain-English summary of the information this website handles. We keep it to what we need to reply to you and to understand, in aggregate, how the site is used."
        summary={[
          "Contact form details are used only to respond to your enquiry, and are not sold or used for advertising.",
          "Call bookings are handled by Cal.com, under Cal.com's own privacy terms.",
          "Analytics only loads after you choose \"Accept analytics\", and never receives your contact details.",
          "You can ask what we hold about an enquiry, or have it removed, by email.",
        ]}
        sections={[
          {
            id: "contact-form",
            heading: "When you contact us",
            body: (
              <>
                <p>If you submit the contact form, we collect the details you provide — your name, email, company, phone number, the areas you selected, your message and any timeline. This is used solely to respond to your enquiry.</p>
                <p>Submissions are validated and checked for spam (a hidden honeypot field, a minimum-interaction timing check, and Cloudflare Turnstile where enabled) before being stored in a private Google Sheet and emailed to the Bredge team. We do not sell this information or use it for advertising.</p>
              </>
            ),
          },
          {
            id: "booking",
            heading: "When you book a call",
            body: <p>Scheduling is handled by Cal.com through an embedded booking page. Details you enter there (name, email and any information you add) are processed by Cal.com to arrange the meeting, subject to Cal.com’s own privacy terms.</p>,
          },
          {
            id: "analytics",
            heading: "Analytics — only with your consent",
            body: (
              <>
                <p>We use privacy-friendly analytics to understand, in aggregate, how the site is used. Analytics only loads after you choose “Accept analytics”; if you reject, no analytics scripts run and the site works exactly the same. Where configured, we use Google Analytics 4 and Microsoft Clarity (which provides anonymised session and heatmap insights).</p>
                <p>We never send your contact details to analytics. Event data is limited to non-identifying context such as page path, device group and traffic source. The entire contact form region is explicitly masked from session recording.</p>
              </>
            ),
          },
          {
            id: "cookies-storage",
            heading: "Cookies and storage",
            body: <p>We store your analytics choice in your browser so we don’t ask again. Analytics tools set their own cookies only after consent. The one-time intro animation uses temporary per-session storage.</p>,
          },
          {
            id: "choices",
            heading: "Your choices",
            body: <p>You can change your analytics choice at any time by clearing this site’s storage in your browser. To ask what information we hold about an enquiry, or to have it removed, email <a href="mailto:hello@thebredge.com">hello@thebredge.com</a>.</p>,
          },
        ]}
        footnote={<p>This page describes our current practices and will be updated as the site changes. It is a plain-language summary, not a legal contract, and we don’t claim certifications we don’t hold.</p>}
      />
    </PageShell>
  );
}
