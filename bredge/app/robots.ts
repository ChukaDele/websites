import type { MetadataRoute } from "next";

// Allow all normal crawlers (incl. AI search bots) to read public content.
// Only non-public technical routes are disallowed. CSS/JS/media stay crawlable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/api/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/api/"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/api/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: "https://thebredge.com/sitemap.xml",
    host: "https://thebredge.com",
  };
}
