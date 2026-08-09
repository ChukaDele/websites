"use client";

import { useEffect, useRef, useState } from "react";

export function PrimaryNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const updateActive = () => setActive(window.location.hash.replace("#", ""));
    updateActive();
    window.addEventListener("hashchange", updateActive);
    return () => window.removeEventListener("hashchange", updateActive);
  }, []);

  const closeSoon = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      closeTimer.current = window.setTimeout(() => setOpen(false), 120);
    }
  };

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  const isServicesActive = active === "services" || active === "work";

  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      <a className="nav-link" data-active={active === "work"} href="#work">Work</a>
      <div className="nav-services" onMouseEnter={() => { cancelClose(); setOpen(true); }} onMouseLeave={closeSoon} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
        <button className="nav-link nav-services-trigger" data-active={isServicesActive} type="button" aria-expanded={open} aria-controls="services-menu" onClick={() => setOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
          Services <span className="nav-chevron" aria-hidden="true">↓</span>
        </button>
        <div className="services-menu" id="services-menu" data-open={open}>
          <a href="#services" onClick={() => setOpen(false)}>Capabilities</a>
          <a href="#work" onClick={() => setOpen(false)}>Projects</a>
          <a href="#contact" onClick={() => setOpen(false)}>Talk to us</a>
        </div>
      </div>
      <a className="nav-link" data-active={active === "practice"} href="#practice">How we work</a>
    </nav>
  );
}
