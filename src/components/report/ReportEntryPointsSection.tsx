import { motion } from "framer-motion";
import { MapPin, AlertTriangle, ArrowRight, DoorOpen } from "lucide-react";
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
      <div className="h-1.5 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shadow-sm">
              <DoorOpen className="h-5 w-5 text-accent" />
            </div>
            Probable Entry Points
          </h2>
          <div className="section-badge bg-accent/10 text-accent text-[10px]">
            <MapPin className="h-3 w-3" />
            {report.entryPoints.length} Found
          </div>
        </div>

        <div className="space-y-2.5">
          {report.entryPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/30 border border-border/20 rounded-xl p-4 hover:border-accent/25 hover:bg-secondary/50 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                <span className="text-accent font-bold text-xs">{i + 1}</span>
              </div>
              <span className="leading-relaxed flex-1 pt-0.5">{point}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-accent transition-colors shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
