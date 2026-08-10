import type { Metadata } from "next";

const SITE = "The Bredge";

/** schema.org Service JSON-LD for a service page. Truthful fields only. */
export function serviceJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    provider: { "@type": "Organization", name: SITE, url: "https://thebredge.com" },
    url: `https://thebredge.com${path}`,
  };
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = path === "/" ? "/" : path;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: SITE,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE} — data systems for decisions people can trust` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}
