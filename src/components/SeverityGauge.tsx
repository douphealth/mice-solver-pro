import { motion } from "framer-motion";

interface SeverityGaugeProps {
  score: number;
  label: string;
}

export default function SeverityGauge({ score, label }: SeverityGaugeProps) {
  const percentage = (score / 10) * 100;
  const rotation = -90 + (score / 10) * 180;

  const getColor = () => {
    if (score <= 3) return "text-gauge-green";
    if (score <= 6) return "text-gauge-yellow";
    return "text-gauge-red";
  };

  const getBgColor = () => {
    if (score <= 3) return "bg-gauge-green";
    if (score <= 6) return "bg-gauge-yellow";
    return "bg-gauge-red";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-28 overflow-hidden">
        {/* Background arc */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border-[12px] border-muted" 
          style={{ clipPath: "inset(0 0 50% 0)" }} 
        />
        {/* Colored arc */}
        <motion.div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border-[12px] ${
            score <= 3 ? "border-gauge-green" : score <= 6 ? "border-gauge-yellow" : "border-gauge-red"
          }`}
          style={{ clipPath: "inset(0 0 50% 0)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{ width: 4, height: 80, marginLeft: -2 }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          <div className={`w-1 h-full ${getBgColor()} rounded-full mx-auto`} />
        </motion.div>
        {/* Center dot */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full ${getBgColor()}`} />
      </div>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className={`text-5xl font-display font-bold ${getColor()}`}>
          {score}<span className="text-2xl text-muted-foreground">/10</span>
        </div>
        <div className={`text-lg font-semibold mt-1 ${getColor()}`}>{label}</div>
      </motion.div>
    </div>
  );
}
