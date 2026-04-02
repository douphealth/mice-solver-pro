import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportActionsSection({ report }: Props) {
  return (
    <motion.section
      className="premium-card rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shadow-sm">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            3 Things To Do TONIGHT
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 rounded-full px-3 py-1.5">
            <Clock className="h-3 w-3" />
            Priority
          </div>
        </div>

        <div className="space-y-4">
          {report.immediateActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="flex gap-4 group"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-accent-gradient text-accent-foreground flex items-center justify-center font-bold text-base shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                {i < report.immediateActions.length - 1 && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-accent/20" />
                )}
              </div>
              <div className="bg-secondary/30 rounded-xl p-5 flex-1 border border-border/20 hover:border-accent/15 hover:shadow-sm transition-all">
                <p className="text-sm text-foreground leading-relaxed">{action}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-xs text-muted-foreground text-center mt-6 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          These three actions are the highest-impact steps you can take immediately based on your specific situation.
        </motion.p>
      </div>
    </motion.section>
  );
}
