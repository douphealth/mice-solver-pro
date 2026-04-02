import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Clock } from "lucide-react";
import SeverityGauge from "@/components/SeverityGauge";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportSeveritySection({ report }: Props) {
  return (
    <motion.section
      className="glass-card-elevated rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Section accent bar */}
      <div className="h-1 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          Infestation Severity Analysis
        </h2>

        <SeverityGauge score={report.severity} label={report.severityLabel} />

        <p className="text-muted-foreground mt-6 leading-relaxed text-center text-sm md:text-base max-w-lg mx-auto">
          {report.severityDescription}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <div className="bg-secondary/60 rounded-xl p-4 text-center">
            <div className="text-lg font-display font-bold text-foreground">
              {report.estimatedPopulation.min}-{report.estimatedPopulation.max}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Est. Population</div>
          </div>
          <div className="bg-secondary/60 rounded-xl p-4 text-center">
            <div className="text-lg font-display font-bold text-foreground">
              {report.populationIn30Days.min}-{report.populationIn30Days.max}
            </div>
            <div className="text-xs text-muted-foreground mt-1">In 30 Days</div>
          </div>
          <div className="bg-secondary/60 rounded-xl p-4 text-center">
            <div className="text-lg font-display font-bold text-accent">
              {report.urgencyDays}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Days to Act</div>
          </div>
        </div>

        {/* Urgency callout */}
        <div className="mt-6 flex items-start gap-3 bg-destructive/5 border border-destructive/15 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-destructive" />
              Action recommended within {report.urgencyDays} days
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Without intervention, your estimated population of {report.estimatedPopulation.min}–{report.estimatedPopulation.max} mice
              could grow to {report.populationIn30Days.min}–{report.populationIn30Days.max} within 30 days due to rapid breeding cycles.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
