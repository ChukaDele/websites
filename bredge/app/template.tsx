// A template re-mounts on every navigation, so this gives internal route changes
// a subtle fade-in (see .page-transition in pages.css) — deliberately NOT the
// full first-entry preloader. Reduced motion disables it via CSS.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
