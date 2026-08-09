import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { ContactForm } from "../../components/interactions/ContactForm";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Talk to The Bredge | Data Engineering & Analytics",
  description: "Tell us what isn’t working. You don’t need a finished spec — a few sentences about what your team is trying to achieve is enough to start a useful conversation.",
  path: "/contact",
});

const steps: Array<[string, string]> = [
  ["01", "We read the context."],
  ["02", "You speak with someone close to the work."],
  ["03", "We agree the useful next step."],
];

export default function ContactPage() {
  return (
    <PageShell>
      <div className="section-wrap contact-layout">
        <div className="contact-intro">
          <p className="eyebrow">CONTACT</p>
          <h1>Tell us what’s not working.</h1>
          <p className="lede">You don’t need a finished specification. Tell us what your team is trying to achieve and what isn’t working today — we’ll work out the useful next conversation from there.</p>
        </div>

        <ContactForm />

        <div className="contact-next">
          <p className="eyebrow">WHAT HAPPENS NEXT</p>
          {steps.map(([n, p]) => (
            <div className="next-step" key={n}><span>{n}</span><p>{p}</p></div>
          ))}
          <p className="next-note">If we’re not the right fit, we’ll say so.</p>
        </div>
      </div>
    </PageShell>
  );
}
