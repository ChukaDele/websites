# Hero media specification

This locks the current data-system poster before any Veo generation.

## Desktop, 1001px and above

- Hero bounds: `min-height: 810px`; the media environment occupies the right
  55% of the content grid and has no border, shadow, label, or media frame.
- Copy-safe zone: left 45%. No important visual object may enter it.
- Source: 16:9, positioned right center, with `object-fit: cover` when the
  poster becomes video.
- Background: flat `#F4F1E9`. No vignette, gradient lighting, or beige drift.

## Tablet, 651px to 1000px

- Copy remains first. The media environment follows at full available width,
  `470px` high, with right-side objects retained and no crop that cuts the
  reconciled metric.
- The source uses `object-position: 68% center` to preserve the action zone.

## Mobile, 650px and below

- Copy remains first. The poster follows at `350px` high.
- The media is a quiet static treatment. The source uses
  `object-position: 72% center`; no left-side copy safe zone is required after
  the composition stacks.

## Reduced motion

- The composition stays complete and static. Any future video must show its
  poster frame instead of playing. No scroll-linked or ambient hero motion is
  required for comprehension.

## Regeneration gate

The next asset must be 16:9, 6–8 seconds, locked-camera, and loop-compatible.
It must keep the left 45% nearly empty and use the right 55% for abstract
records, grids, nodes, lines, and data cells. It must not contain UI, readable
text, numbers, logos, server imagery, fades to black, or a hard restart.
