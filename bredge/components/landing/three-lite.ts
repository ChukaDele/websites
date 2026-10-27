/**
 * The few Three.js pieces ParticleField uses. Importing them by name (instead of
 * `import("three")`, which pulls the whole namespace) lets the bundler drop the
 * loaders, geometries, lights and helpers the particle field never touches.
 */
export {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Camera,
  DynamicDrawUsage,
  LineSegments,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
