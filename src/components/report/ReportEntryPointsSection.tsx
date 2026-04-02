import { motion } from "framer-motion";
import { MapPin, AlertTriangle } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportEntryPointsSection({ report }: Props) {
  return (
    <motion.section
      className="glass-card rounded-2xl p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-warning" />
        </div>
        Probable Entry Points
      </h2>
      <ul className="space-y-3">
        {report.entryPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <span className="leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
