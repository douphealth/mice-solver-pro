import { motion } from "framer-motion";

interface SeverityGaugeProps {
  score: number;
  label: string;
}

export default function SeverityGauge({ score, label }: SeverityGaugeProps) {
  const percentage = score / 10;
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - percentage);

  const getStrokeColor = () => {
    if (score <= 3) return "hsl(var(--gauge-green))";
    if (score <= 6) return "hsl(var(--gauge-yellow))";
    return "hsl(var(--gauge-red))";
  };

  const getGlowColor = () => {
    if (score <= 3) return "hsla(152, 55%, 40%, 0.3)";
    if (score <= 6) return "hsla(45, 90%, 50%, 0.3)";
    return "hsla(0, 72%, 51%, 0.3)";
  };

  const getTextClass = () => {
    if (score <= 3) return "text-gauge-green";
    if (score <= 6) return "text-gauge-yellow";
    return "text-gauge-red";
  };

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = Math.PI + (i / 10) * Math.PI;
    const innerR = radius - strokeWidth / 2 - 6;
    const outerR = radius - strokeWidth / 2 - 2;
    return {
      x1: 100 + Math.cos(angle) * innerR,
      y1: 100 + Math.sin(angle) * innerR,
      x2: 100 + Math.cos(angle) * outerR,
      y2: 100 + Math.sin(angle) * outerR,
      major: i % 5 === 0,
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-56 h-32">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          {/* Glow filter */}
          <defs>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
            fill="none"
            stroke="url(#bgGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <motion.path
            d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            filter="url(#gaugeGlow)"
            style={{ filter: `drop-shadow(0 0 8px ${getGlowColor()})` }}
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={tick.major ? 1.5 : 0.5}
              strokeOpacity={tick.major ? 0.5 : 0.3}
            />
          ))}

          {/* Center score */}
          <motion.text
            x="100"
            y="92"
            textAnchor="middle"
            className={`font-display font-bold ${getTextClass()}`}
            fill={getStrokeColor()}
            fontSize="36"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {score}
          </motion.text>
          <text
            x="100"
            y="108"
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
            className="font-body"
          >
            out of 10
          </text>
        </svg>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className={`text-lg font-display font-bold ${getTextClass()} uppercase tracking-wide`}>
          {label}
        </div>
      </motion.div>
    </div>
  );
}
