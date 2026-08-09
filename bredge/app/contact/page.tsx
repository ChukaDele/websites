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
  ["01", "We read the context before replying."],
  ["02", "If it looks like something we can help with, you’ll speak with someone who understands the work — not an SDR qualification layer."],
  ["03", "We’ll decide together whether the next step is a diagnostic, a project conversation or something else."],
];

export default function ContactPage() {
  return (
    <PageShell>
      <div className="section-wrap contact-layout">
        <div className="contact-intro">
          <p className="eyebrow">CONTACT</p>
          <h1>Tell us what’s not working.</h1>
          <p className="lede">You don’t need a finished specification. Tell us what your team is trying to achieve, what isn’t working today and what you already know. We’ll work out the next useful conversation from there.</p>

          <div className="next-steps">
            <h2 className="eyebrow" style={{ marginBottom: 6 }}>WHAT HAPPENS NEXT</h2>
            {steps.map(([n, p]) => (
              <div className="next-step" key={n}><span>{n}</span><p>{p}</p></div>
            ))}
          </div>
          <p className="next-note">If we’re not the right fit, we’ll say so.</p>
        </div>

        <ContactForm />
      </div>
    </PageShell>
  );
}
