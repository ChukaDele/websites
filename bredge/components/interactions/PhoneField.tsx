"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js";

// libphonenumber (formatting, validation, the country list) is ~80 KB, so it is
// not part of the page bundle. It loads when the visitor first touches the form
// (any field), so it is always ready before a number can be typed and submitted. Until then the
// field shows exactly what the server rendered: US, +1, the raw input.
type Lib = typeof import("libphonenumber-js");
let libPromise: Promise<Lib> | null = null;
const loadLib = () => (libPromise ??= import("libphonenumber-js"));

export type PhoneValue = { display: string; e164: string; country: string; callingCode: string; valid: boolean };

function flag(iso: string) {
  try { return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))); } catch { return "🏳"; }
}

/** Default dial code from the visitor's locale. Runs only in an effect, so the
 *  server render and first client render always agree (US). */
function localeRegion({ getCountries }: Lib): CountryCode {
  try {
    const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    for (const loc of langs) {
      const region = new Intl.Locale(loc).region;
      if (region && getCountries().includes(region as CountryCode)) return region as CountryCode;
    }
  } catch { /* ignore */ }
  try {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone?.startsWith("Europe/London")) return "GB";
  } catch { /* ignore */ }
  return "US";
}

export function PhoneField({ onChange }: { onChange: (v: PhoneValue) => void }) {
  const [lib, setLib] = useState<Lib | null>(null);
  const [country, setCountry] = useState<CountryCode>("US");
  const [raw, setRaw] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Load the library on the first focus / press anywhere in the form: it is always
  // ready before a number can be typed, and costs nothing for visitors who only read.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      loadLib().then((l) => {
        if (cancelled) return;
        setLib(l);
        setCountry(localeRegion(l));
      }).catch(() => { /* offline: the raw number is still sent */ });
    };
    const scope: HTMLElement | Document = wrapRef.current?.closest("form") ?? document;
    const onFirst = () => { scope.removeEventListener("focusin", onFirst); scope.removeEventListener("pointerdown", onFirst); load(); };
    scope.addEventListener("focusin", onFirst);
    scope.addEventListener("pointerdown", onFirst);
    return () => {
      cancelled = true;
      scope.removeEventListener("focusin", onFirst);
      scope.removeEventListener("pointerdown", onFirst);
    };
  }, []);

  const names = useMemo(() => {
    if (!lib) return [];
    let dn: Intl.DisplayNames | undefined;
    try { dn = new Intl.DisplayNames(["en"], { type: "region" }); } catch { dn = undefined; }
    return lib.getCountries().map((iso) => ({ iso, name: dn?.of(iso) || iso, code: lib.getCountryCallingCode(iso) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [lib]);

  useEffect(() => {
    // Paste of a full +E.164 number: infer country.
    if (lib && raw.trim().startsWith("+")) {
      const parsed = lib.parsePhoneNumberFromString(raw.trim());
      if (parsed?.country) queueMicrotask(() => setCountry(parsed.country as CountryCode));
    }
  }, [raw, lib]);

  useEffect(() => {
    // Before the library arrives nothing can be typed yet (any focus loads it),
    // so there is nothing to report; the parent keeps its empty initial value.
    if (!lib) return;
    const parsed = lib.parsePhoneNumberFromString(raw, country);
    const display = raw.trim().startsWith("+") ? raw.trim() : new lib.AsYouType(country).input(raw);
    onChange({
      display,
      e164: parsed?.number || "",
      country: parsed?.country || country,
      callingCode: `+${lib.getCountryCallingCode(country)}`,
      valid: !!parsed?.isValid(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, country, lib]);

  // Country picker: a combobox (search input) driving a listbox. Focus stays in
  // the search field; the highlighted option is announced via
  // aria-activedescendant. Opens below the control, or above it when the
  // viewport has no room, and never wider than the viewport.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<{ side: "top" | "bottom"; left: number; width: number; maxH: number }>({ side: "bottom", left: 0, width: 340, maxH: 320 });
  const uid = useId();
  const listId = `${uid}-countries`;
  const optId = (iso: string) => `${uid}-opt-${iso}`;

  const close = (refocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (refocus) triggerRef.current?.focus();
  };

  const openMenu = () => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (box) {
      const vw = window.innerWidth, vh = window.innerHeight;
      const width = Math.min(340, vw - 24);
      const below = vh - box.bottom - 12, above = box.top - 12;
      const side = below < 260 && above > below ? "top" : "bottom";
      const maxH = Math.max(180, Math.min(320, (side === "bottom" ? below : above) - 6));
      // Shift left if the panel would run past the right edge.
      const left = Math.min(0, vw - 12 - (box.left + width));
      setPlace({ side, left, width, maxH });
    }
    // Highlight the current country when the list opens.
    setActive(Math.max(0, names.findIndex((c) => c.iso === country)));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDoc = (e: PointerEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); } };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const display = !lib || raw.trim().startsWith("+") ? raw : new lib.AsYouType(country).input(raw);
  // The server and the first client render show +1 (US) before the library loads.
  const dial = lib ? lib.getCountryCallingCode(country) : "1";
  // Match on name, or on dial code when the query has digits (an empty digit
  // string would otherwise match every country).
  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");
  const filtered = q
    ? names.filter((c) => c.name.toLowerCase().includes(q) || (qDigits !== "" && c.code.startsWith(qDigits)))
    : names;
  const invalid = !!lib && touched && raw.trim().length > 3 && !lib.parsePhoneNumberFromString(raw, country)?.isValid();

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (iso: string) => { setCountry(iso as CountryCode); close(true); };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const last = filtered.length - 1;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(last, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "PageDown") { e.preventDefault(); setActive((i) => Math.min(last, i + 8)); }
    else if (e.key === "PageUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 8)); }
    else if (e.key === "Home" && e.ctrlKey) { e.preventDefault(); setActive(0); }
    else if (e.key === "End" && e.ctrlKey) { e.preventDefault(); setActive(last); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) choose(filtered[active].iso); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === "Tab") { close(false); }
  };

  const countryName = names.find((c) => c.iso === country)?.name || country;

  return (
    <div className="field">
      <label htmlFor="phone-input">Phone <small className="optional">(optional)</small></label>
      <div className={`phone-control${invalid ? " invalid" : ""}`} ref={wrapRef}>
        <button
          ref={triggerRef}
          type="button"
          className="phone-country"
          aria-label={`Country code: ${countryName} +${dial}. Change country`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => (open ? close(false) : openMenu())}
          onKeyDown={(e) => { if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) { e.preventDefault(); openMenu(); } }}
        >
          <span className="flag" aria-hidden="true">{flag(country)}</span>
          <span className="dial">+{dial}</span>
          <svg className="dd-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" /></svg>
        </button>
        <input
          id="phone-input"
          className="phone-number"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone number"
          value={display}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "phone-error" : undefined}
        />
        {open && (
          <div
            className="phone-menu dd-panel"
            data-side={place.side}
            style={{ left: place.left, width: place.width, maxHeight: place.maxH, ...(place.side === "top" ? { top: "auto", bottom: "calc(100% + 6px)" } : null) }}
          >
            <input
              ref={searchRef}
              className="phone-search"
              role="combobox"
              aria-label="Search country or code"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={filtered[active] ? optId(filtered[active].iso) : undefined}
              placeholder="Search country or code"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onSearchKey}
            />
            <div className="phone-list" id={listId} role="listbox" aria-label="Countries" ref={listRef}>
              {filtered.map((c, i) => (
                // Options are pointer targets only; the keyboard drives them from the search combobox.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                  key={c.iso}
                  id={optId(c.iso)}
                  role="option"
                  tabIndex={-1}
                  data-index={i}
                  data-active={i === active || undefined}
                  aria-selected={c.iso === country}
                  className="phone-opt dd-option"
                  onPointerMove={() => { if (i !== active) setActive(i); }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(c.iso)}
                >
                  <span className="flag" aria-hidden="true">{flag(c.iso)}</span>
                  <span className="cname">{c.name}</span>
                  <span className="dial">+{c.code}</span>
                  <svg className="dd-check" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.5 6 10.5 11 4" /></svg>
                </div>
              ))}
              {!filtered.length && <p className="dd-empty">No country matches “{query}”.</p>}
            </div>
          </div>
        )}
      </div>
      {invalid && <span className="field-error" id="phone-error" role="status">Check that phone number.</span>}
    </div>
  );
}
