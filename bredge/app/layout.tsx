import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thebredge.com"),
  title: "The Bredge | Data Engineering, Analytics & BI Partner",
  description: "The Bredge is a global data engineering, analytics and business intelligence partner. We build reliable data foundations, reporting automation and AI-ready data systems for growing companies.",
  keywords: ["data engineering", "data analytics", "business intelligence", "BI consulting", "Power BI", "reporting automation", "data quality", "data governance", "data operations", "embedded data team", "fractional data team", "AI-ready data foundations", "global data partner"],
  alternates: { canonical: "/" },
  openGraph: { title: "The Bredge | Data Engineering, Analytics & BI Partner", description: "Global data engineering, analytics and AI-ready data foundations for growing companies.", type: "website", url: "/", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Bredge data systems for decisions people can trust" }] },
  twitter: { card: "summary_large_image", title: "The Bredge", description: "Global data systems for decisions people can trust.", images: ["/og.png"] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
