import { motion } from "framer-motion";
import { Bug } from "lucide-react";

const mouseFacts = [
  "Mice can squeeze through a gap the width of a pencil (¼ inch).",
  "A single pair of mice can produce up to 12,000 descendants in a year.",
  "Mice can jump 12 inches high and survive falls from 8 feet.",
  "A mouse needs only 3 grams of food per day to survive.",
  "Mice are colorblind but have excellent hearing and smell.",
  "Mice leave 50-75 droppings per day as they move around.",
  "A mouse's heart beats 632 times per minute.",
  "Mice can swim and tread water for up to 3 days.",
];

interface ReportLoadingProps {
  factIndex: number;
}

export default function ReportLoading({ factIndex }: ReportLoadingProps) {
  return (
    <div className="min-h-screen bg-hero flex flex-col items-center justify-center px-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-8"
      >
        <Bug className="h-16 w-16 text-accent" />
      </motion.div>
      <h2 className="text-2xl font-display font-bold text-primary-foreground mb-4">
        Analyzing Your Situation...
      </h2>
      <div className="w-64 bg-primary-foreground/10 rounded-full h-2 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-accent-gradient rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </div>
      <motion.p
        key={factIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-primary-foreground/60 text-sm text-center max-w-md"
      >
        🐭 Did you know? {mouseFacts[factIndex % mouseFacts.length]}
      </motion.p>
    </div>
  );
}
