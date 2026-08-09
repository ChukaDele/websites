"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

const services = [
  ["Services overview", "/services", "Everything we do, from source to decision"],
  ["Embedded Data Team", "/services/embedded-data-team", "Ongoing capability inside your business"],
  ["Data Projects", "/services/data-projects", "One defined problem, delivered in full"],
  ["Data Diagnostic", "/data-diagnostic", "Find the highest-leverage place to start"],
];

const primary = [
  ["How we work", "/how-we-work"],
  ["About", "/about"],
];

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

export function SiteHeader({ variant = "solid" }: { variant?: "solid" | "overlay" }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
    <header className={`site-header${variant === "solid" ? " site-header--solid" : ""}`}>
      <a className="brand" href="/" aria-label="The Bredge home"><img src="/brand/bredge-logo.svg" alt="The Bredge" /></a>

      <nav className="site-nav" aria-label="Primary navigation">
        <div
          className={`nav-item has-menu${servicesOpen ? " open" : ""}`}
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
        >
          <a href="/services" aria-haspopup="true" aria-expanded={servicesOpen}>Services <span className="chev" aria-hidden="true">▾</span></a>
          <div className="nav-dropdown" role="menu">
            {services.map(([label, href, blurb]) => (
              <a key={href} href={href} role="menuitem"><b>{label}</b><small>{blurb}</small></a>
            ))}
          </div>
        </div>
        {primary.map(([label, href]) => <a key={href} className="nav-item" href={href}>{label}</a>)}
        <span className="nav-item nav-soon" aria-disabled="true" title="Coming soon">Work <em>Soon</em></span>
      </nav>

      <a className="button button-small header-cta" href="/contact">Talk to us <Arrow /></a>

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
        <a className="button mobile-cta" href="/contact" onClick={() => setMenuOpen(false)}>Talk to us <Arrow /></a>
      </div>
    )}
    </>
  );
}
