import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/instrument-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import "./pages.css";
import { Preloader } from "../components/site/Preloader";
import { Analytics } from "../components/site/Analytics";

// Runs before first paint: mark first-entry (this session, motion allowed) so the
// preloader overlay is present on the very first frame — no flash for returning
// visitors, and it decides synchronously so there's no layout jump.
const preloadInit = `(function(){try{if(!sessionStorage.getItem('bredge_preloaded')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('preload-active');}}catch(e){}})();`;

// Host-aware: the workers.dev preview host is noindexed so it can't compete with
// the canonical thebredge.com. Keywords meta intentionally removed (no ranking value).
export async function generateMetadata(): Promise<Metadata> {
  let host = "";
  try { host = (await headers()).get("host") || ""; } catch { host = ""; }
  const isPreview = host.endsWith(".workers.dev");
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  return {
    metadataBase: new URL("https://thebredge.com"),
    title: "The Bredge | Data Engineering, Analytics & BI Partner",
    description: "The Bredge is a data engineering, analytics and business intelligence partner. We build reliable data foundations, reporting automation and AI-ready data systems for growing and mid-market companies.",
    alternates: { canonical: "/" },
    openGraph: { title: "The Bredge | Data Engineering, Analytics & BI Partner", description: "Data engineering, analytics and AI-ready data foundations for growing and mid-market companies.", type: "website", url: "/", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Bredge data systems for decisions people can trust" }] },
    twitter: { card: "summary_large_image", title: "The Bredge", description: "Data systems for decisions people can trust.", images: ["/og.png"] },
    robots: isPreview ? { index: false, follow: false } : { index: true, follow: true },
    verification: verification ? { google: verification } : undefined,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "The Bredge",
  url: "https://thebredge.com",
  logo: "https://thebredge.com/brand/bredge-logo.svg",
  image: "https://thebredge.com/og.png",
  description: "The Bredge is a data engineering, analytics and business intelligence partner. Growing and mid-market companies plug in a senior data team without hiring one; established companies bring us defined projects or plug in an embedded, fractional data team.",
  email: "hello@thebredge.com",
  knowsAbout: ["Data engineering", "Data analytics", "Business intelligence", "Data quality", "Data governance", "Reporting automation", "Data reconciliation", "Power BI", "PostgreSQL", "Python", "SQL"],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Embedded Data Team", description: "An ongoing senior data capability across engineering, analytics and BI for companies that need consistent progress without hiring every role internally." } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Data Projects", description: "Defined-scope delivery of data pipelines, warehouses, models, BI, reporting, reconciliation and automation." } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Data Diagnostic", description: "A mapped assessment of the current data environment that prioritises the changes most likely to improve decision-making." } },
  ],
  audience: [
    { "@type": "Audience", audienceType: "Growing and mid-market organisations building a reliable data foundation" },
    { "@type": "Audience", audienceType: "Established teams adding specialist data capacity via projects or an embedded team" },
  ],
};

const analyticsCfg = {
  ga4: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
  clarity: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "",
  gtm: process.env.NEXT_PUBLIC_GTM_ID || "",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloadInit }} />
        <script dangerouslySetInnerHTML={{ __html: `window.__BREDGE_CFG=${JSON.stringify(analyticsCfg)};` }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Preloader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
