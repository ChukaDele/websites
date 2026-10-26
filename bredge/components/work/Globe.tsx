"use client";

import { useEffect, useRef } from "react";

/**
 * A glossy dark-green globe (after the Meska reference): deep green oceans,
 * textured green continents, a lime rim of light and a glassy highlight,
 * with glowing lime rings on a few cities and fine arcs between them. It
 * turns slowly and leans a little towards the cursor.
 *
 * Land comes from /media/how/land.json (Natural Earth 1:50m via world-atlas,
 * public domain; small islands dropped), drawn once into an equirectangular
 * texture. Three.js loads only when the globe is near the screen. Renders
 * only while visible; reduced motion: one still frame.
 */

// [lat, lon] — our two markets and the US west coast.
const PINS: Array<[number, number]> = [[40.71, -74.0], [51.51, -0.13], [37.77, -122.42]];
const ARCS: Array<[number, number]> = [[0, 1], [0, 2]];

const VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const FRAG = /* glsl */ `
  uniform sampler2D map;
  varying vec3 vN; varying vec3 vV; varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float land = texture2D(map, vUv).r;
    float relief = noise(vUv * vec2(900.0, 450.0)) * 0.55 + noise(vUv * vec2(220.0, 110.0)) * 0.45;
    vec3 ocean = vec3(0.02, 0.07, 0.035);
    vec3 green = mix(vec3(0.10, 0.30, 0.10), vec3(0.36, 0.62, 0.26), relief);
    vec3 base = mix(ocean, green, land);
    vec3 n = normalize(vN), v = normalize(vV);
    vec3 L = normalize(vec3(-0.8, 0.55, 0.4));
    float diff = max(dot(n, L), 0.0);
    vec3 col = base * (0.35 + 0.95 * diff);
    float spec = pow(max(dot(reflect(-L, n), v), 0.0), 60.0);
    col += vec3(0.85, 1.0, 0.8) * spec * 0.18;
    float fr = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    col += vec3(0.62, 0.95, 0.38) * fr * 0.85;
    gl_FragColor = vec4(col, 1.0);
  }`;

