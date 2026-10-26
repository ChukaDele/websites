import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children, dark = false, overlay = false }: { children: ReactNode; /** Dark hero at the top: overlay nav in light text. */ dark?: boolean; /** Light hero at the top: overlay nav in dark text. */ overlay?: boolean }) {
  return (
    <main className="subpage">
      {dark ? <SiteHeader variant="overlay" tone="dark" /> : <SiteHeader variant={overlay ? "overlay" : "solid"} />}
      {children}
      <SiteFooter />
    </main>
  );
}

/** BreadcrumbList structured data only — the visible trail is intentionally NOT
 *  rendered (it duplicated the page H1 and added template clutter). SEO keeps
 *  the schema; the page stays clean. */
export function Breadcrumbs({ trail }: { trail: Array<[string, string]> }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, url], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `https://thebredge.com${url}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
