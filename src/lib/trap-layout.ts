export interface WallRun { id: string; label: string; feet: number }
export interface RunLayout { id: string; label: string; feet: number; positions: number[] }

export const MAX_RUN_FEET = 500;

/**
 * UC IPM: where house mice are active, space traps no more than about 10 feet apart.
 * Positions are evenly spaced along the wall at the midpoint of equal segments, so the gap between
 * neighbouring traps never exceeds `spacing`. This applies a spacing rule. It does not estimate how many mice are present.
 */
export function positionsForRun(feet: number, spacing = 10): number[] {
  if (!Number.isFinite(feet) || feet <= 0) return [];
  const length = Math.min(feet, MAX_RUN_FEET);
  const n = Math.max(1, Math.ceil(length / spacing));
  return Array.from({ length: n }, (_, i) => Math.round(((i + 0.5) * length) / n * 2) / 2);
}

export function layoutRuns(runs: WallRun[], spacing = 10): RunLayout[] {
  return runs.filter(r => r.feet > 0).map(r => ({ id: r.id, label: r.label || "Wall", feet: Math.min(r.feet, MAX_RUN_FEET), positions: positionsForRun(r.feet, spacing) }));
}

export function totalTraps(layout: RunLayout[], pairs: boolean): number {
  const positions = layout.reduce((n, r) => n + r.positions.length, 0);
  return pairs ? positions * 2 : positions;
}

export function sanitizeRuns(input: unknown): WallRun[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 20).flatMap((raw): WallRun[] => {
    if (!raw || typeof raw !== "object") return [];
    const r = raw as Record<string, unknown>;
    const feet = typeof r.feet === "number" && Number.isFinite(r.feet) ? Math.min(MAX_RUN_FEET, Math.max(0, r.feet)) : 0;
    return [{ id: typeof r.id === "string" ? r.id.slice(0, 40) : crypto.randomUUID(), label: typeof r.label === "string" ? r.label.slice(0, 60) : "", feet }];
  });
}
