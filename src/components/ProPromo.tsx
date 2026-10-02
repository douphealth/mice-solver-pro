import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck2, ClipboardList, Crown, FileText, LineChart, Phone, Ruler, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRO_NAME, PRO_PRICE_LABEL } from "@/lib/api";
import { KEYS, readJSON } from "@/lib/storage";

export const PRO_FEATURES = [
  { icon: CalendarCheck2, title: "30-day schedule with real dates", body: "Day-by-day tasks tied to your answers, with one-tap calendar reminders." },
  { icon: ClipboardList, title: "Room-by-room protocols", body: "Where to inspect, trap and store for each area you selected." },
  { icon: Ruler, title: "Trap layout helper", body: "Turn wall lengths into trap positions using UC IPM's spacing guidance." },
  { icon: LineChart, title: "Evidence log with weekly chart", body: "Record catches and new signs, spot trends and export to CSV." },
  { icon: ShoppingBasket, title: "Sealing materials and supply list", body: "What works, what doesn't, and what to look for when buying." },
  { icon: Phone, title: "When-to-call-a-pro kit", body: "A checklist of what to prepare and what to ask a provider." },
  { icon: FileText, title: "Print-ready Pro PDF workbook", body: "Your whole plan, schedule and log sheets in one document." },
];

export default function ProPromo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const hasSession = Boolean(readJSON<{ sessionId?: string } | null>(KEYS.pro, null)?.sessionId);
  return (
    <section className={`relative overflow-hidden rounded-3xl border-2 border-[hsl(38_88%_56%/0.5)] bg-card ${className}`} aria-labelledby="pro-promo-title">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient" />
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="pill mb-4 border-[hsl(33_90%_42%/0.4)] bg-[hsl(41_100%_60%/0.18)] text-[hsl(33_90%_28%)]"><Crown className="h-3.5 w-3.5" aria-hidden="true" />Optional upgrade</p>
          <h2 id="pro-promo-title" className="text-3xl font-bold leading-tight md:text-4xl">Take your plan further with the {PRO_NAME}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">Your free plan stays free. Pro adds the organisation that makes a month-long effort easier to stick to. It's a planning workspace, not a promise of results.</p>
          {!compact && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button asChild variant="premium" size="xl">
                <Link to="/pro">{hasSession ? "Open my Pro workspace" : `See what's inside · ${PRO_PRICE_LABEL}`}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </Button>
              <p className="text-sm text-muted-foreground">One-time payment through Stripe.<br />No subscription.</p>
            </div>
          )}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-label="What Pro includes">
          {(compact ? PRO_FEATURES.slice(0, 5) : PRO_FEATURES).map(f => (
            <li key={f.title} className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
              <span><span className="block text-sm font-semibold leading-snug">{f.title}</span><span className="block text-sm leading-snug text-muted-foreground">{f.body}</span></span>
            </li>
          ))}
        </ul>
      </div>
      {compact && (
        <div className="border-t bg-secondary/40 px-6 py-4 md:px-10">
          <Button asChild variant="premium" size="lg"><Link to="/pro">{hasSession ? "Open my Pro workspace" : `See what's inside · ${PRO_PRICE_LABEL}`}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
        </div>
      )}
    </section>
  );
}
