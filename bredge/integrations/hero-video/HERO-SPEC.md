# Bredge hero video — locked composition spec

This freezes the hero geometry so the next Veo generation fits first time.
Values are the ones currently shipped in `app/globals.css` (`.hero`, `.hero-media`,
`.hero-video`) and `components/site/HeroVideo.tsx`.

## Locked geometry

| Breakpoint | Media bounds | Copy safe zone | Object-fit / position | Motion |
| --- | --- | --- | --- | --- |
| **Desktop ≥1001px** | `.hero-media` absolute, `top:0 bottom:0`, `right:-4vw`, `width:64%` (bleeds ~4vw off the right edge) | Left ~46% — `.hero-copy max-width:600px` sits over the paper; the film's left 14–34% is feathered to transparent so copy never overlaps live motion | `object-fit:cover; object-position:center right` | autoplay, muted, loop, boomerang |
| **Tablet 651–1000px** | Full content width, `aspect-ratio:16/10`, below the copy (`margin-top:36px`) | Copy full width above the media | `object-position:center` | autoplay, muted, loop |
| **Mobile ≤650px** | Same as tablet (full width, 16/10, below copy) | Copy full width above | `object-position:center`, top/bottom feather only | autoplay, muted, loop; poster carries it if data-saver |
| **Reduced motion** | Poster frame only (`bredge-hero-poster.webp`), no playback | — | — | none |

## Mask (why there's no visible rectangle)
Desktop uses a composited mask so the film dissolves into the paper on the
**left, top and bottom** (only the off-screen right edge is hard):

```
mask-image:
  linear-gradient(to right,  transparent 0%, rgba(0,0,0,.55) 14%, #000 34%, #000 100%),
  linear-gradient(to bottom, transparent 0%, #000 12%, #000 86%, transparent 100%);
mask-composite: intersect;
```

Mobile uses a top/bottom feather only. No border, shadow, background fill, badge
or fake UI — the film reads as environment, not a card.

## Background match
Site paper token is `#F4F1E9`. The current loop was nudged toward it during
encode (`eq=brightness=0.015:saturation=0.97` + a small `colorbalance`). The new
asset should instead be **generated flat at `#F4F1E9`** so no post-grade is needed.

## Loop
Served as a **boomerang** (forward+reverse concat) → identical start/end frames,
seamless. Assets: `public/media/bredge-hero-loop.webm` (VP9), `.mp4` (H.264),
`bredge-hero-poster.webp`. `<video autoplay muted loop playsinline preload=auto>`,
IntersectionObserver pauses it offscreen; reduced-motion shows only the poster.

---

## FINAL Veo prompt (only run once this spec is visually approved)

> Abstract data-system animation on a completely flat solid background of exact
> colour #F4F1E9 (warm paper), 16:9, high quality. The left ~45% of the frame is
> intentionally near-empty negative space — only faint, low-contrast structure may
> drift there. All meaningful motion happens in the right ~55%: abstract
> information structures — records, grids, nodes, thin connecting lines, small data
> cells — that appear, align, reconcile and simplify into a calmer, more ordered
> arrangement. Muted neutral linework with a single restrained green accent
> (#90D26F) used only for resolved/connected states. Locked static camera: no
> zoom, pan, orbit, rack focus or camera move. Motion is calm, precise, editorial,
> mechanical-but-natural. The first and last frames must be visually compatible for
> a seamless forward/reverse web loop (structures settle, then gently begin to
> return). No readable text, numbers, logos, application UI, dashboards, servers,
> databases, people, vignette, gradient lighting, sepia drift, fade-to-black or
> last-frame zoom. Duration 6–8s.

## Regeneration verdict
**Justified, once you approve this composition.** The current loop works but was
repurposed from an earlier film: its background isn't exactly `#F4F1E9` and its
left region carries objects (masked away rather than authored empty). A film
generated to this spec would let us drop the colour-grade and the heavy left
feather, giving a cleaner safe zone and a truer paper match. Geometry above is
locked, so it should fit without another fitting cycle.
