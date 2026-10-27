"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * State that survives a reload, kept in localStorage under one key.
 * Every storage call is wrapped: in a private window or with storage blocked
 * the value lives in memory for the session and the tool still works.
 * The server snapshot is always the initial value, so markup hydrates cleanly.
 */
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function readRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

const kind = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
const isPlain = (v: unknown): v is Record<string, unknown> => kind(v) === "object";

/**
 * Stored values come from an earlier release, another tab or a hand-edited
 * devtools session, so trust nothing: every field must have the same kind as
 * the initial value (string stays string, array stays array), array items are
 * checked against an initial item of the same kind, and anything else falls
 * back to the initial value. Without this, one stale or tampered field
 * (e.g. `stages: "x"`) crashed the tool on every visit, with no way to reset.
 */
function sanitize(v: unknown, init: unknown): unknown {
  if (init === null || init === undefined) return v;
  if (kind(v) !== kind(init)) return init;
  if (Array.isArray(init)) {
    if (!init.length) return (v as unknown[]).filter((x) => x !== null && x !== undefined);
    return (v as unknown[]).flatMap((x) => {
      const t = init.find((i) => kind(i) === kind(x));
      return t === undefined ? [] : [sanitize(x, t)];
    });
  }
  if (isPlain(init)) {
    const src = v as Record<string, unknown>;
    const out: Record<string, unknown> = { ...init };
    const isMap = Object.keys(init).length === 0;
    for (const k of Object.keys(src)) {
      if (k in init) out[k] = sanitize(src[k], init[k]);
      // Free-form maps ({ [id]: answer }): drop null/array entries nothing renders.
      else if (isMap) { if (["string", "number", "boolean", "object"].includes(kind(src[k]))) out[k] = src[k]; }
      else out[k] = src[k];
    }
    return out;
  }
  return v;
}

function parse<T>(raw: string | null, initial: T): T {
  if (raw == null) return initial;
  try {
    return sanitize(JSON.parse(raw), initial) as T;
  } catch { return initial; }
}

export function useStoredState<T>(key: string, initial: T) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = useMemo(() => parse(raw, initial), [raw, initial]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    const prev = parse(readRaw(key), initial);
    const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
    const s = JSON.stringify(v);
    memory.set(key, s);
    try { window.localStorage.setItem(key, s); } catch { /* storage blocked: memory only */ }
    listeners.forEach((l) => l());
  }, [key, initial]);

  const reset = useCallback(() => {
    memory.delete(key);
    try { window.localStorage.removeItem(key); } catch { memory.set(key, JSON.stringify(initial)); }
    listeners.forEach((l) => l());
  }, [key, initial]);

  return [value, set, reset] as const;
}
