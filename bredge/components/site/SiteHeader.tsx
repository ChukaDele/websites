"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const services = [
  ["Services overview", "/services", "Everything we do, pipelines through to dashboards"],
  ["Embedded Data Team", "/services/embedded-data-team", "A senior data team working inside your business"],
  ["Data Projects", "/services/data-projects", "One defined problem, delivered in full"],
  ["Data Diagnostic", "/data-diagnostic", "Find out what to fix first"],
];

// Insights and Resources sit together under "Learn". Resources leads over
// Research: the tools are what US and UK visitors use; the research series
// stays one click away in the footer.
const learn = [
  ["Insights", "/insights", "Practical guides on data, analytics and reporting"],
  ["Resources", "/resources", "Free working tools for data teams"],
];

const primary = [
  ["Work", "/work"],
  ["How we work", "/how-we-work"],
];
const [work, howWeWork] = primary;

/**
 * Two-state header (Second Direction):
 *  - At the top: a full-width static bar. Wordmark left, links centred,
 *    "Schedule a call" as a quiet text link right.
 *  - Once scrolled: a compact floating bar, centred near the top, with the
 *    mark, the same links and a solid "Schedule a call" button.
 * The switch is driven by an IntersectionObserver on a sentinel at the top of
 * the page. Past the hero, a light scroll listener hides the floating bar while
 * scrolling down and brings it back on any scroll up.
 */
export function SiteHeader({ variant = "solid", tone = "light" }: { variant?: "solid" | "overlay"; tone?: "light" | "dark" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname() || "/";
  const servicesActive = pathname.startsWith("/services") || pathname === "/data-diagnostic";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Escape closes the mobile menu and hands focus back to the visible toggle.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      const bar = scrolled ? ".navq-pill" : ".navq-bar";
      headerRef.current?.querySelector<HTMLButtonElement>(`${bar} .navq-toggle`)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, scrolled]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Past the hero (and never before one full screen, so every page behaves
  // the same), the floating bar gets out of the way while reading down and
  // comes back the moment you scroll up.
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let last = window.scrollY, raf = 0;
    const heroEnd = () => {
      const first = document.querySelector("main > section");
      const end = first ? first.getBoundingClientRect().bottom + window.scrollY : 0;
      return Math.max(end, window.innerHeight);
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY, dy = y - last;
      if (Math.abs(dy) < 6) return;
      last = y;
      const focused = headerRef.current?.contains(document.activeElement);
      setHidden(dy > 0 && y > heroEnd() - 80 && !focused);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  // The mark always leads home; on the homepage itself it returns to the top.
  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    e.preventDefault();
    setMenuOpen(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const darkTop = tone === "dark" && !menuOpen;

  return (
    <>
      <span ref={sentinelRef} className="navq-sentinel" aria-hidden="true" />
      <header ref={headerRef} className={`navq navq--${variant}${darkTop ? " navq--dark" : ""}${scrolled ? " is-scrolled" : ""}${hidden && !menuOpen ? " is-hidden" : ""}${menuOpen ? " is-menu" : ""}`}>
        {/* Static bar */}
        <div className="navq-bar" inert={scrolled || undefined} aria-hidden={scrolled || undefined}>
          <a className="navq-logo" href="/" aria-label="The Bredge home" onClick={goHome}>
            {darkTop ? (
              <span className="navq-logo-dark">
                <img className="navq-logo-word" src="/brand/bredge-logo-preloader.webp" alt="" />
                <img className="navq-logo-mark" src="/brand/bredge-logo-preloader.webp" alt="" />
              </span>
            ) : (
              <img src="/brand/bredge-logo.webp" alt="" width="80" height="31" />
            )}
          </a>
          <NavLinks pathname={pathname} servicesActive={servicesActive} />
          <a className="navq-text-cta" href="/schedule">Schedule a call <Chevron /></a>
          <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
        </div>

        {/* Floating bar, once scrolled */}
        <div className="navq-pill" inert={!scrolled || undefined} aria-hidden={!scrolled || undefined}>
          <a className="navq-mark" href="/" aria-label="The Bredge home" onClick={goHome}><span><img src="/brand/bredge-logo-preloader.webp" alt="" /></span></a>
          <NavLinks pathname={pathname} servicesActive={servicesActive} />
          <a className="navq-button" href="/schedule">Schedule a call</a>
          <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" id="site-mobile-menu">
          <p className="mobile-eyebrow">SERVICES</p>
          {services.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <p className="mobile-eyebrow">LEARN</p>
          {learn.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <p className="mobile-eyebrow">COMPANY</p>
          {primary.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="button mobile-cta" href="/schedule" onClick={() => setMenuOpen(false)}>Schedule a call</a>
        </div>
      )}
    </>
  );
}

function NavLinks({ pathname, servicesActive }: { pathname: string; servicesActive: boolean }) {
  const learnActive = learn.some(([, href]) => pathname.startsWith(href));
  return (
    <nav className="navq-links" aria-label="Primary navigation">
      <NavMenu label="Services" href="/services" items={services} active={servicesActive} />
      <NavLink link={work} pathname={pathname} />
      <NavMenu label="Learn" href="/insights" items={learn} active={learnActive} />
      <NavLink link={howWeWork} pathname={pathname} />
    </nav>
  );
}

function NavLink({ link: [label, href], pathname }: { link: string[]; pathname: string }) {
  const on = pathname === href;
  return <a className={`navq-item${on ? " is-active" : ""}`} href={href} aria-current={on ? "page" : undefined}>{label}</a>;
}

/** A top-level item with a dropdown of links. */
function NavMenu({ label, href, items, active }: { label: string; href: string; items: string[][]; active: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = `${useId()}-${label.toLowerCase()}`;
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const escaped = useRef(false);
  // Disclosure navigation (not an ARIA menu): opens on hover or focus, links
  // are reached with Tab, Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const hadFocus = triggerRef.current?.parentElement?.contains(document.activeElement);
      setOpen(false);
      if (hadFocus) { escaped.current = true; triggerRef.current?.focus(); escaped.current = false; }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div
      className={`navq-item navq-has-menu${open ? " is-open" : ""}${active ? " is-active" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => { if (!escaped.current) setOpen(true); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <a ref={triggerRef} href={href} aria-expanded={open} aria-controls={panelId}>{label} <span className="navq-plus" aria-hidden="true" /></a>
      <div className="navq-dropdown" id={panelId}>
        {items.map(([l, h, blurb]) => (
          <a key={h} href={h}><b>{l}</b><small>{blurb}</small></a>
        ))}
      </div>
    </div>
  );
}

function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button className="navq-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="site-mobile-menu" onClick={onToggle}>
      <span className={open ? "open" : ""} />
    </button>
  );
}

function Chevron() {
  return (
    <svg className="navq-chevron" viewBox="0 0 8 12" aria-hidden="true"><path d="M2 1.5 6.5 6 2 10.5" /></svg>
  );
}
