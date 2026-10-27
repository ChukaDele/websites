"use client";

import { Children, isValidElement, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FunnelSimple, X } from "@phosphor-icons/react";

/**
 * The slicer row of a dashboard page, with a phone layout (Power BI mobile
 * style). Wide boards show the row exactly as before. When the board is
 * narrow (`@container db (max-width:560px)`, see app/studio.css) the row
 * collapses to one "Filters" button with the active-filter count, the active
 * filters stay visible as removable chips, and the slicers themselves open in
 * a bottom sheet. The slicers are the same elements rendered a second time in
 * the sheet, so they stay controlled by the board's own state.
 *
 * Active count: every FilterChip in the row, plus every slicer or select whose
 * value differs from the one it had when the board first rendered.
 */

type Kind = { dbKind?: "slicer" | "chip" };
type Val = { key: string; value: unknown; name: string; text: (v: unknown) => string; reset: (v: unknown) => void };
type Probe = { chips: number; vals: Val[] };
type AnyProps = { label?: string; value?: unknown; children?: ReactNode; onChange?: (v: unknown) => void };

const textOf = (n: ReactNode): string => {
  let t = "";
  Children.forEach(n, (c) => { if (typeof c === "string" || typeof c === "number") t += c; else if (isValidElement(c)) t += textOf((c.props as AnyProps).children); });
  return t.trim();
};

function probe(node: ReactNode, out: Probe, name = "") {
  Children.forEach(node, (c) => {
    if (!isValidElement(c)) return;
    const kind = typeof c.type === "function" ? (c.type as Kind).dbKind : undefined;
    const props = c.props as AnyProps;
    if (kind === "chip") out.chips += 1;
    else if (kind === "slicer") out.vals.push({ key: `s:${props.label}`, value: props.value, name: props.label ?? "", text: String, reset: (v) => props.onChange?.(v) });
    else if (c.type === "select") {
      const opts: Array<[unknown, string]> = [];
      Children.forEach(props.children, (o) => { if (isValidElement(o)) { const op = o.props as AnyProps; opts.push([op.value, textOf(op.children)]); } });
      out.vals.push({
        key: `sel:${out.vals.length}`, value: props.value, name,
        text: (v) => opts.find(([ov]) => String(ov) === String(v))?.[1] ?? String(v),
        reset: (v) => props.onChange?.({ target: { value: v }, currentTarget: { value: v } }),
      });
    } else if (props.children) {
      // A dropdown pill: <label><span>Name</span><select/></label>.
      let label = name;
      if (c.type === "label") Children.forEach(props.children, (k) => { if (isValidElement(k) && k.type === "span" && !label) label = textOf((k.props as AnyProps).children); });
      probe(props.children, out, label);
    }
  });
}

