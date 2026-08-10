"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const services = [
  ["Services overview", "/services", "Everything we do, from source to decision"],
  ["Embedded Data Team", "/services/embedded-data-team", "Ongoing capability inside your business"],
  ["Data Projects", "/services/data-projects", "One defined problem, delivered in full"],
  ["Data Diagnostic", "/data-diagnostic", "Find the highest-leverage place to start"],
];

const primary = [
  ["How we work", "/how-we-work"],
  ["Insights", "/insights"],
  ["About", "/about"],
];

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

export function SiteHeader({ variant = "solid" }: { variant?: "solid" | "overlay" }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollState, setScrollState] = useState<"top" | "hidden" | "compact">("top");
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname() || "/";
  const servicesActive = pathname.startsWith("/services") || pathname === "/data-diagnostic";
  const lock = servicesOpen || menuOpen;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Never hide while a menu is open — derived, so no setState-in-effect.
  const appliedState = lock && scrollState === "hidden" ? "compact" : scrollState;

  // Adaptive header: hide on meaningful scroll-down, return compact on scroll-up.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lastY = window.scrollY;
    let acc = 0;
    const THRESH = 16;   // accumulated movement to flip state (defeats trackpad noise)
    const HIDE_AT = 140; // don't hide until past the fold-ish
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      if ((dy > 0 && acc < 0) || (dy < 0 && acc > 0)) acc = 0; // reset on direction change
      acc += dy;
      const focusInside = headerRef.current?.contains(document.activeElement);
      if (y < 80) setScrollState("top");
      else if (lock || focusInside) setScrollState((s) => (s === "top" ? "compact" : s));
      else if (acc > THRESH && y > HIDE_AT) { setScrollState("hidden"); acc = 0; }
      else if (acc < -THRESH) { setScrollState("compact"); acc = 0; }
      lastY = y;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lock]);

  return (
    <>
    <header ref={headerRef} className={`site-header${variant === "solid" ? " site-header--solid" : ""} is-${appliedState}`}>
      <a className="brand" href="/" aria-label="The Bredge home"><img src="/brand/bredge-logo.svg" alt="The Bredge" width="80" height="31" /></a>

      <nav className="site-nav" aria-label="Primary navigation">
        <div
          className={`nav-item has-menu${servicesOpen ? " open" : ""}${servicesActive ? " active" : ""}`}
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
          onFocus={() => setServicesOpen(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false); }}
        >
          <a href="/services" aria-haspopup="true" aria-expanded={servicesOpen}>Services <span className="chev" aria-hidden="true">▾</span></a>
          <div className="nav-dropdown" role="menu">
            {services.map(([label, href, blurb]) => (
              <a key={href} href={href} role="menuitem"><b>{label}</b><small>{blurb}</small></a>
            ))}
          </div>
        </div>
        {primary.map(([label, href]) => <a key={href} className={`nav-item${pathname === href ? " active" : ""}`} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</a>)}
        <span className="nav-item nav-soon" aria-disabled="true" title="Coming soon">Work <em>Soon</em></span>
      </nav>

      <a className="button button-small header-cta" href="/schedule">Schedule a call <Arrow /></a>

      <button className="nav-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
        <span className={menuOpen ? "open" : ""} />
      </button>
    </header>

    {menuOpen && (
      <div className="mobile-menu">
        <p className="mobile-eyebrow">SERVICES</p>
        {services.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        <p className="mobile-eyebrow">COMPANY</p>
        {primary.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        <span className="mobile-soon">Work <em>Coming soon</em></span>
        <a className="button mobile-cta" href="/schedule" onClick={() => setMenuOpen(false)}>Schedule a call <Arrow /></a>
      </div>
    )}
    </>
  );
}
