import { motion } from "framer-motion";
import { Bug, Info } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportSpeciesSection({ report }: Props) {
  const details = [
    { label: "Behavior", value: report.species.behavior, icon: "🧠" },
    { label: "Diet", value: report.species.diet, icon: "🍽️" },
    { label: "Reproduction", value: report.species.reproductionRate, icon: "📈" },
  ];

  return (
    <motion.section
      className="glass-card-elevated rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="h-1 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <Bug className="h-5 w-5 text-primary" />
          </div>
          Rodent Identification
        </h2>

        {/* Species card */}
        <div className="bg-secondary/40 rounded-xl p-5 mb-6 border border-border/30">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">{report.species.name}</h3>
              <p className="text-xs text-muted-foreground italic mt-0.5">{report.species.scientificName}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 rounded-full px-3 py-1">
              <Info className="h-3 w-3" />
              Identified
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">{report.species.description}</p>
        </div>

        {/* Detail grid */}
        <div className="grid md:grid-cols-3 gap-3">
          {details.map(({ label, value, icon }) => (
            <div key={label} className="bg-secondary/30 rounded-xl p-4 border border-border/20 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{icon}</span>
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{value}</p>
            </div>
          ))}
        </div>

        {/* Population callout */}
        <div className="bg-accent/5 border border-accent/15 rounded-xl p-4 mt-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Estimated population: <span className="text-accent font-bold">{report.estimatedPopulation.min}–{report.estimatedPopulation.max} mice</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Could reach {report.populationIn30Days.min}–{report.populationIn30Days.max} within 30 days without action.
            </p>
          </div>
          <div className="hidden md:flex w-12 h-12 rounded-full bg-accent/10 items-center justify-center text-xl shrink-0">
            🐭
          </div>
        </div>
      </div>
    </motion.section>
  );
}
