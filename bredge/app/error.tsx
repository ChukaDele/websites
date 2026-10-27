"use client";

import { useEffect } from "react";
import { SiteHeader } from "../components/site/SiteHeader";
import { LostScene } from "../components/site/LostScene";

/** Route-level error boundary: the same scene as the 404, with a retry. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Styles load only when this screen shows, so every other page skips them.
  useEffect(() => { void import("./secondary.css"); }, []);
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="subpage is-dark-top">
      <SiteHeader variant="overlay" tone="dark" />
      <LostScene
        code="500"
        eyebrow="500 · A JOB FAILED UPSTREAM"
        title="Something broke between the source and"
        accent="your screen."
        lede="Not your fault, ours. A step in the pipeline fell over and we’ve logged it. Try again: most failures, like most dashboards, recover on refresh."
        actions={<>
          <button type="button" className="button" onClick={() => reset()}>Try again <span className="arrow" aria-hidden="true">↻</span></button>
          <a className="text-link" href="/">Back to the homepage <span className="arrow" aria-hidden="true">↗</span></a>
        </>}
      >
        {error.digest && <p className="ls-digest">Reference for our logs: <code>{error.digest}</code></p>}
      </LostScene>
    </main>
  );
}
