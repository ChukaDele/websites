"use client";

import { useEffect, useRef } from "react";

/**
 * Hero particle field (Second Direction).
 *
 * At rest it is a drifting cloud of Bredge-lime "stars" (after the Lugano
 * Living Lab hero). As the visitor scrolls, each star slides onto one of a set
 * of flowing data lines that run down the same curve as the star cloud (in
 * from the top, sweeping right, then down). The lines stay pinned behind the
 * next screen and keep moving with the scroll, so they follow the visitor down.
 *
 * - Star drift, the intro stream-in, the star → line morph and the line path
 *   all run in shaders, driven by uniforms (cheap).
 * - Cursor swirls are a small CPU spring simulation, so eddies linger and relax.
 * - Pauses off-screen / in background tabs; reduced motion skips the intro and
 *   continuous motion but still follows the scroll.
 */

const COLORS: Array<[number, number, number, number]> = [
  // r, g, b, share
  [0.714, 0.937, 0.616, 0.6], // #b6ef9d lime
  [0.565, 0.824, 0.435, 0.22], // #90d26f brand
  [0.914, 0.961, 0.784, 0.18], // pale lime highlight
];

// Shared GLSL: simplex noise + the data-line curve. Both the particles and the
// drawn lines use `linePos`, so particles land exactly on the lines.
const shared = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform float uScroll;   // hero scrolled, in viewport heights (smoothed)
  uniform float uPortrait; // 1 on tall screens: use the portrait path
  uniform float uPath;     // 0 = hero path, 1 = stream (in from the top-left corner, diagonally into the middle)
  uniform vec2 uMouse;     // cursor, screen fractions
  uniform float uHover;    // 0..1 cursor influence (stream mode)

  // Push a point away from the cursor; strands part around it.
  vec2 repel(vec2 p, float amount) {
    vec2 dv = (p - uMouse) * vec2(uAspect, 1.0);
    float r = length(dv);
    float f = smoothstep(0.2, 0.0, r) * uHover;
    return p + (dv / max(r, 1e-4)) / vec2(uAspect, 1.0) * f * amount;
  }

  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // The data lines follow the same path as the star cloud: in from the top,
  // sweeping right, then down the right-hand side. t runs top → bottom and
  // starts/ends off-screen so the strands enter and leave cleanly.
  // k: the strand's slot across the band, -1 → 1.
  const float STREAM_SLOPE = 0.72; // 35.8deg, from the two annotated arrows (36.7deg, 34.6deg)
  vec2 linePos(float k, float t) {
    vec2 P0 = uPortrait > 0.5 ? vec2(1.0, -0.06) : vec2(0.30, -0.06);
    vec2 P1 = uPortrait > 0.5 ? vec2(0.55, 0.2) : vec2(0.58, 0.12);
    vec2 P2 = uPortrait > 0.5 ? vec2(0.95, 0.45) : vec2(0.86, 0.28);
    vec2 P3 = uPortrait > 0.5 ? vec2(0.5, 1.1) : vec2(0.92, 1.12);
    if (uPath > 0.5) {
      // A straight run from the section's top-left corner, at the angle measured
      // from the brief's annotated arrows.
      // Held in real pixels: y-fraction = x-fraction * slope * aspect.
      float k = STREAM_SLOPE * uAspect;
      // Starts just off-screen so its fade-in is spent before the corner:
      // the stream is at full strength exactly where it enters.
      P0 = vec2(-0.09, -0.09 * k);
      P3 = vec2(1.2, 1.2 * k);
      P1 = mix(P0, P3, 1.0 / 3.0);
      P2 = mix(P0, P3, 2.0 / 3.0);
    }
    float s = 1.0 - t;
    vec2 b = s * s * s * P0 + 3.0 * s * s * t * P1 + 3.0 * s * t * t * P2 + t * t * t * P3;
    vec2 d = 3.0 * s * s * (P1 - P0) + 6.0 * s * t * (P2 - P1) + 3.0 * t * t * (P3 - P2);
    // Normal measured in real pixels (aspect-corrected), then back to fractions.
    vec2 tangent = normalize(vec2(d.x * uAspect, d.y));
    vec2 normal = vec2(-tangent.y / uAspect, tangent.x);
    // Tight at the top, widening as it falls, like the star cloud.
    float width = uPath > 0.5 ? 0.01 + 0.12 * t : 0.012 + 0.17 * pow(t, 1.5);
    // A slow wave that rolls as you scroll, plus a finer per-strand ripple.
    float wave = 0.035 * sin(t * 6.0 - uTime * 0.35 + uScroll * 2.4) * (0.3 + t);
    wave += 0.008 * sin(t * 14.0 + k * 3.0 + uTime * 0.5) * t;
    if (uPath > 0.5) wave *= 0.25; // the stream stays on its measured line
    return b + normal * (k * width + wave);
  }

  vec3 lineColor(float k) {
    vec3 lime = vec3(0.714, 0.937, 0.616);
    vec3 mint = vec3(0.86, 1.0, 0.92);
    vec3 teal = vec3(0.31, 0.82, 0.77);
    float a = abs(k);
    return a < 0.25 ? mix(mint, lime, a / 0.25) : mix(lime, teal, (a - 0.25) / 0.75);
  }
