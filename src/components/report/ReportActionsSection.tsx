import { motion } from "framer-motion";
import { Zap } from "lucide-react";
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
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shadow-sm">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          3 Things To Do TONIGHT
          <span className="ml-auto section-badge bg-accent/10 text-accent text-[10px]">Priority</span>
        </h2>
        <div className="space-y-5">
          {report.immediateActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.12 }}
              className="flex gap-4 group"
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-accent-gradient text-accent-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  {i + 1}
                </div>
                {i < report.immediateActions.length - 1 && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-8 bg-border" />
                )}
              </div>
              <div className="bg-secondary/30 rounded-xl p-4 flex-1 border border-border/20">
                <p className="text-sm text-foreground leading-relaxed">{action}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
