// Vite asset imports used by the app (e.g. the preloaded font in app/layout.tsx).
declare module "*?url" {
  const src: string;
  export default src;
}
