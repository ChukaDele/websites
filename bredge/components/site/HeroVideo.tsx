"use client";

import { useEffect, useRef } from "react";

/**
 * Hero motion environment. Autoplays a seamless muted loop, but respects
 * prefers-reduced-motion (poster only) and pauses when scrolled out of view.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // leave the poster frame, no motion

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <div className="hero-media" aria-hidden="true">
      <video ref={ref} className="hero-video" autoPlay muted loop playsInline preload="auto" poster="/media/bredge-hero-poster.webp">
        <source src="/media/bredge-hero-loop.webm" type="video/webm" />
        <source src="/media/bredge-hero-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
