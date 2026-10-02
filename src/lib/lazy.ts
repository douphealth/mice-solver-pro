import { lazy, type ComponentType } from "react";

const KEY = "mgg.chunk-reload";

/**
 * After a deploy, a tab that was opened earlier (or an edge that hasn't caught up) can ask for a hashed script that no longer exists.
 * Reload once to pick up the current build instead of leaving a blank page. The 15 s guard prevents reload loops.
 */
export function reloadOnce(): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 15000) return false;
    window.sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* storage blocked: still try once */ }
  window.location.reload();
  return true;
}

export function lazyRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (reloadOnce()) return new Promise<never>(() => { /* page is reloading */ });
      throw error;
    }
  });
}
