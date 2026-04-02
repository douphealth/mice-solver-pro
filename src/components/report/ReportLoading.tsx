import { motion, AnimatePresence } from "framer-motion";
import { Shield, Bug, Zap, MapPin, BarChart3, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

const facts = [
  "Analyzing evidence patterns...",
  "Identifying rodent species from behavioral data...",
  "Calculating infestation severity score...",
  "Mapping probable entry points for your home type...",
  "Assessing health risks for your household...",
  "Generating personalized action plan...",
  "Building your elimination strategy...",
  "Finalizing your professional report...",
];

const steps = [
  { icon: Bug, label: "Species ID", delay: 0 },
  { icon: BarChart3, label: "Severity", delay: 0.5 },
  { icon: Shield, label: "Health Risks", delay: 1.0 },
  { icon: MapPin, label: "Entry Points", delay: 1.5 },
  { icon: Zap, label: "Action Plan", delay: 2.0 },
  { icon: FileText, label: "Report", delay: 2.5 },
];

interface ReportLoadingProps {
  factIndex: number;
}

export default function ReportLoading({ factIndex }: ReportLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="grid grid-cols-3 gap-3 mb-10 max-w-xs mx-auto">
            {steps.map((step) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: step.delay * 0.4, duration: 0.4 }}
                className="flex flex-col items-center gap-1.5"
              >
                <motion.div
                  className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: step.delay * 0.3 }}
                >
                  <step.icon className="h-5 w-5 text-primary" />
                </motion.div>
                <span className="text-[10px] text-muted-foreground font-medium">{step.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-accent-gradient rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-muted-foreground"
            >
              {facts[factIndex % facts.length]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
