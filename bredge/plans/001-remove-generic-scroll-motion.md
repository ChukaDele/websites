# 001 - Remove generic scroll entrances

- **Status**: TODO
- **Commit**: 2d2e01b
- **Severity**: HIGH
- **Category**: Purpose and frequency
- **Estimated scope**: 1 file, small

## Problem

`components/landing/PageMotion.tsx:34-36` applies the same fade and vertical
translation to outcome cards, reference cases, and the diagnostic block. These
are unrelated content blocks. The repeated scroll reveal has no explanatory
purpose and makes ordinary reading feel staged.

```ts
gsap.from(".outcome-card", { y: 28, autoAlpha: 0, stagger: 0.08, duration: 0.48, ease: "power3.out" });
gsap.from(".reference-case", { y: 34, autoAlpha: 0, stagger: 0.11, duration: 0.5, ease: "power3.out" });
gsap.from(".diagnostic", { y: 38, autoAlpha: 0, duration: 0.55, ease: "power3.out" });
```

## Target

Remove these animations. Keep the pinned `HeroMorph` sequence because it
explains the transition from disconnected sources to a reconciled model. The
content following it should become intentionally still.

## Steps

1. Remove the generic ScrollTrigger calls from `components/landing/PageMotion.tsx`.
2. Remove the component if it no longer has a purposeful responsibility.
3. Confirm that no below-the-fold card starts hidden.

## Boundaries

- Do not change the `HeroMorph` narrative.
- Do not replace these reveals with another entrance effect.

## Verification

- Run `npm run lint` and `npm run build`.
- At 0.25x playback, confirm that only the hero story is scroll-driven.
- Enable reduced motion and confirm that all content remains visible and stable.
