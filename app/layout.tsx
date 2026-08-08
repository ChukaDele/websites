import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thebredge.com"),
  title: "The Bredge | Data Engineering, Analytics & BI Partner",
  description: "The Bredge helps growing companies build reliable data foundations, analytics, reporting and BI through embedded data teams and defined data projects.",
  alternates: { canonical: "/" },
  openGraph: { title: "The Bredge | Data Engineering, Analytics & BI Partner", description: "Reliable data foundations, analytics, reporting and BI for growing companies.", type: "website", url: "/", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Bredge data systems for decisions people can trust" }] },
  twitter: { card: "summary_large_image", title: "The Bredge", description: "Data systems for decisions people can trust.", images: ["/og.png"] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
