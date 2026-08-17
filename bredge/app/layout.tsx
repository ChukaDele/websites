import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/instrument-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import "./pages.css";
import "./qa-fixes.css";
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
    applicationName: "The Bredge",
    title: "The Bredge | Data Engineering, Analytics & BI Partner",
    description: "Data engineering, analytics and BI partner for growing and mid-market companies — reliable data foundations, reporting automation and AI-ready data systems.",
    alternates: { canonical: "/" },
    openGraph: { siteName: "The Bredge", title: "The Bredge | Data Engineering, Analytics & BI Partner", description: "Data engineering, analytics and AI-ready data foundations for growing and mid-market companies.", type: "website", url: "/", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Bredge data systems for decisions people can trust" }] },
    twitter: { card: "summary_large_image", title: "The Bredge", description: "Data systems for decisions people can trust.", images: ["/og.png"] },
    robots: isPreview ? { index: false, follow: false } : { index: true, follow: true },
    verification: verification ? { google: verification } : undefined,
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon-bredge-v3.svg", type: "image/svg+xml" },
        { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      shortcut: "/favicon-bredge-v3.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://thebredge.com/#organization",
      name: "The Bredge",
      legalName: "The Bredge, LLC",
      alternateName: ["Bredge"],
      url: "https://thebredge.com",
      logo: "https://thebredge.com/brand/bredge-logo.svg",
      image: "https://thebredge.com/og.png",
      email: "hello@thebredge.com",
      sameAs: ["https://www.linkedin.com/company/thebredge"],
      description: "The Bredge is a data engineering, analytics and business intelligence partner. We help growing and mid-market companies connect fragmented systems, build reliable data foundations, automate reporting and turn complex data into answers teams can act on.",
      knowsAbout: ["Data engineering", "Data analytics", "Business intelligence", "Data quality", "Data governance", "Reporting automation", "Data reconciliation", "Power BI", "PostgreSQL", "Python", "SQL"],
      makesOffer: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Embedded Data Team", description: "An ongoing senior data capability across engineering, analytics and BI for companies that need consistent progress without hiring every role internally." } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Data Projects", description: "Defined-scope delivery of data pipelines, warehouses, models, BI, reporting, reconciliation and automation." } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Data Diagnostic", description: "A mapped assessment of the current data environment that prioritises the changes most likely to improve decision-making." } },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://thebredge.com/#website",
      url: "https://thebredge.com",
      name: "The Bredge",
      alternateName: ["Bredge", "thebredge.com"],
      publisher: { "@id": "https://thebredge.com/#organization" },
    },
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
        <meta name="theme-color" content="#142321" />
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