export function FilterBar({ children, className = "", title = "Filters" }: { children: ReactNode; className?: string; title?: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  // Defaults: the values on first render. Keys seen later (a slicer that only
  // appears in some states) take the value they first appear with.
  const [seen] = useState(() => new Map<string, unknown>());

  const p: Probe = { chips: 0, vals: [] };
  probe(children, p);
  for (const v of p.vals) if (!seen.has(v.key)) seen.set(v.key, v.value);
  const changed = p.vals.filter((v) => seen.get(v.key) !== v.value);
  const active = p.chips + changed.length;

  const close = useCallback(() => setOpen(false), []);
  const hasControls = p.vals.length > 0;

  return (
    <>
      <div className={`db-filters${className ? ` ${className}` : ""}${hasControls ? "" : " no-controls"}`}>
        {hasControls && (
          <button ref={btnRef} type="button" className="db-fbtn" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
            <FunnelSimple size={16} weight="bold" aria-hidden="true" />{title}
            {active > 0 && <i aria-label={`${active} active`}>{active}</i>}
          </button>
        )}
        {/* Phones: a changed slicer shows as a chip too; the cross puts it back. */}
        {changed.map((v) => (
          <button key={v.key} type="button" className="db-filter db-fchip" onClick={() => v.reset(seen.get(v.key))}>
            {v.name ? `${v.name}: ` : ""}{v.text(v.value)} <X size={11} weight="bold" aria-hidden="true" /><span className="sr-only">Reset {v.name || "filter"}</span>
          </button>
        ))}
        {children}
      </div>
      {open && <Sheet title={title} onClose={close} returnTo={btnRef}>{children}</Sheet>}
    </>
  );
}

const FOCUSABLE = "button:not([disabled]), select:not([disabled]), input:not([disabled]):not([tabindex='-1']), a[href], [tabindex]:not([tabindex='-1'])";

function Sheet({ title, children, onClose, returnTo }: { title: string; children: ReactNode; onClose: () => void; returnTo: React.RefObject<HTMLButtonElement | null> }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const id = useId();

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => { onClose(); returnTo.current?.focus(); }, reduce ? 120 : 180);
  }, [onClose, returnTo]);

  useEffect(() => {
    const panel = panelRef.current;
    panel?.querySelector(".db-sheet-body")?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    // Lock the page behind the sheet without moving it (no layout shift).
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, pad: html.style.paddingRight };
    html.style.overflow = "hidden";
    if (gap > 0) html.style.paddingRight = `${gap}px`;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); dismiss(); return; }
      if (e.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const a = items[0], z = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === a || !panel.contains(document.activeElement))) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && (document.activeElement === z || !panel.contains(document.activeElement))) { e.preventDefault(); a.focus(); }
    };
    // A wide screen has no Filters button: close rather than strand the sheet.
    const onResize = () => { if (returnTo.current && returnTo.current.offsetParent === null) onClose(); };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.pad;
    };
  }, [dismiss, onClose, returnTo]);

  return createPortal(
    <div className={`db db-sheet${closing ? " is-closing" : ""}`}>
      <div className="db-sheet-scrim" aria-hidden="true" onClick={dismiss} />
      <div ref={panelRef} className="db-sheet-panel" role="dialog" aria-modal="true" aria-labelledby={id}>
        <span className="db-sheet-handle" aria-hidden="true" />
        <header>
          <b id={id}>{title}</b>
          <button type="button" className="db-sheet-x" aria-label="Close filters" onClick={dismiss}><X size={16} weight="bold" /></button>
        </header>
        <div className="db-sheet-body">{children}</div>
        <footer><button type="button" className="db-sheet-done" onClick={dismiss}>Show results</button></footer>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Phone KPI cards sit two to a row. A value that would not fit on one line in
 * half the row (a long currency figure, "Cash generative") takes the full row
 * instead of wrapping. The phone layout sets `--db-phone:1` on KPI grids (see
 * app/studio.css); everywhere else this removes its marks and does nothing.
 * It also opens charts that scroll inside their card on phones (marked with
 * `--db-scroll-end:1`) at the newest data.
 */
export function usePhoneKpiFit(ref: React.RefObject<HTMLElement | null>, key: unknown) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let raf = 0;
    const run = () => {
      raf = 0;
      // Charts that scroll inside their card on phones open on the newest data.
      root.querySelectorAll<HTMLElement>(".pc-sa-cols").forEach((el) => {
        if (getComputedStyle(el).getPropertyValue("--db-scroll-end").trim() !== "1") { delete el.dataset.dbEnd; return; }
        if (el.dataset.dbEnd || el.scrollWidth <= el.clientWidth) return;
        el.dataset.dbEnd = "1";
        el.scrollLeft = el.scrollWidth;
      });
      root.querySelectorAll<HTMLElement>(".db-kpi").forEach((kpi) => {
        const grid = kpi.parentElement;
        const value = kpi.querySelector<HTMLElement>(":scope > strong");
        if (!grid || !value) return;
        const gs = getComputedStyle(grid);
        if (gs.getPropertyValue("--db-phone").trim() !== "1") { kpi.classList.remove("is-wide"); return; }
        const ks = getComputedStyle(kpi);
        const half = (grid.clientWidth - (parseFloat(gs.columnGap) || 0)) / 2 - parseFloat(ks.paddingLeft) - parseFloat(ks.paddingRight);
        kpi.classList.toggle("is-wide", value.scrollWidth > half + 1);
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(run); };
    const ro = new ResizeObserver(queue);
    ro.observe(root);
    const mo = new MutationObserver(queue);
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    queue();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); };
  }, [ref, key]);
}

/**
 * Phones only (app/studio.css shows it): a table keeps its two to four most
 * important columns; this toggles the rest back in, with the table scrolling
 * sideways inside its own card. Marks the card with `is-allcols`.
 */
export function AllColumns() {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const card = ref.current?.closest(".db-card");
    card?.classList.toggle("is-allcols", on);
    return () => card?.classList.remove("is-allcols");
  }, [on]);
  return <button ref={ref} type="button" className="db-allcols" aria-pressed={on} onClick={() => setOn((v) => !v)}>{on ? "Fewer columns" : "Show all columns"}</button>;
}
