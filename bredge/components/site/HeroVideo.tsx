"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero motion environment — the approved data-system plate living inside the page.
 * Mobile-first: a near-square crop of the meaningful right-hand region sits below
 * the copy; desktop uses the full 16:9 plate absolutely behind the copy.
 *
 * Only ONE video variant is downloaded (JS chooses by viewport). The poster paints
 * immediately (LCP), the video fades in once it can play, playback pauses offscreen
 * and when the tab is hidden, and reduced-motion / Save-Data shows the poster only.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const mobile = window.matchMedia("(max-width: 1000px)").matches;
    const base = mobile ? "/media/bredge-hero-mobile" : "/media/bredge-hero-final-v2";
    video.poster = `${base}-poster.webp`; // correct aspect per viewport

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // @ts-expect-error saveData is non-standard
    const saveData = navigator.connection?.saveData === true;
    if (reduced || saveData) return; // poster only
    const canWebm = video.canPlayType('video/webm; codecs="vp9"') !== "";
    video.src = canWebm ? `${base}.webm` : `${base}.mp4`;
    video.load();

    const onCanPlay = () => { setReady(true); void video.play().catch(() => {}); };
    video.addEventListener("canplay", onCanPlay, { once: true });

    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) void video.play().catch(() => {}); else video.pause(); },
      { threshold: 0.05 },
    );
    io.observe(video);
    const onVis = () => { if (document.hidden) video.pause(); else void video.play().catch(() => {}); };
    document.addEventListener("visibilitychange", onVis);

    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); video.removeEventListener("canplay", onCanPlay); };
  }, []);

  return (
    <div className="hero-media" aria-hidden="true">
      <video
        ref={ref}
        className={`hero-video${ready ? " is-ready" : ""}`}
        muted
        loop
        playsInline
        preload="none"
        poster="/media/bredge-hero-final-v2-poster.webp"
      />
    </div>
  );
}
