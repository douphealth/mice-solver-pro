import type { SourceId } from "./sources";

/** Shape of the paid content pack. The worker serves it only after Stripe confirms a paid, unrefunded purchase. */
export interface ProTask { id: string; text: string; source?: SourceId }
export interface ProMilestone { day: number; title: string; focus: string; tasks: ProTask[] }
export interface ProRoom {
  id: string;
  title: string;
  inspect: string[];
  trapping: string[];
  keep: string[];
  safety: string[];
  sources: SourceId[];
}
export interface MaterialRow { id: string; where: string; use: string; caution: string; avoid: string; sources: SourceId[] }
export interface SupplyItem { id: string; name: string; essential: boolean; why: string; criteria: string[]; query: string; sources: SourceId[] }
export interface SeasonBlock { id: string; title: string; when: string; tasks: ProTask[] }
export interface ProPack {
  version: string;
  milestones: ProMilestone[];
  dailyCheck: { fromDay: number; toDay: number; text: string; source: SourceId };
  rooms: Record<string, ProRoom>;
  materials: MaterialRow[];
  supplies: SupplyItem[];
  seasons: SeasonBlock[];
  trap: { maxSpacingFt: number; pairGapIn: string; rangeFt: number; sources: SourceId[]; baits: { name: string; note: string }[]; rules: string[]; avoid: string[] };
  escalation: { before: string[]; ask: string[]; document: string[] };
}

export interface Entitlement {
  active: boolean;
  /** Present when active. Masked for display, e.g. j***@example.com. */
  email?: string;
  purchasedAt?: string;
  reason?: "paid" | "unpaid" | "refunded" | "wrong_product" | "not_found" | "unavailable";
}
