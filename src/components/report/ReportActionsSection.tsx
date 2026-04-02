import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportActionsSection({ report }: Props) {
  return (
    <motion.section
      className="border-2 border-accent bg-accent/5 rounded-2xl p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Zap className="h-5 w-5 text-accent" />
        </div>
        3 Things To Do TONIGHT
      </h2>
      <div className="space-y-5">
        {report.immediateActions.map((action, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-gradient text-accent-foreground flex items-center justify-center font-bold text-sm shrink-0">
              {i + 1}
            </div>
            <p className="text-sm text-foreground leading-relaxed pt-2">{action}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
