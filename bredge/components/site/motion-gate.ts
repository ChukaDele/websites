/** Load heavy motion code only when it can be used: a media query matches, or the
 *  scene is within `margin` of the viewport. Keeps GSAP off the first-paint path. */

/** Runs `start` once, as soon as `query` matches (now or after a resize). Returns cleanup. */
export function whenMedia(query: string, start: () => void): () => void {
  const mq = window.matchMedia(query);
  let done = false;
  const go = () => { if (done || !mq.matches) return; done = true; mq.removeEventListener("change", go); start(); };
  go();
  if (!done) mq.addEventListener("change", go);
  return () => mq.removeEventListener("change", go);
}

/** Runs `start` once, when `el` is within `margin` of the viewport. Returns cleanup. */
export function whenNear(el: Element, start: () => void, margin = "100% 0px"): () => void {
  if (typeof IntersectionObserver === "undefined") { start(); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}
