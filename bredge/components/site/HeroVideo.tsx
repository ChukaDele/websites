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
    const viewport = window.matchMedia("(max-width: 1000px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // @ts-expect-error Network Information is not yet in the standard DOM types.
    const saveData = navigator.connection?.saveData === true;
    let intersecting = false;
    let isReady = false;
    let disposed = false;

    const pause = () => video.pause();
    const mayPlay = () => !disposed && !document.hidden && intersecting && !reduced.matches && !saveData;
    const resume = () => { if (mayPlay() && isReady) void video.play().catch(() => {}); };

    const configure = () => {
      pause();
      const base = viewport.matches ? "/media/bredge-hero-mobile" : "/media/bredge-hero-final-v2";
      const nextPoster = `${base}-poster.webp`;
      if (video.poster !== new URL(nextPoster, location.href).href) video.poster = nextPoster;
      // Neither reduced-motion nor Save-Data should download motion at all.
      if (reduced.matches || saveData) {
        video.removeAttribute("src");
        video.load();
        isReady = false;
        setReady(false);
        return;
      }
      const nextSource = video.canPlayType('video/webm; codecs="vp9"') ? `${base}.webm` : `${base}.mp4`;
      if (!intersecting || video.getAttribute("src") === nextSource) return;
      isReady = false;
      setReady(false);
      video.src = nextSource;
      video.load();
    };

    const onCanPlay = () => { isReady = true; setReady(true); resume(); };
    video.addEventListener("canplay", onCanPlay);

    const io = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      if (intersecting) { configure(); resume(); } else pause();
    }, { rootMargin: "160px 0px", threshold: 0.01 });
    io.observe(video);

    const onVisibility = () => { if (document.hidden) pause(); else resume(); };
    document.addEventListener("visibilitychange", onVisibility);
    viewport.addEventListener("change", configure);
    reduced.addEventListener("change", configure);
    configure();

    return () => {
      disposed = true;
      pause();
      io.disconnect();
      video.removeEventListener("canplay", onCanPlay);
      document.removeEventListener("visibilitychange", onVisibility);
      viewport.removeEventListener("change", configure);
      reduced.removeEventListener("change", configure);
      video.removeAttribute("src");
      video.load();
    };
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
