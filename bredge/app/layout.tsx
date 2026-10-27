import type { Metadata, Viewport } from "next";
import "@fontsource-variable/instrument-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import "./pages.css";
// Area stylesheets (pipeline, research, insights, resources, services, contact,
// legal, portfolio/*) are imported by the routes or components that use them,
// so each page only downloads its own CSS. Their selectors are area-scoped
// (.pl-, .ra-, .in-, .rs-, .sv-, .ct-/.contact-, .lg-, .pc-), so loading them
// after qa-fixes.css does not change the cascade.
import "./qa-fixes.css";
// The body face (Latin subset) is needed for the first paint of every page, so it
// is preloaded; the same hashed file the @font-face rule above points at.
import instrumentSansLatin from "@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2?url";
import { Preloader } from "../components/site/Preloader";
import { PRELOADER_CSS, GATE_CSS } from "../components/site/preloader-critical-css";
import { Analytics } from "../components/site/Analytics";
import { Spotlight } from "../components/site/Spotlight";

// Runs before first paint so the preloader overlay is present on the very first
// frame. It plays each time the site is opened (a new tab or visit, or a reload),
// on whichever page the visitor lands, and not when they move between pages in
// the same tab. Skipped for reduced motion. Decided synchronously: no layout jump.
const preloadInit = `(function(){try{var n=performance.getEntriesByType('navigation')[0];var reload=n&&n.type==='reload';if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&(reload||!sessionStorage.getItem('bredge_opened'))){document.documentElement.classList.add('preload-active');}sessionStorage.setItem('bredge_opened','1');}catch(e){}setTimeout(function(){document.documentElement.classList.add('css-ready')},5000);})();`;

// Search and social descriptions deliberately summarise the visible homepage
// proposition. They do not introduce claims that a visitor cannot verify.
const siteDescription = "Data engineering, analytics and business intelligence for growing and mid-market companies. We connect your systems, reconcile your numbers, and build reporting your team can trust.";

// Every page is the same for every visitor, so pages are rendered once and
// served from the ISR cache, refreshed in the background at most hourly (a
// deploy starts a fresh cache). See vite.config.ts for the optional KV store.
export const revalidate = 3600;

// Metadata no longer reads the request host (that made every page dynamic and
// uncacheable). Preview hosts such as *.workers.dev are kept out of search by an
// `X-Robots-Tag: noindex, nofollow` header from worker/index.ts instead.
// Keywords meta intentionally removed (no ranking value).
export async function generateMetadata(): Promise<Metadata> {
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  return {
    metadataBase: new URL("https://thebredge.com"),
    applicationName: "The Bredge",
    title: "The Bredge | Data Engineering, Analytics & BI Partner",
    description: siteDescription,
    alternates: { canonical: "/" },
    openGraph: { siteName: "The Bredge", title: "The Bredge | Data Engineering, Analytics & BI Partner", description: siteDescription, type: "website", url: "/", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Bredge data systems for decisions people can trust" }] },
    twitter: { card: "summary_large_image", title: "The Bredge | Data Engineering, Analytics & BI Partner", description: siteDescription, images: ["/og.png"] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
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
      description: siteDescription,
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
      description: siteDescription,
      inLanguage: "en",
      publisher: { "@id": "https://thebredge.com/#organization" },
    },
  ],
};

const analyticsCfg = {
  ga4: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
  clarity: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "",
  gtm: process.env.NEXT_PUBLIC_GTM_ID || "",
};

// Phone baseline: paint under the notch (safe-area insets pad it back), the
// keyboard resizes the layout, and the browser chrome matches the page.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e9" },
    { media: "(prefers-color-scheme: dark)", color: "#142321" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/brand/bredge-logo-preloader.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href={instrumentSansLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: PRELOADER_CSS + GATE_CSS }} />
        <noscript><style dangerouslySetInnerHTML={{ __html: "html body{visibility:visible!important}" }} /></noscript>
        <script dangerouslySetInnerHTML={{ __html: preloadInit }} />
        <script dangerouslySetInnerHTML={{ __html: `window.__BREDGE_CFG=${JSON.stringify(analyticsCfg)};` }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Preloader />
        {children}
        <Analytics />
        <Spotlight />
      </body>
    </html>
  );
}
