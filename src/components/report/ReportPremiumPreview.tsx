import { motion } from "framer-motion";
import {
  ClipboardList, ShoppingCart, Calendar, CheckCircle2,
  Sparkles, Lock, Shield, Star, ArrowRight
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
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
        <div className="text-center px-6 max-w-lg">
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="trust-badge">
              <Shield className="h-3 w-3 text-primary" />
              Expert-Grade
            </span>
            <span className="trust-badge">
              <Star className="h-3 w-3 text-accent" />
              4.9/5 Rating
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-accent/15 rounded-full px-5 py-2 text-sm font-semibold text-accent mb-5">
            <Sparkles className="h-4 w-4" />
            Pro Elimination Masterplan
          </div>

          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3 leading-tight">
            Unlock Your Complete<br />
            <span className="text-gradient-premium">Mouse Elimination Plan</span>
          </h3>

          <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-sm mx-auto">
            Get the step-by-step protocol to eliminate mice permanently — customized to YOUR exact situation, home, and budget.
          </p>

          <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto text-left mb-7">
            {[
              "Room-by-room strategy",
              "Exact product shopping list",
              "Day-by-day protocol",
              "Prevention calendar",
              "CDC decontamination guide",
              "Downloadable Pro PDF",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <Button variant="premium" size="xl" className="shadow-xl">
            <Lock className="h-5 w-5 mr-1" />
            Unlock Full Plan — $9.99
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>One-time payment</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Instant access</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>100% personalized</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
