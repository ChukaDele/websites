import { test, expect, Page } from "@playwright/test";

/**
 * Regression guard for the responsive-motion P0 (commit 2e65994):
 *   1. Reference Work + Invisible-90% overlap at ~80% zoom.
 *   2. IQ headline colliding with the SQL terminal at ~80% zoom.
 * See docs/major-skill-patches/responsive-motion-systems/POSTMORTEM.md.
 *
 * Assertions are geometric invariants (deterministic, flake-free). Screenshots
 * are captured as review artefacts only — not pixel baselines — because the
 * target is a live production URL.
 */

type Box = { x: number; y: number; w: number; h: number; visible: boolean; position: string } | null;

async function box(page: Page, selector: string, nth = 0): Promise<Box> {
  return page.evaluate(
    ([sel, i]) => {
      const el = document.querySelectorAll(sel as string)[i as number] as HTMLElement | undefined;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const visible = cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0;
      return { x: r.x, y: r.y, w: r.width, h: r.height, visible, position: cs.position };
    },
    [selector, nth] as const,
  );
}

/** Two boxes share a row when their vertical spans overlap by a real margin. */
function sameRow(a: NonNullable<Box>, b: NonNullable<Box>): boolean {
  const overlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return overlap > 12;
}

async function ready(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => (document as any).fonts?.ready).catch(() => {});
  // Let the client scene controllers hydrate and run their first measure.
  await page.waitForTimeout(600);
}

test.describe("responsive-motion invariants", () => {
  test.beforeEach(async ({ page }) => ready(page));

  test("no horizontal overflow anywhere on the page", async ({ page }) => {
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth - de.clientWidth;
    });
    // ≤2px tolerates sub-pixel rounding; a real overlap/overrun is far larger.
    expect(overflow, "document.scrollWidth should not exceed the viewport").toBeLessThanOrEqual(2);
  });

  test("exactly three WORK cards and no card is its own sticky owner", async ({ page }) => {
    const positions = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".reference-case")).map((el) => getComputedStyle(el as HTMLElement).position),
    );
    expect(positions.length, "three reference-case cards render").toBe(3);
    // The single-owner contract: the stage (.reference-sticky) may be sticky,
    // never the individual cards. This is the exact bug that caused the overlap.
    for (const p of positions) expect(p, "a .reference-case must never be position:sticky").not.toBe("sticky");
  });

  test("Reference Work enhances only when the viewport can host the scene", async ({ page }) => {
    const { enhanced, w, h, stickyOwners } = await page.evaluate(() => {
      const stage = document.querySelector(".reference-work");
      const stickyOwners = Array.from(stage?.querySelectorAll("*") ?? []).filter(
        (el) => getComputedStyle(el as HTMLElement).position === "sticky",
      ).length;
      return { enhanced: !!stage?.classList.contains("rw-enhanced"), w: window.innerWidth, h: window.innerHeight, stickyOwners };
    });
    const shouldEnhance = w >= 1001 && h >= 720;
    expect(enhanced, `enhanced=${enhanced} for ${w}x${h} (expected ${shouldEnhance})`).toBe(shouldEnhance);
    // Never more than ONE sticky owner inside the region.
    expect(stickyOwners, "at most one sticky owner in Reference Work").toBeLessThanOrEqual(1);
    if (shouldEnhance) expect(stickyOwners, "the enhanced stage owns the viewport via exactly one sticky element").toBe(1);
  });

  test("IQ headline never overlaps the SQL terminal", async ({ page }) => {
    // Bring the Invisible-90% section into layout.
    await page.evaluate(() => document.querySelector(".iq")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(300);

    const headline = await box(page, ".iq-side h2");
    const terminal = await box(page, ".iq-editor");

    // On mobile/tablet the desktop editor is replaced by .iq-mobile; skip when
    // the terminal is not part of the laid-out desktop composition.
    test.skip(!headline?.visible || !terminal?.visible, "desktop IQ composition not shown at this size");

    if (sameRow(headline!, terminal!)) {
      // Side-by-side: the headline's right edge must clear the terminal's left edge.
      expect(
        Math.round(headline!.x + headline!.w),
        `headline right (${Math.round(headline!.x + headline!.w)}) must clear terminal left (${Math.round(terminal!.x)})`,
      ).toBeLessThanOrEqual(Math.round(terminal!.x) + 1);
    }
    // If stacked (not same row) there is nothing to collide — pass.
  });

  test("/__build parity endpoint is reachable", async ({ page }) => {
    const res = await page.request.get("/__build");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("sha");
    expect(json.worker).toBe("bredge");
  });

  test("capture review screenshots (artefact, not a baseline)", async ({ page }, testInfo) => {
    await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-top.png`) });
    await testInfo.attach(`${testInfo.project.name}-top`, {
      path: testInfo.outputPath(`${testInfo.project.name}-top.png`),
      contentType: "image/png",
    });
    await page.evaluate(() => document.querySelector(".iq")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-iq.png`) });
    await testInfo.attach(`${testInfo.project.name}-iq`, {
      path: testInfo.outputPath(`${testInfo.project.name}-iq.png`),
      contentType: "image/png",
    });
  });
});
