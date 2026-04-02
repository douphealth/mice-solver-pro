import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportHealthSection({ report }: Props) {
  return (
    <motion.section
      className="glass-card rounded-2xl p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-destructive" />
        </div>
        Health Risk Assessment
      </h2>
      <div className="space-y-3">
        {report.healthRisks.map((risk, i) => {
          const isHighRisk = risk.startsWith("⚠️") || risk.startsWith("🔴");
          return (
            <div
              key={i}
              className={`rounded-xl p-4 text-sm leading-relaxed ${
                isHighRisk
                  ? "bg-destructive/10 border border-destructive/20 text-foreground font-medium"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {risk}
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
