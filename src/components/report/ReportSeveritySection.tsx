import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Clock, TrendingDown, Activity } from "lucide-react";
import SeverityGauge from "@/components/SeverityGauge";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportSeveritySection({ report }: Props) {
  const growthPercent = Math.round(
    ((report.populationIn30Days.max - report.estimatedPopulation.max) / report.estimatedPopulation.max) * 100
  );

  return (
    <motion.section
      className="glass-card-elevated rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="h-1.5 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Infestation Severity
          </h2>
          <div className="section-badge bg-destructive/10 text-destructive text-[10px] hidden sm:flex">
            <AlertTriangle className="h-3 w-3" />
            Act within {report.urgencyDays}d
          </div>
        </div>

        <SeverityGauge score={report.severity} label={report.severityLabel} />

        <p className="text-muted-foreground mt-6 leading-relaxed text-center text-sm md:text-base max-w-xl mx-auto">
          {report.severityDescription}
        </p>

        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <div className="bg-secondary/50 rounded-xl p-4 text-center border border-border/20">
            <TrendingUp className="h-4 w-4 text-accent mx-auto mb-1.5" />
            <div className="text-xl font-display font-bold text-foreground">
              {report.estimatedPopulation.min}-{report.estimatedPopulation.max}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">Current Est.</div>
          </div>
          <div className="bg-destructive/5 rounded-xl p-4 text-center border border-destructive/10">
            <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1.5" />
            <div className="text-xl font-display font-bold text-foreground">
              {report.populationIn30Days.min}-{report.populationIn30Days.max}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">In 30 Days</div>
          </div>
          <div className="bg-accent/5 rounded-xl p-4 text-center border border-accent/10">
            <Clock className="h-4 w-4 text-accent mx-auto mb-1.5" />
            <div className="text-xl font-display font-bold text-accent">
              {report.urgencyDays}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">Days to Act</div>
          </div>
          <div className="bg-destructive/5 rounded-xl p-4 text-center border border-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive mx-auto mb-1.5" />
            <div className="text-xl font-display font-bold text-destructive">
              +{growthPercent}%
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">Growth Rate</div>
          </div>
        </div>

        {/* Urgency callout */}
        <motion.div
          className="mt-6 bg-destructive/5 border border-destructive/15 rounded-xl p-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Immediate action recommended within {report.urgencyDays} days
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Without intervention, your estimated population of {report.estimatedPopulation.min}--{report.estimatedPopulation.max} mice
                could grow to {report.populationIn30Days.min}--{report.populationIn30Days.max} within 30 days.
                Mice can reproduce every 19-21 days, with each litter containing 5-6 pups.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
