/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import buildInfo from "./build-info.json";
import { enforceContactRateLimit, type ContactRateLimitBinding } from "../lib/contact-rate-limit";

interface Env {
  ASSETS: Fetcher;
  CONTACT_RATE_LIMITER?: ContactRateLimitBinding;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

// --- Caching policy -------------------------------------------------------
// Hashed build output (/_next/static/*) and the un-hashed files in public/ are
// served by Workers Static Assets before this Worker runs; their Cache-Control
// comes from dist/client/_headers (vinext's immutable rule) and public/_headers.
// This Worker decides the policy for what it renders itself.
//
// HTML pages: no browser caching (max-age=0, so a deploy is visible on the next
// load), but a shared cache may hold a page for 5 minutes and serve it stale for
// up to an hour while it refetches. Pages are the same for every visitor (no
// cookies, no per-user content), so this is safe. Only applied to successful
// GET/HEAD HTML responses without Set-Cookie; /api/* is always no-store.
const HTML_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";
// robots.txt / sitemap.xml are rendered by routes but change rarely.
const METADATA_CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400";

function applyCachePolicy(headers: Headers, response: Response, request: Request, url: URL) {
  if (url.pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store");
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") return;
  if (response.status !== 200 || headers.has("set-cookie")) return;
  if (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml") {
    headers.set("Cache-Control", METADATA_CACHE_CONTROL);
    return;
  }
  const type = headers.get("content-type") || "";
  if (type.startsWith("text/html")) {
    headers.set("Cache-Control", HTML_CACHE_CONTROL);
    // Vary on what changes the HTML; RSC payloads for client-side navigation are
    // served at the same URL with an RSC request header, which vinext already
    // lists in Vary, so keep that and add Accept-Encoding for compressed copies.
    const vary = headers.get("vary");
    if (!vary || !/accept-encoding/i.test(vary)) headers.set("Vary", vary ? `${vary}, Accept-Encoding` : "Accept-Encoding");
  }
}

// Only the canonical site may be indexed. Preview and staging hosts
// (*.workers.dev, custom preview domains, localhost) get a noindex header, so a
// copy of the site can never compete with thebredge.com in search. Pages render
// the same HTML on every host, which is what lets them be cached and prerendered.
const PRODUCTION_HOSTS = new Set(["thebredge.com", "www.thebredge.com"]);

function withResponseHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  if (!PRODUCTION_HOSTS.has(new URL(request.url).hostname)) headers.set("X-Robots-Tag", "noindex, nofollow");
  applyCachePolicy(headers, response, request, new URL(request.url));
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Enforced now: only directives that cannot affect analytics, fonts or the
  // Cal.com iframe (it is framed BY us; frame-ancestors governs who frames us).
  // Blocks clickjacking in CSP-aware browsers, plugin content and <base> hijack.
  headers.set("Content-Security-Policy", "frame-ancestors 'self'; object-src 'none'; base-uri 'self'");

  // Start CSP in report-only mode. The site has third-party analytics and the
  // scheduling embed, so enforcement should only follow production observation.
  headers.set(
    "Content-Security-Policy-Report-Only",
    "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https:; frame-src https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Build fingerprint — source of truth for staging<->production parity.
    if (url.pathname === "/__build") {
      return withResponseHeaders(new Response(JSON.stringify(buildInfo), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store, must-revalidate",
          "x-robots-tag": "noindex, nofollow",
        },
      }), request);
    }

    // Protect submission before application code or the Sheets webhook runs.
    const rateLimitResponse = await enforceContactRateLimit(request, env.CONTACT_RATE_LIMITER);
    if (rateLimitResponse) return withResponseHeaders(rateLimitResponse, request);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return withResponseHeaders(response, request);
    }

    const response = await handler.fetch(request, env, ctx);
    return withResponseHeaders(response, request);
  },
};

export default worker;
