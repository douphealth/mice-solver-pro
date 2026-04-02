import { motion } from "framer-motion";
import { Bug, Info, Dna, Utensils, Baby } from "lucide-react";
import type { ReportData } from "@/lib/report-generator";

interface Props {
  report: ReportData;
}

export default function ReportSpeciesSection({ report }: Props) {
  const details = [
    { label: "Behavioral Profile", value: report.species.behavior, icon: Dna, color: "text-primary" },
    { label: "Dietary Habits", value: report.species.diet, icon: Utensils, color: "text-accent" },
    { label: "Reproduction Rate", value: report.species.reproductionRate, icon: Baby, color: "text-destructive" },
  ];

  return (
    <motion.section
      className="glass-card-elevated rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="h-1.5 bg-accent-gradient" />

      <div className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <Bug className="h-5 w-5 text-primary" />
          </div>
          Rodent Species Identification
        </h2>

        {/* Species header card */}
        <div className="bg-secondary/40 rounded-xl p-5 mb-6 border border-border/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-full -translate-y-10 translate-x-10" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-display font-bold text-foreground">{report.species.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground italic">{report.species.scientificName}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary-foreground bg-primary rounded-full px-3 py-1.5 shadow-sm">
              <Info className="h-3 w-3" />
              Confirmed
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-4 relative z-10">{report.species.description}</p>
        </div>

        {/* Detail cards */}
        <div className="grid md:grid-cols-3 gap-3">
          {details.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-secondary/30 rounded-xl p-4 border border-border/20 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className="font-bold text-foreground text-xs uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Population projection bar */}
        <motion.div
          className="bg-accent/5 border border-accent/15 rounded-xl p-5 mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-foreground">Population Growth Projection</p>
            <span className="text-xs text-destructive font-bold bg-destructive/10 px-2.5 py-1 rounded-full">
              Critical if untreated
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-accent">{report.estimatedPopulation.min}-{report.estimatedPopulation.max}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Now</div>
            </div>
            <div className="flex-1 relative h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent-gradient rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.8 }}
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-destructive">{report.populationIn30Days.min}-{report.populationIn30Days.max}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">30 Days</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
