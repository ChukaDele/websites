import "../resources.css";

/** Resource pages share one stylesheet; it loads only on these routes. */
export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
