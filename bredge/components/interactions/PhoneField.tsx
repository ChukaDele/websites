"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export type PhoneValue = { display: string; e164: string; country: string; callingCode: string; valid: boolean };

function flag(iso: string) {
  try { return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))); } catch { return "🏳"; }
}

function localeRegion(): CountryCode {
  try {
    const loc = navigator.language || "en-GB";
    const region = new Intl.Locale(loc).maximize().region;
    if (region && getCountries().includes(region as CountryCode)) return region as CountryCode;
  } catch { /* ignore */ }
  return "GB";
}

export function PhoneField({ onChange }: { onChange: (v: PhoneValue) => void }) {
  const [country, setCountry] = useState<CountryCode>("GB");
  const [raw, setRaw] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const names = useMemo(() => {
    let dn: Intl.DisplayNames | undefined;
    try { dn = new Intl.DisplayNames(["en"], { type: "region" }); } catch { dn = undefined; }
    return getCountries().map((iso) => ({ iso, name: dn?.of(iso) || iso, code: getCountryCallingCode(iso) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => { queueMicrotask(() => setCountry(localeRegion())); }, []);

  useEffect(() => {
    // Paste of a full +E.164 number → infer country.
    if (raw.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(raw.trim());
      if (parsed?.country) queueMicrotask(() => setCountry(parsed.country as CountryCode));
    }
  }, [raw]);

  useEffect(() => {
    const parsed = parsePhoneNumberFromString(raw, country);
    const display = raw.trim().startsWith("+") ? raw.trim() : new AsYouType(country).input(raw);
    onChange({
      display,
      e164: parsed?.number || "",
      country: parsed?.country || country,
      callingCode: `+${getCountryCallingCode(country)}`,
      valid: !!parsed?.isValid(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, country]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const display = raw.trim().startsWith("+") ? raw : new AsYouType(country).input(raw);
  const filtered = query
    ? names.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.includes(query.replace(/\D/g, "")))
    : names;
  const invalid = touched && raw.trim().length > 3 && !parsePhoneNumberFromString(raw, country)?.isValid();

  return (
    <div className="field">
      <label htmlFor="phone-input">Phone <i aria-hidden="true">*</i></label>
      <div className={`phone-control${invalid ? " invalid" : ""}`} ref={wrapRef}>
        <button type="button" className="phone-country" aria-label="Select country" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span className="flag" aria-hidden="true">{flag(country)}</span>
          <span className="dial">+{getCountryCallingCode(country)}</span>
          <span className="chev" aria-hidden="true">▾</span>
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
        />
        {open && (
          <div className="phone-menu" role="listbox">
            <input className="phone-search" ref={(el) => el?.focus()} placeholder="Search country or code" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="phone-list">
              {filtered.map((c) => (
                <button type="button" key={c.iso} className="phone-opt" onClick={() => { setCountry(c.iso as CountryCode); setOpen(false); setQuery(""); }}>
                  <span className="flag" aria-hidden="true">{flag(c.iso)}</span>
                  <span className="cname">{c.name}</span>
                  <span className="dial">+{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {invalid && <span className="field-error">Check that phone number.</span>}
    </div>
  );
}
