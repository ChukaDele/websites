# 003 - Reduce ambient motion and lock hero geometry

- **Status**: TODO
- **Commit**: 2d2e01b
- **Severity**: HIGH
- **Category**: Purpose, performance, and accessibility
- **Estimated scope**: 2 files plus specification, medium

## Problem

`components/landing/PageMotion.tsx:17-18` keeps the hero globe and pipeline
moving forever. `app/globals.css:26` also treats the hero visual as a bordered,
shadowed media card. The visual should instead support the message as an
environment with a predictable copy-safe area.

```ts
gsap.to(".system-globe", { rotation: 6, duration: 7, repeat: -1 });
gsap.to(".pipeline-core", { y: -8, duration: 1.8, repeat: -1 });
```

## Target

Remove the ambient JavaScript loops. Use the current static visual as the
poster composition and document the exact responsive safe-zone rules before
any Veo generation. On desktop the copy-safe area occupies 45% of the hero,
with motion concentrated in the right 55%; the background is `#F4F1E9`.

## Steps

1. Remove the perpetual GSAP loops.
2. Remove the hero media-card border, shadow, and isolated rectangle treatment.
3. Update responsive hero rules to preserve the desktop safe zone and stack the
   visual after copy on narrow widths.
4. Add a private hero media specification with desktop, tablet, mobile,
   object-position, and reduced-motion rules.

## Boundaries

- Do not generate a Veo asset.
- Do not add camera-like visual motion or a visible media label.
- Do not replace meaningful reduced-motion feedback with an all-motion kill switch.

## Verification

- Run `npm run lint` and `npm run build`.
- Review desktop, tablet, and mobile remote screenshots.
- Toggle `prefers-reduced-motion` and confirm the composition remains complete.
