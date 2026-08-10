import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy | The Bredge",
  description: "How The Bredge handles the information you share — contact submissions, scheduling, and privacy-friendly analytics with consent.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="article section-wrap">
        <p className="eyebrow">PRIVACY</p>
        <h1>What we collect, and why.</h1>
        <p className="article-lede">Plain-English summary of the information this website handles. We keep it to what we need to reply to you and to understand, in aggregate, how the site is used.</p>
        <div className="article-body">
          <h2>When you contact us</h2>
          <p>If you submit the contact form, we collect the details you provide — your name, email, company, phone number, the areas you selected, your message and any timeline. This is used solely to respond to your enquiry.</p>
          <p>Submissions are validated and checked for spam (a hidden honeypot field, a minimum-interaction timing check, and Cloudflare Turnstile where enabled) before being stored in a private Google Sheet and emailed to the Bredge team. We do not sell this information or use it for advertising.</p>

          <h2>When you book a call</h2>
          <p>Scheduling is handled by Cal.com through an embedded booking page. Details you enter there (name, email and any information you add) are processed by Cal.com to arrange the meeting, subject to Cal.com’s own privacy terms.</p>

          <h2>Analytics — only with your consent</h2>
          <p>We use privacy-friendly analytics to understand, in aggregate, how the site is used. Analytics only loads after you choose “Accept analytics”; if you reject, no analytics scripts run and the site works exactly the same. Where configured, we use Google Analytics 4 and Microsoft Clarity (which provides anonymised session and heatmap insights).</p>
          <p>We never send your contact details to analytics. Event data is limited to non-identifying context such as page path, device group and traffic source. The entire contact form region is explicitly masked from session recording.</p>

          <h2>Cookies and storage</h2>
          <p>We store your analytics choice in your browser so we don’t ask again. Analytics tools set their own cookies only after consent. The one-time intro animation uses temporary per-session storage.</p>

          <h2>Your choices</h2>
          <p>You can change your analytics choice at any time by clearing this site’s storage in your browser. To ask what information we hold about an enquiry, or to have it removed, email <a href="mailto:hello@thebredge.com">hello@thebredge.com</a>.</p>

          <p>This page describes our current practices and will be updated as the site changes. It is a plain-language summary, not a legal contract, and we don’t claim certifications we don’t hold.</p>
        </div>
      </article>
    </PageShell>
  );
}
