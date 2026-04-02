import { motion } from "framer-motion";
import { Shield, AlertCircle, Heart } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportHealthSection({ report }: Props) {
  const highRiskCount = report.healthRisks.filter(
    (r) => r.includes("HIGH RISK") || r.includes("CRITICAL")
  ).length;

  return (
    <motion.section
      className="glass-card-elevated rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="h-1.5 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-destructive" />
            </div>
            Health Risk Assessment
          </h2>
          {highRiskCount > 0 && (
            <div className="section-badge bg-destructive/10 text-destructive text-[10px]">
              <AlertCircle className="h-3 w-3" />
              {highRiskCount} Critical
            </div>
          )}
        </div>

        <div className="space-y-3">
          {report.healthRisks.map((risk, i) => {
            const isHighRisk = risk.includes("HIGH RISK") || risk.includes("CRITICAL");
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`rounded-xl p-4 text-sm leading-relaxed flex items-start gap-3 transition-all hover:shadow-sm ${
                  isHighRisk
                    ? "bg-destructive/5 border-2 border-destructive/20 text-foreground font-medium"
                    : "bg-secondary/40 border border-border/20 text-muted-foreground"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isHighRisk ? "bg-destructive/15" : "bg-secondary"
                }`}>
                  {isHighRisk ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="pt-0.5">{risk}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
