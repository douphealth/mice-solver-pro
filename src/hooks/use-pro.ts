import { useCallback, useEffect, useRef, useState } from "react";
import { loadProPack } from "@/lib/api";
import { KEYS, readJSON, removeKey, writeJSON } from "@/lib/storage";
import type { Entitlement, ProPack } from "@/lib/pro-types";

interface StoredSession { sessionId: string; savedAt: string }
interface StoredPack { sessionId: string; savedAt: string; pack: ProPack; entitlement: Entitlement }

export type ProStatus = "none" | "checking" | "active" | "denied" | "error";
export interface ProState {
  status: ProStatus;
  pack: ProPack | null;
  entitlement: Entitlement | null;
  sessionId: string | null;
  /** True when the pack came from this device's cache because the server couldn't be reached. */
  offline: boolean;
  lastVerified: string | null;
  message: string;
  refresh: () => Promise<void>;
  activate: (sessionId: string) => void;
  signOut: () => void;
}

/**
 * Pro access is never decided in the browser. The stored session id is sent to the server on every visit;
 * the content pack is delivered only if Stripe still shows a paid, unrefunded purchase.
 */
export function usePro(): ProState {
  const [sessionId, setSessionId] = useState<string | null>(() => readJSON<StoredSession | null>(KEYS.pro, null)?.sessionId ?? null);
  const [status, setStatus] = useState<ProStatus>(sessionId ? "checking" : "none");
  const [pack, setPack] = useState<ProPack | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [offline, setOffline] = useState(false);
  const [lastVerified, setLastVerified] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const run = useRef(0);

  const refresh = useCallback(async () => {
    if (!sessionId) { setStatus("none"); return; }
    const mine = ++run.current;
    setStatus("checking"); setMessage("");
    const res = await loadProPack(sessionId);
    if (mine !== run.current) return;
    if (res.ok) {
      const now = new Date().toISOString();
      writeJSON(KEYS.proPack, { sessionId, savedAt: now, pack: res.data.pack, entitlement: res.data.entitlement } satisfies StoredPack);
      setPack(res.data.pack); setEntitlement(res.data.entitlement); setOffline(false); setLastVerified(now); setStatus("active");
      return;
    }
    if (res.status === 402 || res.status === 400) {
      removeKey(KEYS.proPack);
      setPack(null); setEntitlement(res.data?.entitlement ?? { active: false, reason: "not_found" }); setStatus("denied");
      setMessage(res.data?.entitlement?.reason === "refunded" ? "This purchase was refunded, so Pro access has ended." : "We couldn't match this link to a completed Pro purchase.");
      return;
    }
    const cached = readJSON<StoredPack | null>(KEYS.proPack, null);
    if (cached && cached.sessionId === sessionId && cached.pack?.milestones) {
      setPack(cached.pack); setEntitlement(cached.entitlement); setOffline(true); setLastVerified(cached.savedAt); setStatus("active");
      setMessage(res.message);
      return;
    }
    setStatus("error"); setMessage(res.message);
  }, [sessionId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const activate = useCallback((id: string) => {
    writeJSON(KEYS.pro, { sessionId: id, savedAt: new Date().toISOString() } satisfies StoredSession);
    setSessionId(id);
  }, []);
  const signOut = useCallback(() => {
    removeKey(KEYS.pro); removeKey(KEYS.proPack);
    setSessionId(null); setPack(null); setEntitlement(null); setStatus("none"); setOffline(false);
  }, []);

  return { status, pack, entitlement, sessionId, offline, lastVerified, message, refresh, activate, signOut };
}