`;

const pointVertex = /* glsl */ `
  ${shared}
  attribute vec4 aSeed;      // x: reveal jitter, y: size, z/w: noise phase
  attribute vec2 aOffset;    // cursor displacement from the CPU sim
  attribute float aT;        // position along the star band, 0 → 1
  attribute vec3 aColor;
  attribute vec2 aLine;      // x: line slot k, y: start position along the line
  uniform float uReveal;
  uniform float uMorph;      // 0 = stars, 1 = data lines
  uniform float uPixelRatio;
  uniform float uSize;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // --- Star state: slow drift on a noise field, plus a small wobble.
    vec2 star = position.xy;
    float t = uTime * 0.045;
    vec2 q = star * vec2(uAspect, 1.0) * 2.2;
    star += vec2(snoise(q + vec2(t, aSeed.z)), snoise(q + vec2(aSeed.w, -t) + 17.0)) * 0.028;
    star += vec2(sin(uTime * 0.6 + aSeed.z * 6.28), cos(uTime * 0.5 + aSeed.w * 6.28)) * 0.0025;

    // --- Line state: stream down the line (top → bottom), wrapping around.
    float speed = 0.018 + 0.03 * aSeed.y;
    float along = fract(aLine.y + uTime * speed + uScroll * 0.15);
    vec2 onLine = linePos(aLine.x, along);
    float edgeFade = smoothstep(0.0, 0.06, along) * smoothstep(1.0, 0.94, along);

    // Staggered morph so stars peel onto the lines a few at a time.
    float m = smoothstep(aSeed.x * 0.3, aSeed.x * 0.3 + 0.45, uMorph);
    m = m * m * (3.0 - 2.0 * m);
    vec2 p = mix(star, onLine, m);

    // Intro: stars stream in along the band, head to tail.
    float threshold = aT * 0.72 + aSeed.x * 0.22;
    float shown = smoothstep(threshold, threshold + 0.14, uReveal);
    p += (1.0 - shown) * vec2(-0.12, -0.06);

    p += aOffset;
    // Stream mode: particles near the cursor part and shiver.
    vec2 before = p;
    p = repel(p, 0.05);
    float near = length(p - before) * 20.0;
    p += vec2(sin(uTime * 37.0 + aSeed.z * 40.0), cos(uTime * 31.0 + aSeed.w * 40.0)) * 0.0035 * near;

    vColor = mix(aColor, lineColor(aLine.x), m);
    vAlpha = shown * (0.55 + aSeed.y * 0.45) * mix(1.0, edgeFade, m);
    gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed.y * 0.9) * mix(1.0, 0.85, m);
  }
`;

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.18, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const lineVertex = /* glsl */ `
  ${shared}
  attribute vec2 aParam;     // x: line slot k, y: position along the line 0 → 1
  uniform float uMorph;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = repel(linePos(aParam.x, aParam.y), 0.035);
    float a = abs(aParam.x);
    // Lines draw down from the top as the morph completes.
    float drawn = smoothstep(0.0, 0.15, uMorph * 1.35 - aParam.y - 0.1);
    vAlpha = drawn * mix(0.55, 0.14, a) * smoothstep(0.0, 0.08, aParam.y) * smoothstep(1.0, 0.92, aParam.y);
    vColor = lineColor(aParam.x);
    gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  }
