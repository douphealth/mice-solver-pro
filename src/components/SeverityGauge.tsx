import { motion } from "framer-motion";

interface SeverityGaugeProps {
  score: number;
  label: string;
}

export default function SeverityGauge({ score, label }: SeverityGaugeProps) {
  const percentage = score / 10;
  const radius = 80;
  const strokeWidth = 16;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - percentage);

  const getStrokeColor = () => {
    if (score <= 3) return "hsl(var(--gauge-green))";
    if (score <= 6) return "hsl(var(--gauge-yellow))";
    return "hsl(var(--gauge-red))";
  };

  const getGlowColor = () => {
    if (score <= 3) return "hsla(152, 55%, 40%, 0.4)";
    if (score <= 6) return "hsla(45, 90%, 50%, 0.4)";
    return "hsla(0, 72%, 51%, 0.4)";
  };

  const getTextClass = () => {
    if (score <= 3) return "text-gauge-green";
    if (score <= 6) return "text-gauge-yellow";
    return "text-gauge-red";
  };

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = Math.PI + (i / 10) * Math.PI;
    const innerR = radius - strokeWidth / 2 - 8;
    const outerR = radius - strokeWidth / 2 - 2;
    const labelR = radius - strokeWidth / 2 - 14;
    return {
      x1: 100 + Math.cos(angle) * innerR,
      y1: 100 + Math.sin(angle) * innerR,
      x2: 100 + Math.cos(angle) * outerR,
      y2: 100 + Math.sin(angle) * outerR,
      lx: 100 + Math.cos(angle) * labelR,
      ly: 100 + Math.sin(angle) * labelR,
      major: i % 5 === 0 || i === score,
      value: i,
    };
  });

  // Needle angle
  const needleAngle = Math.PI + percentage * Math.PI;
  const needleLen = radius - strokeWidth / 2 - 4;
  const nx = 100 + Math.cos(needleAngle) * needleLen;
  const ny = 100 + Math.sin(needleAngle) * needleLen;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-64 h-36">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            <filter id="gaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="arcBg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.2" />
            </linearGradient>
            <filter id="needleShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background arc */}
          <path
            d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
            fill="none"
            stroke="url(#arcBg)"
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
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 10px ${getGlowColor()})` }}
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={i <= score ? getStrokeColor() : "hsl(var(--muted-foreground))"}
                strokeWidth={tick.major ? 2 : 0.6}
                strokeOpacity={tick.major ? 0.7 : 0.3}
              />
              {tick.major && (
                <text
                  x={tick.lx}
                  y={tick.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="7"
                  fontWeight="600"
                  opacity="0.5"
                >
                  {tick.value}
                </text>
              )}
            </g>
          ))}

          {/* Needle */}
          <motion.g
            initial={{ rotate: -180, originX: "100px", originY: "100px" }}
            animate={{ rotate: -180 + percentage * 180 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
            filter="url(#needleShadow)"
          >
            <line
              x1="100"
              y1="100"
              x2={100 + Math.cos(Math.PI) * needleLen}
              y2={100 + Math.sin(Math.PI) * needleLen}
              stroke={getStrokeColor()}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="5" fill={getStrokeColor()} />
            <circle cx="100" cy="100" r="2.5" fill="hsl(var(--background))" />
          </motion.g>

          {/* Center score */}
          <motion.text
            x="100"
            y="92"
            textAnchor="middle"
            className={`font-display font-bold ${getTextClass()}`}
            fill={getStrokeColor()}
            fontSize="38"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {score}
          </motion.text>
          <text
            x="100"
            y="108"
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="9"
            className="font-body"
            fontWeight="500"
          >
            out of 10
          </text>
        </svg>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <div className={`text-lg font-display font-bold ${getTextClass()} uppercase tracking-widest`}>
          {label}
        </div>
      </motion.div>
    </div>
  );
}
