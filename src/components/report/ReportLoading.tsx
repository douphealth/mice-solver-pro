import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Brain, Target, Search, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

const facts = [
  "Mice can squeeze through gaps as small as 1/4 inch...",
  "A single mouse produces 50-75 droppings per day...",
  "Mice are excellent climbers and can scale vertical walls...",
  "The average mouse reproduces every 19-21 days...",
  "Mice are most active between dusk and dawn...",
  "A mouse can survive a fall of 12+ feet without injury...",
  "Mice contaminate 10x more food than they eat...",
  "Mouse urine can trigger asthma attacks in children...",
];

const stages = [
  { icon: Search, label: "Analyzing evidence patterns", delay: 0 },
  { icon: Brain, label: "Identifying rodent species", delay: 0.6 },
  { icon: Target, label: "Mapping probable entry points", delay: 1.2 },
  { icon: Activity, label: "Calculating severity score", delay: 1.8 },
  { icon: Shield, label: "Assessing health risks", delay: 2.2 },
  { icon: FileText, label: "Generating your personalized report", delay: 2.6 },
];

interface Props {
  factIndex: number;
}

export default function ReportLoading({ factIndex }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 border-4 border-accent/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-primary/30 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 border-4 border-accent/40 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Analyzing Your Situation
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Our AI is building your personalized diagnostic report
          </p>

          <div className="space-y-2 mb-8 text-left max-w-xs mx-auto">
            {stages.map((stage) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: stage.delay }}
                className="flex items-center gap-3 text-sm"
              >
                <motion.div
                  className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                  animate={{ backgroundColor: ["hsla(152, 45%, 22%, 0.1)", "hsla(152, 45%, 22%, 0.2)", "hsla(152, 45%, 22%, 0.1)"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: stage.delay }}
                >
                  <stage.icon className="h-3.5 w-3.5 text-primary" />
                </motion.div>
                <span className="text-muted-foreground">{stage.label}</span>
                <motion.div
                  className="ml-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: stage.delay + 0.5 }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="h-12 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-muted-foreground italic leading-relaxed absolute inset-0 flex items-center justify-center"
              >
                {facts[factIndex % facts.length]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
