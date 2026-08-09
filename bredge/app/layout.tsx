import type { Metadata } from "next";
import "@fontsource-variable/instrument-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import "./pages.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thebredge.com"),
  title: "The Bredge | Data Engineering, Analytics & BI Partner",
  description: "The Bredge is a UK & US data engineering, analytics and business intelligence partner. We build reliable data foundations, reporting automation and AI-ready data systems for growing and mid-market companies.",
  keywords: ["data engineering", "data analytics", "business intelligence", "BI consulting", "Power BI", "reporting automation", "data quality", "data governance", "data operations", "embedded data team", "fractional data team", "AI-ready data foundations", "UK data partner", "US data partner"],
  alternates: { canonical: "/" },
  openGraph: { title: "The Bredge | Data Engineering, Analytics & BI Partner", description: "UK & US data engineering, analytics and AI-ready data foundations for growing and mid-market companies.", type: "website", url: "/", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Bredge data systems for decisions people can trust" }] },
  twitter: { card: "summary_large_image", title: "The Bredge", description: "UK & US data systems for decisions people can trust.", images: ["/og.png"] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "The Bredge",
  url: "https://thebredge.com",
  logo: "https://thebredge.com/brand/bredge-logo.svg",
  image: "https://thebredge.com/og.png",
  description: "The Bredge is a UK & US data engineering, analytics and business intelligence partner. Growing and mid-market companies plug in a senior data team without hiring one; established companies bring us defined projects or plug in an embedded, fractional data team.",
  email: "hello@thebredge.com",
  areaServed: ["United Kingdom", "United States"],
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
