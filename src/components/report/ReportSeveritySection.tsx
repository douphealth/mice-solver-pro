import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle } from "lucide-react";
import SeverityGauge from "@/components/SeverityGauge";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportSeveritySection({ report }: Props) {
  return (
    <motion.section
      className="glass-card rounded-2xl p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        Infestation Severity
      </h2>
      <SeverityGauge score={report.severity} label={report.severityLabel} />
      <p className="text-muted-foreground mt-6 leading-relaxed text-center text-sm md:text-base">
        {report.severityDescription}
      </p>

      {/* Urgency callout */}
      <div className="mt-6 flex items-start gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Action recommended within {report.urgencyDays} days
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Without intervention, your estimated population of {report.estimatedPopulation.min}–{report.estimatedPopulation.max} mice
            could grow to {report.populationIn30Days.min}–{report.populationIn30Days.max} within 30 days.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
