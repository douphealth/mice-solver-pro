import { motion } from "framer-motion";
import { MapPin, AlertTriangle, ArrowRight } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportEntryPointsSection({ report }: Props) {
  return (
    <motion.section
      className="glass-card-elevated rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="h-1 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center shadow-sm">
            <MapPin className="h-5 w-5 text-warning" />
          </div>
          Probable Entry Points
        </h2>
        <div className="space-y-2.5">
          {report.entryPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/30 border border-border/20 rounded-xl p-3.5 hover:border-warning/20 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              </div>
              <span className="leading-relaxed flex-1">{point}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-warning transition-colors shrink-0 mt-0.5" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
