import { motion } from "framer-motion";
import { Bug } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportSpeciesSection({ report }: Props) {
  return (
    <motion.section
      className="glass-card rounded-2xl p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bug className="h-5 w-5 text-primary" />
        </div>
        Rodent Identification
      </h2>

      <div className="bg-secondary rounded-xl p-5 mb-5">
        <h3 className="text-lg font-display font-bold text-foreground">{report.species.name}</h3>
        <p className="text-xs text-muted-foreground italic mb-2">{report.species.scientificName}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{report.species.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        {[
          { label: "Behavior", value: report.species.behavior },
          { label: "Diet", value: report.species.diet },
          { label: "Reproduction", value: report.species.reproductionRate },
        ].map(({ label, value }) => (
          <div key={label} className="bg-secondary/50 rounded-lg p-4">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wide">{label}</span>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mt-5">
        <p className="text-sm font-medium text-foreground">
          Estimated population: <span className="text-accent font-bold">{report.estimatedPopulation.min}–{report.estimatedPopulation.max} mice</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Without action, this could grow to {report.populationIn30Days.min}–{report.populationIn30Days.max} within 30 days.
        </p>
      </div>
    </motion.section>
  );
}
