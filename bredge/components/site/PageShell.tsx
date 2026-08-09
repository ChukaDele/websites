import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="subpage">
      <SiteHeader variant="solid" />
      {children}
      <SiteFooter />
    </main>
  );
}

/** Small breadcrumb row with schema.org BreadcrumbList JSON-LD. */
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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {trail.map(([name, url], i) => (
          <span key={url} style={{ display: "contents" }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {i < trail.length - 1 ? <a href={url}>{name}</a> : <span style={{ opacity: 1, color: "var(--ink)" }}>{name}</span>}
          </span>
        ))}
      </nav>
    </>
  );
}
