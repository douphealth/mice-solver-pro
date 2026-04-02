import { motion } from "framer-motion";
import { Shield, AlertCircle } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportHealthSection({ report }: Props) {
  return (
    <motion.section
      className="glass-card-elevated rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="h-1 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shadow-sm">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          Health Risk Assessment
        </h2>
        <div className="space-y-3">
          {report.healthRisks.map((risk, i) => {
            const isHighRisk = risk.includes("HIGH RISK") || risk.includes("CRITICAL");
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`rounded-xl p-4 text-sm leading-relaxed flex items-start gap-3 ${
                  isHighRisk
                    ? "bg-destructive/5 border border-destructive/15 text-foreground font-medium"
                    : "bg-secondary/40 border border-border/20 text-muted-foreground"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isHighRisk ? "bg-destructive/10" : "bg-secondary"
                }`}>
                  {isHighRisk ? (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  ) : (
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <span>{risk}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
