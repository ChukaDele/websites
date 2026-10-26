import "./secondary.css";
import type { Metadata } from "next";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { LostScene } from "../components/site/LostScene";
import { LostQuery } from "../components/site/LostQuery";

export const metadata: Metadata = { title: "Page not found | The Bredge", robots: { index: false } };

const LINKS = [
  { href: "/work", label: "Work", note: "Dashboards you can click through" },
  { href: "/insights", label: "Insights", note: "Fixes for the numbers that disagree" },
  { href: "/resources", label: "Resources", note: "Free tools that run in your browser" },
  { href: "/services", label: "Services", note: "Ways to hire us, no rate card required" },
];

export default function NotFound() {
  return (
    <main className="subpage is-dark-top">
      <SiteHeader variant="overlay" tone="dark" />
      <LostScene
        code="404"
        eyebrow="404 · ZERO ROWS RETURNED"
        title="This page didn’t make it through"
        accent="the pipeline."
        lede="We ran the query, checked the joins and asked finance. Whatever lived here was renamed, retired or never loaded. Unlike your month-end numbers, this one we can’t reconcile."
        links={LINKS}
        actions={<>
          <a className="button" href="/">Take me home <span className="arrow" aria-hidden="true">↗</span></a>
          <a className="text-link" href="/contact">Report a broken link <span className="arrow" aria-hidden="true">↗</span></a>
        </>}
      >
        <LostQuery />
      </LostScene>
      <SiteFooter />
    </main>
  );
}
