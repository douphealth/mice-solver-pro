import { motion } from "framer-motion";
import {
  ClipboardList, ShoppingCart, Calendar, CheckCircle2,
  Sparkles, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportPremiumPreview({ report }: Props) {
  return (
    <motion.section
      className="relative rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Blurred background content */}
      <div className="glass-card rounded-2xl p-6 md:p-8 pointer-events-none select-none filter blur-[6px]">
        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-primary" />
          Room-by-Room Elimination Strategy
        </h2>
        <div className="space-y-3">
          {report.roomByRoomStrategy.map((s, i) => (
            <div key={i} className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">{s}</div>
          ))}
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-4 mt-8 flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
          Your Personalized Shopping List
        </h2>
        <div className="space-y-2">
          {report.shoppingList.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-secondary rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-4 mt-8 flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          30-Day Elimination Timeline
        </h2>
        <div className="space-y-2">
          {report.eliminationTimeline.slice(0, 3).map((t, i) => (
            <div key={i} className="bg-secondary rounded-lg p-3">
              <p className="text-sm font-semibold text-foreground">{t.day}</p>
              <p className="text-xs text-muted-foreground">{t.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="text-center px-6 max-w-md">
          <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-1.5 text-sm text-accent mb-4">
            <Sparkles className="h-4 w-4" />
            Pro Report
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            Unlock Your Complete Elimination Masterplan
          </h3>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Get the step-by-step plan to eliminate mice — customized to YOUR exact situation.
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto text-left mb-6">
            {[
              "Room-by-room strategy",
              "Exact product shopping list",
              "Day-by-day protocol",
              "Prevention calendar",
              "Decontamination guide",
              "Downloadable PDF",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-foreground">
                <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <Button variant="premium" size="xl">
            <Lock className="h-5 w-5 mr-1" />
            Unlock Full Plan — $9.99
          </Button>
          <p className="text-muted-foreground text-xs mt-3">One-time payment · Instant access · 100% personalized</p>
        </div>
      </div>
    </motion.section>
  );
}