`;

const lineFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    if (vAlpha < 0.005) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

function gaussian() {
  // Box–Muller
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function bandPoint(t: number, portrait: boolean): [number, number] {
  // Cubic Bézier through the right side of the screen, clear of the headline.
  const P = portrait
    ? [[0.95, 0.06], [0.55, 0.2], [0.9, 0.42], [0.5, 0.62]]
    : [[0.3, 0.12], [0.56, 0.16], [0.86, 0.3], [0.93, 0.98]];
  const s = 1 - t;
  const x = s * s * s * P[0][0] + 3 * s * s * t * P[1][0] + 3 * s * t * t * P[2][0] + t * t * t * P[3][0];
  const y = s * s * s * P[0][1] + 3 * s * s * t * P[1][1] + 3 * s * t * t * P[2][1] + t * t * t * P[3][1];
  return [x, y];
}

function pickColor(): [number, number, number] {
  let r = Math.random();
  for (const [cr, cg, cb, share] of COLORS) {
    if ((r -= share) <= 0) return [cr, cg, cb];
  }
  return [COLORS[0][0], COLORS[0][1], COLORS[0][2]];
}

// Line slots, -1 → 1, denser toward the bright centre of the bundle.
function lineSlot(i: number, lines: number) {
  const k = (i / (lines - 1)) * 2 - 1;
  return Math.sign(k) * Math.pow(Math.abs(k), 1.25);
}

/**
 * stream: start as the data-line stream (no star stage, no intro), for use as
 * a section background. Particles keep flowing down the lines and off-screen.
 */
export function ParticleField({ className, stream = false }: { className?: string; stream?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let cleanup = () => {};

    // WebGL is decoration: start it only once the field is near the viewport
    // and the browser is idle, so Three.js never competes with first paint,
    // hydration or the LCP text.
    let gate: IntersectionObserver | null = null;
    let idle = 0;
    const whenReady = new Promise<void>((resolve) => {
      gate = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        gate?.disconnect();
        if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(() => resolve(), { timeout: 1200 });
        else idle = window.setTimeout(resolve, 200);
      }, { rootMargin: "400px 0px" });
      gate.observe(host);
    });

    (async () => {
      await whenReady;
      if (disposed) return;
      let THREE;
      try { THREE = await import("./three-lite"); } catch { return; }
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch { return; } // No WebGL: the dark hero still reads fine without particles.
      const canvas = renderer.domElement;
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const section = host.closest("section") ?? host;

      let width = 0;
      let height = 0;
      const portrait = () => height > width * 1.15;
      const small = () => width < 700;

      const uniforms = {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uScroll: { value: 0 },
        uPortrait: { value: 0 },
        uReveal: { value: reduceMotion || stream ? 1.2 : 0 },
        uMorph: { value: 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: 2.6 },
        uPath: { value: stream ? 1 : 0 },
        uMouse: { value: new THREE.Vector2(-10, -10) },
        uHover: { value: 0 },
      };
      const pointMaterial = new THREE.ShaderMaterial({
        vertexShader: pointVertex, fragmentShader: pointFragment, uniforms,
        transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const lineMaterial = new THREE.ShaderMaterial({
        vertexShader: lineVertex, fragmentShader: lineFragment, uniforms,
        transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      });

      let pointGeometry = new THREE.BufferGeometry();
      let lineGeometry = new THREE.BufferGeometry();
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      const points = new THREE.Points(pointGeometry, pointMaterial);
      lines.frustumCulled = false;
      points.frustumCulled = false;
      scene.add(lines);
      scene.add(points);

      // CPU sim state for cursor swirls.
      let base = new Float32Array(0);
      let offset = new Float32Array(0);
      let velocity = new Float32Array(0);
      let offsetAttr: import("three").BufferAttribute | null = null;

      const build = () => {
        const n = small() ? 4200 : 9000;
        const lineCount = small() ? 34 : 56;
        const isPortrait = portrait();

        // Particles: a star position plus a home on one of the data lines.
        const pos = new Float32Array(n * 3);
        const seed = new Float32Array(n * 4);
        const tAttr = new Float32Array(n);
        const color = new Float32Array(n * 3);
        const lineAttr = new Float32Array(n * 2);
        for (let i = 0; i < n; i++) {
          const dust = Math.random() < 0.2;
          // Bias toward the tail so the right side reads as the dense mass and
          // the head thins out into a wispy arm.
          const t = Math.pow(Math.random(), 0.6);
          let x: number;
          let y: number;
          if (dust) {
            x = isPortrait ? Math.random() : 0.3 + Math.random() * 0.75;
            y = isPortrait ? Math.random() * 0.7 : Math.random();
          } else {
            const [cx, cy] = bandPoint(t, isPortrait);
            // Clumpy, not a clean stripe: spread breathes along the band.
            const clump = 0.6 + 0.4 * Math.sin(t * 17 + 1.3) * Math.sin(t * 7.1);
            const spread = (0.025 + 0.15 * t * t) * clump + 0.02 * Math.random();
            x = cx + gaussian() * spread * 1.15;
            y = cy + gaussian() * spread * 0.9;
          }
          pos[i * 3] = x;
          pos[i * 3 + 1] = y;
          seed[i * 4] = Math.random();
          seed[i * 4 + 1] = dust ? Math.random() * 0.5 : Math.random();
          seed[i * 4 + 2] = Math.random() * 10;
          seed[i * 4 + 3] = Math.random() * 10;
          tAttr[i] = dust ? Math.random() : t;
          const [r, g, b] = pickColor();
          color[i * 3] = r; color[i * 3 + 1] = g; color[i * 3 + 2] = b;
          lineAttr[i * 2] = lineSlot(Math.floor(Math.random() * lineCount), lineCount);
          lineAttr[i * 2 + 1] = Math.random();
        }
        pointGeometry.dispose();
        pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        pointGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
        pointGeometry.setAttribute("aT", new THREE.BufferAttribute(tAttr, 1));
        pointGeometry.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
        pointGeometry.setAttribute("aLine", new THREE.BufferAttribute(lineAttr, 2));
        offset = new Float32Array(n * 2);
        velocity = new Float32Array(n * 2);
        base = pos;
        offsetAttr = new THREE.BufferAttribute(offset, 2);
        offsetAttr.setUsage(THREE.DynamicDrawUsage);
        pointGeometry.setAttribute("aOffset", offsetAttr);
        points.geometry = pointGeometry;

        // Drawn lines: each a chain of short segments, shaped in the shader.
        const segs = 180;
        const param = new Float32Array(lineCount * segs * 2 * 2);
        const placeholder = new Float32Array(lineCount * segs * 2 * 3);
        let o = 0;
        for (let l = 0; l < lineCount; l++) {
          const k = lineSlot(l, lineCount);
          for (let s = 0; s < segs; s++) {
            param[o++] = k; param[o++] = s / segs;
            param[o++] = k; param[o++] = (s + 1) / segs;
          }
        }
        lineGeometry.dispose();
        lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute("position", new THREE.BufferAttribute(placeholder, 3));
        lineGeometry.setAttribute("aParam", new THREE.BufferAttribute(param, 2));
        lines.geometry = lineGeometry;
      };

      let lastBuiltPortrait: boolean | null = null;
      let lastBuiltSmall: boolean | null = null;
      const resize = () => {
        const rect = host.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        uniforms.uAspect.value = width / height;
        uniforms.uPixelRatio.value = dpr;
        uniforms.uSize.value = small() ? 2.2 : 2.6;
        uniforms.uPortrait.value = portrait() ? 1 : 0;
        // Rebuild only when the layout family changes, not on every resize.
        if (portrait() !== lastBuiltPortrait || small() !== lastBuiltSmall) {
          lastBuiltPortrait = portrait();
          lastBuiltSmall = small();
          build();
        }
      };
      resize();

      // Scroll → morph. The switch starts on the very first scroll and the
      // stars are fully lines by ~40% of a screen; they keep rolling after.
      const scrollTarget = { morph: 0, scroll: 0 };
      const readScroll = () => {
        const scrolled = Math.max(0, -section.getBoundingClientRect().top) / Math.max(1, window.innerHeight);
        scrollTarget.scroll = scrolled;
        scrollTarget.morph = stream ? 1 : Math.min(1, Math.max(0, scrolled / 0.4));
      };
      readScroll();
      uniforms.uMorph.value = scrollTarget.morph;
      uniforms.uScroll.value = scrollTarget.scroll;

      // Cursor, in screen-fraction space.
      const mouse = { x: -10, y: -10, px: -10, py: -10, energy: 0 };
      const onPointer = (e: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) / rect.width;
        mouse.y = (e.clientY - rect.top) / rect.height;
      };
      const onLeave = () => { mouse.x = mouse.y = mouse.px = mouse.py = -10; };

      const simulate = () => {
        if (!offsetAttr) return;
        const aspect = uniforms.uAspect.value;
        const dx = mouse.x - mouse.px;
        const dy = mouse.y - mouse.py;
        const speed = mouse.px < -1 ? 0 : Math.hypot(dx * aspect, dy);
        mouse.energy = Math.min(1, mouse.energy * 0.92 + speed * 9);
        mouse.px = mouse.x; mouse.py = mouse.y;

        if (stream) return; // the background stream does not react to the cursor

        // Swirls act on the star cloud; they fade out as the lines take over.
        // Stars part around the cursor even at rest (presence), and scatter
        // harder while it moves (energy). Fades as the stars become lines.
        const present = mouse.px > -1 ? 0.35 : 0;
        const strength = Math.min(1, present + mouse.energy) * (1 - uniforms.uMorph.value * 0.7);
        const radius = 0.17;
        const r2max = radius * radius;
        const n = offset.length / 2;
        for (let i = 0; i < n; i++) {
          const ix = i * 2;
          let vx = velocity[ix];
          let vy = velocity[ix + 1];
          if (strength > 0.002) {
            const rx = (base[i * 3] + offset[ix] - mouse.x) * aspect;
            const ry = base[i * 3 + 1] + offset[ix + 1] - mouse.y;
            const r2 = rx * rx + ry * ry;
            if (r2 < r2max) {
              const f = (1 - r2 / r2max) * strength * 0.03;
              // Mostly tangential (the swirl), a little outward push.
              vx += (-ry * 1.8 + rx * 2.2) * f / aspect;
              vy += (rx * 1.8 + ry * 2.2) * f;
            }
          }
          // Spring back to rest, with damping.
          vx = (vx - offset[ix] * 0.012) * 0.93;
          vy = (vy - offset[ix + 1] * 0.012) * 0.93;
          velocity[ix] = vx;
          velocity[ix + 1] = vy;
          offset[ix] += vx;
          offset[ix + 1] += vy;
        }
        offsetAttr.needsUpdate = true;
      };

      // Intro starts once the preloader has lifted.
      const html = document.documentElement;
      let introStart = -1;
      const startIntro = () => { if (introStart < 0) introStart = performance.now(); };
      let classObserver: MutationObserver | undefined;
      if (stream) {
        // No intro: already revealed.
      } else if (html.classList.contains("preload-active")) {
        classObserver = new MutationObserver(() => {
          if (!html.classList.contains("preload-active")) { startIntro(); classObserver?.disconnect(); }
        });
        classObserver.observe(html, { attributes: true, attributeFilter: ["class"] });
      } else {
        startIntro();
      }

      const renderStill = () => {
        readScroll();
        uniforms.uMorph.value = scrollTarget.morph;
        uniforms.uScroll.value = scrollTarget.scroll;
        renderer.render(scene, camera);
      };

      let raf = 0;
      let visible = true;
      const clock0 = performance.now();
      const frame = (now: number) => {
        raf = 0;
        uniforms.uTime.value = (now - clock0) / 1000;
        if (introStart >= 0 && uniforms.uReveal.value < 1.2) {
          const k = Math.min(1, (now - introStart) / 2600);
          uniforms.uReveal.value = k >= 1 ? 1.2 : 1 - Math.pow(1 - k, 3); // ease-out cubic
        }
        // Track the scroll closely; a light ease just smooths wheel steps.
        readScroll();
        uniforms.uMorph.value += (scrollTarget.morph - uniforms.uMorph.value) * 0.3;
        uniforms.uScroll.value += (scrollTarget.scroll - uniforms.uScroll.value) * 0.3;
        simulate();
        renderer.render(scene, camera);
        if (visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      const kick = () => { if (!raf && visible && !document.hidden && !reduceMotion) raf = requestAnimationFrame(frame); };

      const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; kick(); });
      io.observe(host);
      const ro = new ResizeObserver(() => { resize(); if (reduceMotion) renderStill(); });
      ro.observe(host);
      document.addEventListener("visibilitychange", kick);

      if (reduceMotion) {
        renderStill();
        window.addEventListener("scroll", renderStill, { passive: true });
      } else if (stream) {
        kick();
      } else {
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        kick();
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        classObserver?.disconnect();
        document.removeEventListener("visibilitychange", kick);
        window.removeEventListener("scroll", renderStill);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("pointerleave", onLeave);
        pointGeometry.dispose();
        lineGeometry.dispose();
        pointMaterial.dispose();
        lineMaterial.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      (gate as IntersectionObserver | null)?.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle); else clearTimeout(idle);
      cleanup();
    };
  }, [stream]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
