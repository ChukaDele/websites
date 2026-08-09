# 002 - Establish a cohesive interaction language

- **Status**: TODO
- **Commit**: 2d2e01b
- **Severity**: HIGH
- **Category**: Cohesion and tokens
- **Estimated scope**: 2 files, medium

## Problem

`app/globals.css:17-20` uses one generic button hover for all CTAs, including
the dependable contact CTA. It also uses bare durations and the default
`ease`, while text links rely on a static border and a large arrow movement.

```css
.button { transition:transform .25s ease, background .25s ease; }
.button:hover { background:var(--brand); color:var(--ink); transform:translateY(-2px); }
.arrow { transition:transform .25s ease; }
```

## Target

Introduce the shared tokens below in `app/globals.css` and use them for a
single interaction vocabulary:

```css
--motion-instant: 120ms;
--motion-fast: 180ms;
--motion-base: 240ms;
--motion-slow: 360ms;
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

Use an underline reveal (`transform: scaleX()`) for normal navigation and
editorial text links. Gate hover behavior behind
`@media (hover: hover) and (pointer: fine)`. Keep primary contact CTAs visually
stable on hover. Give pressable controls `scale(.98)` feedback for
`var(--motion-instant)`.

## Steps

1. Add the named duration and easing tokens.
2. Assign clear contact CTA and editorial-link classes in `app/page.tsx` and
   `components/landing/Visuals.tsx`.
3. Replace generic hover movement and color shifts with the specified states.
4. Add a visible, branded `:focus-visible` treatment.

## Boundaries

- Do not add a custom cursor.
- Do not animate footer links or the primary contact CTA on hover.
- Do not use `transition: all` or animate layout properties.

## Verification

- Run `npm run lint` and `npm run build`.
- At 0.25x playback, confirm the underline draws and retracts without text
  movement, and arrow travel remains at two pixels.
- Verify hover does not fire on a touch viewport and focus remains visible.
