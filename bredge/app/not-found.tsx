import { PageShell } from "../components/site/PageShell";
import { NotFoundField } from "../components/interactions/NotFoundField";

export default function NotFound() {
  return (
    <PageShell>
      <section className="section-wrap nf-layout">
        <div className="nf-copy">
          <p className="eyebrow">LOOKUP ERROR · 404</p>
          <h1>We couldn’t reconcile this one.</h1>
          <p className="lede">The page you’re looking for isn’t in the model.</p>
          <div className="hero-cta-row">
            <a className="button" href="/">Back to a reliable source <span className="arrow" aria-hidden="true">↗</span></a>
            <a className="text-link" href="/schedule">Schedule a call <span className="arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
        <NotFoundField />
      </section>
    </PageShell>
  );
}
