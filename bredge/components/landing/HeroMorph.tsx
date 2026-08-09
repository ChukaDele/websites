"use client";

import { useEffect, useRef } from "react";

const sources = ["Product", "Billing", "CRM", "Support", "Finance"];

export function HeroMorph() {
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvasHost = canvasRef.current;
    const desktop = window.matchMedia("(min-width: 1001px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!stage || !canvasHost || !desktop || reducedMotion) return;

    let cleanup = () => {};
    let cancelled = false;

    const loadMotion = async () => {
      const [{ default: gsap }, { ScrollTrigger }, THREE] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("three"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      canvasHost.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 8);

      const field = new THREE.Group();
      scene.add(field);
      const pointPositions = new Float32Array(96 * 3);
      for (let index = 0; index < 96; index += 1) {
        const offset = index * 3;
        pointPositions[offset] = ((index * 37) % 19) / 4 - 2.4;
        pointPositions[offset + 1] = ((index * 17) % 23) / 5 - 2.1;
        pointPositions[offset + 2] = ((index * 11) % 13) / 9 - 0.8;
      }
      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
      const points = new THREE.Points(pointsGeometry, new THREE.PointsMaterial({ color: 0x90d26f, size: 0.035, transparent: true, opacity: 0.82 }));
      field.add(points);

      const linePositions = new Float32Array([
      -2.4, 1.3, 0, 0, 0, 0, 2.2, 1.2, 0, 0, 0, 0,
      -2.5, -1.3, 0, 0, 0, 0, 2.4, -1.1, 0, 0, 0, 0,
      0, 2, 0, 0, 0, 0,
      ]);
      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      field.add(new THREE.LineSegments(linesGeometry, new THREE.LineBasicMaterial({ color: 0x90d26f, transparent: true, opacity: 0.5 })));

      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 1), new THREE.MeshBasicMaterial({ color: 0xfa8754, wireframe: true, transparent: true, opacity: 0.82 }));
      field.add(core);

      const render = () => renderer.render(scene, camera);
      const resize = () => {
      const { width, height } = canvasHost.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvasHost);
      resize();

      const context = gsap.context(() => {
      const select = gsap.utils.selector(stage);
      const cards = select(".morph-card");
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=135%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      gsap.set(select(".hero-morph-tease"), { autoAlpha: 0 });
      gsap.set(cards, { autoAlpha: 0, y: 34 });

      cards.forEach((card, index) => {
        timeline.to(card, { autoAlpha: 1, y: 0, duration: 0.16 }, index * 0.07);
        timeline.to(card, { x: (index - 2) * 26, y: index % 2 ? -12 : 12, rotation: 0, scale: 0.82, autoAlpha: 0.3, duration: 0.46 }, 0.52 + index * 0.035);
      });

      timeline
        .to({}, { duration: 0.22 })
        .to(select(".hero-morph-tease"), { autoAlpha: 1, x: -300, duration: 0.26 }, 0.9)
        .to(select(".morph-result"), { autoAlpha: 1, y: 0, duration: 0.3 }, 1.16)
        .to(select(".morph-decision"), { autoAlpha: 1, y: 0, duration: 0.26 }, 1.36)
        .to(field.rotation, { y: 0.7, z: -0.12, duration: 0.84, onUpdate: render }, 0)
        .to(core.rotation, { x: 1.7, y: 2.2, duration: 0.84, onUpdate: render }, 0);
      }, stage);

      // The pin/timeline are measured while this bundle is still loading, so if the
      // user has already scrolled by the time it resolves, start/end can be stale.
      ScrollTrigger.refresh();

      cleanup = () => {
        context.revert();
        resizeObserver.disconnect();
        pointsGeometry.dispose();
        linesGeometry.dispose();
        core.geometry.dispose();
        core.material.dispose();
        points.material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    void loadMotion();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section ref={stageRef} className="hero-morph" aria-label="The journey from fragmented sources to a trusted decision">
      <div ref={canvasRef} className="hero-morph-canvas" aria-hidden="true" />
      <div className="section-wrap hero-morph-content">
        <div className="hero-morph-tease">
          <p className="eyebrow">CONTINUING THE STORY</p>
          <h2>Five systems are already telling a story.</h2>
          <p>They just are not telling the same one yet. Scroll to bring the picture into focus.</p>
        </div>
        <div className="morph-cards" aria-hidden="true">
          {sources.map((source, index) => <div className={`morph-card card-${index + 1}`} key={source}><span>0{index + 1}</span><b>{source}</b><small>separate record</small></div>)}
        </div>
        <div className="morph-result"><span>RECONCILED MODEL</span><strong>1 trusted view</strong><small>Definitions, checks and ownership included.</small></div>
        <div className="morph-decision"><span>THE NEXT PAGE</span><p>Now the question can move from “Which number?” to “What should we do?”</p></div>
      </div>
    </section>
  );
}