const SHELL_FRAG = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec2 vUv;
  void main() {
    float fr = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 3.2);
    gl_FragColor = vec4(vec3(0.72, 1.0, 0.5) * fr, fr * 0.9);
  }`;

const PIN_VERT = /* glsl */ `
  uniform float size;
  varying float vFace;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFace = dot(n, normalize(-mv.xyz));
    gl_PointSize = size;
    gl_Position = projectionMatrix * mv;
  }`;

const PIN_FRAG = /* glsl */ `
  varying float vFace;
  void main() {
    if (vFace < 0.05) discard;
    vec2 p = gl_PointCoord * 2.0 - 1.0; float r = length(p);
    float ring = smoothstep(0.62, 0.7, r) * (1.0 - smoothstep(0.86, 0.94, r));
    float dot_ = 1.0 - smoothstep(0.26, 0.34, r);
    float glow = exp(-r * 3.0) * 0.5;
    vec3 lime = vec3(0.84, 1.0, 0.45);
    gl_FragColor = vec4(lime, (ring + dot_ * 0.9 + glow) * smoothstep(0.05, 0.3, vFace));
  }`;

function toVec(lat: number, lon: number, r = 1): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return [-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)];
}

export function Globe({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false, raf = 0, visible = true, started = false;
    let cleanup = () => {};

    const start = async () => {
      if (started) return;
      started = true;
      const [T, land] = await Promise.all([
        import("./globe-three"),
        fetch("/media/how/land.json").then((r) => r.json() as Promise<number[][]>).catch(() => [] as number[][]),
      ]);
      if (disposed) return;

      // Land mask, equirectangular.
      const tc = document.createElement("canvas");
      tc.width = 2048; tc.height = 1024;
      const g = tc.getContext("2d")!;
      g.fillStyle = "#000"; g.fillRect(0, 0, tc.width, tc.height);
      g.fillStyle = "#fff";
      g.beginPath();
      for (const ring of land) {
        for (let i = 0; i < ring.length; i += 2) {
          const x = ((ring[i] + 180) / 360) * tc.width, y = ((90 - ring[i + 1]) / 180) * tc.height;
          if (i) g.lineTo(x, y); else g.moveTo(x, y);
        }
        g.closePath();
      }
      g.fill("evenodd");
      const tex = new T.CanvasTexture(tc);
      tex.anisotropy = 4;

      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
      host.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(28, 1, 0.1, 50);
      camera.position.set(0, 0, 4.4);

      const world = new T.Group();
      world.rotation.x = 0.32;
      scene.add(world);
      const spin = new T.Group();
      world.add(spin);

      spin.add(new T.Mesh(new T.SphereGeometry(1, 96, 64), new T.ShaderMaterial({ uniforms: { map: { value: tex } }, vertexShader: VERT, fragmentShader: FRAG })));
      world.add(new T.Mesh(new T.SphereGeometry(1.025, 64, 48), new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: SHELL_FRAG, transparent: true, depthWrite: false, blending: T.AdditiveBlending })));

      // Pins and arcs ride on the spinning globe.
      const pinPos = new Float32Array(PINS.flatMap(([la, lo]) => toVec(la, lo, 1.004)));
      const pinGeo = new T.BufferGeometry();
      pinGeo.setAttribute("position", new T.BufferAttribute(pinPos, 3));
      const pinMat = new T.ShaderMaterial({ uniforms: { size: { value: 26 * renderer.getPixelRatio() } }, vertexShader: PIN_VERT, fragmentShader: PIN_FRAG, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
      spin.add(new T.Points(pinGeo, pinMat));
      const lineMat = new T.LineBasicMaterial({ color: 0xd6f59a, transparent: true, opacity: 0.55 });
      for (const [a, b] of ARCS) {
        const va = new T.Vector3(...toVec(...PINS[a], 1.004)), vb = new T.Vector3(...toVec(...PINS[b], 1.004));
        const mid = va.clone().add(vb).multiplyScalar(0.5);
        mid.setLength(1 + va.distanceTo(vb) * 0.45);
        const pts = new T.QuadraticBezierCurve3(va, mid, vb).getPoints(64);
        const geo = new T.BufferGeometry().setFromPoints(pts);
        spin.add(new T.Line(geo, lineMat));
      }
      // The Atlantic faces us (the Americas left, Europe and Africa right);
      // the globe sways gently around that view rather than spinning away.
      const FACE = -0.87;
      spin.rotation.y = FACE;

      const size = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(host);

      // Lean towards the cursor, eased.
      let tx = 0, ty = 0, lx = 0, ly = 0;
      const hero = host.closest("section") ?? host;
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 0.35;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 0.2;
      };
      if (fine && !reduce) hero.addEventListener("pointermove", onMove as EventListener, { passive: true });

      const t0 = performance.now();
      const loop = (now: number) => {
        raf = 0;
        if (!visible || disposed) return;
        spin.rotation.y = FACE + Math.sin(((now - t0) / 1000) * 0.12) * 0.3;
        lx += (tx - lx) * 0.05; ly += (ty - ly) * 0.05;
        world.rotation.y = lx; world.rotation.x = 0.32 + ly;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      const kick = () => { if (!raf && !reduce) raf = requestAnimationFrame(loop); };
      renderer.render(scene, camera);
      host.classList.add("is-ready");
      kick();
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
      io.observe(host);

      cleanup = () => {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
        hero.removeEventListener("pointermove", onMove as EventListener);
        renderer.dispose(); tex.dispose();
        renderer.domElement.remove();
      };
    };

    // Load Three.js only once the globe is close to the screen.
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); start(); } }, { rootMargin: "200px" });
    near.observe(host);
    return () => { disposed = true; near.disconnect(); cleanup(); };
  }, []);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
