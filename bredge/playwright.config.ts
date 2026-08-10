import { defineConfig } from "@playwright/test";

/**
 * Responsive-motion regression suite (Part 7).
 *
 * Method note — read before editing the matrix.
 * Browser page-zoom changes the CSS *layout* viewport: zooming OUT to 80% on a
 * 1440x900 window gives the page a 1800x1125 CSS viewport (window / zoom). That
 * enlarged CSS viewport is the exact mechanism behind the owner-reported overlap
 * bugs (vw-scaled type grows, fixed-px scenes desync). We therefore emulate zoom
 * by setting the *equivalent CSS viewport size* a given (window, zoom) produces —
 * the faithful layout consequence — NOT via CSS `zoom`/`transform:scale`, which
 * the responsive-motion-systems doctrine bans as a fake substitute. This suite is
 * the deterministic layout gate; true native-zoom rasterisation spot-checks are a
 * headed-Chrome / Chrome-DevTools-MCP job, not this file's.
 *
 * Reference window for the zoom band: 1440x900.
 */
const REF_W = 1440;
const REF_H = 900;
const zoom = (z: number) => ({ width: Math.round(REF_W / z), height: Math.round(REF_H / z) });

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "tests/e2e/report" }]],
  use: {
    baseURL: process.env.BREDGE_URL ?? "https://thebredge.com",
    ignoreHTTPSErrors: false,
    screenshot: "off",
  },
  projects: [
    // Zoom-OUT band (enlarged CSS viewport — where overlaps appear). z80 is the
    // owner's exact reported condition.
    { name: "z67", use: { viewport: zoom(0.67) } },
    { name: "z80", use: { viewport: zoom(0.80) } },
    { name: "z90", use: { viewport: zoom(0.90) } },
    // Native 100%.
    { name: "z100", use: { viewport: zoom(1.0) } },
    // Zoom-IN band (shrunken CSS viewport — cramping, not overlap).
    { name: "z110", use: { viewport: zoom(1.10) } },
    { name: "z125", use: { viewport: zoom(1.25) } },
    // Capability edges that must switch the Reference Work OUT of enhanced mode.
    { name: "short-desktop", use: { viewport: { width: 1440, height: 680 } } },
    // Chromium-only install → emulate touch sizes on chromium (isMobile is a
    // chromium capability) rather than pulling WebKit; layout geometry is the gate.
    { name: "tablet", use: { viewport: { width: 834, height: 1112 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 } },
  ],
});
