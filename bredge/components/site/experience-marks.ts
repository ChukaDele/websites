/* Prior experience of individual Bredge team members — text marks, not a logo
 * wall (a logo wall would imply a commercial/endorsement relationship this
 * section deliberately does not claim). Display names are the exact approved
 * forms: no acronym+full-name duplication, no invented Ltd/Inc/LLC suffixes.
 * Trimmed from 16 to 8: sixteen names behind a legal disclaimer read as borrowed
 * credibility, eight recognisable ones read as an honest CV. Split BY WIDTH
 * across the two rows so, where the track still overflows, both reveal at a
 * comparable rate; where it doesn't, `.xp-row` drops its edge mask (see
 * `no-overflow` below) so a stationary first name is never clipped by the fade. */
export const ROW_A = ["TriWest Healthcare Alliance", "Sedgwick", "Moniepoint", "Nutrafol"];
export const ROW_B = ["University of Vermont", "Westinghouse", "Penn Foster", "Fullscript"];

export const DISCLAIMER = "Where our team worked before The Bredge.";

// Official logo files where we have them (public/logos); the rest show as
// text until their files arrive. Shown in one muted tone, not brand colour.
export const LOGOS: Record<string, { src: string; w: number; h: number }> = {
  Moniepoint: { src: "/logos/moniepoint.svg", w: 616, h: 153 },
  "University of Vermont": { src: "/logos/uvm.svg", w: 348, h: 111 },
  Westinghouse: { src: "/logos/westinghouse.svg", w: 2007, h: 573 },
  "Penn Foster": { src: "/logos/pennfoster.png", w: 625, h: 210 },
};
