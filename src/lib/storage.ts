import { useCallback, useEffect, useState } from "react";

/** localStorage can throw (private mode, blocked storage). Every access is guarded so the app always renders. */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("mgg-storage", { detail: key }));
    return true;
  } catch {
    return false;
  }
}
export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("mgg-storage", { detail: key }));
  } catch { /* nothing to remove */ }
}

export const KEYS = {
  answers: "mgg.answers.v2",
  checks: "mgg.checks.v1",
  log: "mgg.log.v1",
  pro: "mgg.pro.v1",
  proPack: "mgg.pro.pack.v1",
  start: "mgg.start.v1",
  layout: "mgg.layout.v1",
} as const;

/** useState that persists to localStorage and stays in sync across components and tabs. */
export function useStored<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readJSON<T>(key, initial));
  useEffect(() => {
    const sync = (e: Event) => {
      const changed = e instanceof StorageEvent ? e.key : (e as CustomEvent).detail;
      if (changed === key || changed === null) setValue(readJSON<T>(key, initial));
    };
    window.addEventListener("mgg-storage", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("mgg-storage", sync); window.removeEventListener("storage", sync); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === "function" ? (next as (p: T) => T)(readJSON<T>(key, initial)) : next;
    setValue(resolved);
    writeJSON(key, resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [value, set];
}

/** Checklist completion: a map of item id to true. Shared by the plan, tools and Pro workspace. */
export function useChecks(): { checked: Record<string, boolean>; toggle: (id: string) => void; count: (ids: string[]) => number; reset: (ids: string[]) => void } {
  const [checked, setChecked] = useStored<Record<string, boolean>>(KEYS.checks, {});
  const toggle = useCallback((id: string) => setChecked(prev => {
    const next = { ...prev };
    if (next[id]) delete next[id]; else next[id] = true;
    return next;
  }), [setChecked]);
  const count = useCallback((ids: string[]) => ids.filter(id => checked[id]).length, [checked]);
  const reset = useCallback((ids: string[]) => setChecked(prev => {
    const next = { ...prev };
    ids.forEach(id => delete next[id]);
    return next;
  }), [setChecked]);
  return { checked, toggle, count, reset };
}
