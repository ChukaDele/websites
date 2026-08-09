# Internal motion and interaction map

This map applies Emil Kowalski's review, improvement, and opportunity-finding
standards to the checked-out Bredge implementation.

## Implemented pages

| Surface | Element | Interaction | Purpose | Duration and easing | Responsive and reduced motion |
| --- | --- | --- | --- | --- | --- |
| Homepage | Primary navigation | Underline reveal and active marker | State indication and wayfinding | 180ms `--ease-out` | Desktop pointer only. Active underline becomes an opacity state with reduced motion. |
| Homepage | Services | Origin-aware dropdown with click, focus, and Escape support | State indication and spatial consistency | 180ms `--ease-out`, opacity and 5px translate | Desktop pointer hover is intent-delayed. Keyboard works at all sizes. Reduced motion uses opacity only. |
| Homepage | Contact CTAs | Press compression only | Feedback | 120ms `--ease-out`, `scale(.98)` | No decorative hover at any size. Reduced motion keeps the state static. |
| Homepage | Editorial links | Underline reveal and 2px directional arrow movement | Directional feedback | 180ms `--ease-out` | Pointer only. Reduced motion uses underline opacity with no arrow movement. |
| Homepage | Hero to Five Systems | Pinned source-to-model transformation | Transform and hand off | Scroll-linked, desktop only | Stacks as a static composition below 1001px and with reduced motion. |
| Homepage | Footer data grid | Environmental grid response | Context only | Existing short CSS transition | Footer links remain still. No link hover effect. |

## Reviewed and removed

| Location | Prior motion | Classification | Decision |
| --- | --- | --- | --- |
| `PageMotion.tsx` | Outcome, reference, and diagnostic fade-up entrances | None | Removed. These content blocks do not need to announce themselves. |
| Hero system | Perpetual globe rotation and pipeline float | None | Removed. The poster now stays quiet until the meaningful Five Systems transformation. |
| Problem cards | Full colour inversion on hover | None | Removed. Static information cards are not controls. |
| Footer directory | Disabled links and decorative treatment | None | Replaced with quiet useful anchors. Insights was removed. |

## Opportunities deliberately rejected

- Body copy and static technical labels: rejected because reading content should
  remain still.
- Footer directory links: rejected because frequent navigation needs stable,
  predictable behavior.
- Contact CTAs: rejected because the service needs dependable conversion
  behavior, not hover theatre.
- Outcome and capability cards: rejected because they are information surfaces,
  not interactive controls.
- Unimplemented Services, Embedded Team, Projects, Diagnostic, How We Work,
  About, and Contact routes: no motion was invented. They are not present in
  the checked-out application and need a real route implementation first.

## Review verdict

The revised home page retains one explanatory, desktop-only transformation and
uses fast, interruptible CSS transitions for frequent UI. The remaining
highest-value work is a real contact route and delivery endpoint. That work is
not present in this source tree and must be defined before it can be honestly
implemented.
