import { lazy, type ComponentType } from "react";

/**
 * A build preview (dashboard, pipeline, model) loaded on demand. Each board is
 * its own chunk, so the studio ships only the board on screen; `preload()` warms
 * the rest once the studio is near the viewport, so switching stays instant.
 */
export type LazyPreview = ComponentType & { preload: () => Promise<unknown> };

export function lazyPreview(load: () => Promise<ComponentType>): LazyPreview {
  let pending: Promise<ComponentType> | null = null;
  const once = () => (pending ??= load());
  const Comp = lazy(() => once().then((c) => ({ default: c })));
  return Object.assign(Comp as unknown as ComponentType, { preload: once });
}

/** Warm every preview in the list (no-op for plain components). */
export function preloadPreviews(previews: Array<ComponentType | LazyPreview>) {
  for (const P of previews) {
    if ("preload" in P && typeof P.preload === "function") P.preload().catch(() => {});
  }
}
