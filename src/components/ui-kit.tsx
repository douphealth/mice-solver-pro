import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Check, ChevronRight, Info, ShieldCheck } from "lucide-react";
import { SOURCE_BY_ID, sourceBadge, type SourceId } from "@/lib/sources";
import type { ActionItem } from "@/lib/plan";

export function SourceBadge({ id }: { id: SourceId }) {
  const s = SOURCE_BY_ID[id];
  return (
    <a className="src-badge" href={s.url} target="_blank" rel="noopener noreferrer" title={`Source: ${s.label}`} aria-label={`Source: ${s.label} (opens in a new tab)`}>
      {sourceBadge(id)}
    </a>
  );
}

export function Sources({ ids }: { ids: SourceId[] }) {
  return <span className="inline-flex flex-wrap items-center gap-1.5">{ids.map(id => <SourceBadge key={id} id={id} />)}</span>;
}

export function ProgressRing({ value, total, size = 56, label }: { value: number; total: number; size?: number; label?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${pct}% complete`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(42 22% 85%)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(152 48% 21%)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .5s ease" }} />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums">{pct}%</span>
    </div>
  );
}

export function ProgressBar({ value, total, className = "" }: { value: number; total: number; className?: string }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label="Progress">
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

const TONES = {
  info: { box: "border-primary/20 bg-primary/5", icon: "text-primary", Icon: Info },
  safety: { box: "border-destructive/30 bg-destructive/5", icon: "text-destructive", Icon: AlertTriangle },
  success: { box: "border-success/30 bg-success/5", icon: "text-success", Icon: ShieldCheck },
  note: { box: "border-[hsl(33_90%_42%/0.35)] bg-[hsl(41_100%_60%/0.14)]", icon: "text-[hsl(33_90%_36%)]", Icon: Info },
} as const;

export function Callout({ tone = "info", title, children, className = "" }: { tone?: keyof typeof TONES; title?: string; children: ReactNode; className?: string }) {
  const t = TONES[tone];
  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm leading-relaxed ${t.box} ${className}`} role={tone === "safety" ? "note" : undefined}>
      <t.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${t.icon}`} aria-hidden="true" />
      <div>{title && <p className="mb-1 font-semibold">{title}</p>}<div className="text-foreground/85">{children}</div></div>
    </div>
  );
}

export function CheckRow({ id, checked, onToggle, title, children, source, learnMore, tone, meta }: {
  id: string; checked: boolean; onToggle: (id: string) => void; title: string; children?: ReactNode;
  source?: SourceId; learnMore?: ActionItem["learnMore"]; tone?: "safety" | "normal"; meta?: ReactNode;
}) {
  return (
    <li className={`rounded-xl border p-4 transition-colors ${checked ? "bg-secondary/50" : tone === "safety" ? "border-destructive/30 bg-destructive/[0.04]" : "bg-card"}`}>
      <div className="flex gap-3">
        <button type="button" role="checkbox" aria-checked={checked} aria-labelledby={`${id}-title`} onClick={() => onToggle(id)} className="check-box mt-0.5" data-state={checked ? "on" : "off"}>
          {checked && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <p id={`${id}-title`} className={`font-semibold leading-snug ${checked ? "text-muted-foreground line-through decoration-1" : ""}`}>{title}</p>
            <div className="flex items-center gap-2">{meta}{source && <SourceBadge id={source} />}</div>
          </div>
          {children && <div className="mt-1.5 text-sm leading-relaxed text-foreground/80">{children}</div>}
          {learnMore && <Link to={learnMore.to} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{learnMore.label}<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
        </div>
      </div>
    </li>
  );
}

export function SectionHeading({ id, eyebrow, title, children, align = "left" }: { id?: string; eyebrow?: string; title: string; children?: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={`mb-8 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 id={id} className="text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{children}</p>}
    </div>
  );
}

/** The one honest statement about scope, shown once per page in a calm, readable way. */
export function ScopeNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm leading-relaxed text-muted-foreground ${className}`}>
      <strong className="font-semibold text-foreground/80">What this is:</strong> a planning aid built on CDC and UC IPM guidance. <strong className="font-semibold text-foreground/80">What it isn't:</strong> an inspection, a diagnosis, a count of mice, a disease assessment or a promise of results.
    </p>
  );
}
