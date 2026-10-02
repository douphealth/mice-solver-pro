/** Hand-built SVG illustrations. They use theme colours, scale cleanly and add no image weight. */

export function HeroHouse({ className = "" }: { className?: string }) {
  const dot = (cx: number, cy: number, n: number, delay: string) => (
    <g key={n}>
      <circle cx={cx} cy={cy} r="15" fill="hsl(41 94% 60%)" opacity="0.25"><animate attributeName="r" values="12;19;12" dur="3.2s" begin={delay} repeatCount="indefinite" /></circle>
      <circle cx={cx} cy={cy} r="10" fill="hsl(41 94% 60%)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(152 30% 9%)" fontFamily="DM Sans, sans-serif">{n}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 460 380" className={className} role="img" aria-label="Cutaway of a house with four numbered inspection points: roofline vents, a window and door, the foundation line and pipes.">
      <defs>
        <linearGradient id="hh-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="hsl(42 40% 97%)" /><stop offset="1" stopColor="hsl(42 30% 90%)" /></linearGradient>
        <linearGradient id="hh-roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="hsl(152 40% 28%)" /><stop offset="1" stopColor="hsl(152 48% 18%)" /></linearGradient>
      </defs>
      <ellipse cx="230" cy="342" rx="200" ry="16" fill="hsl(152 40% 6% / 0.45)" />
      <rect x="70" y="170" width="320" height="168" rx="6" fill="url(#hh-wall)" stroke="hsl(152 30% 14%)" strokeWidth="3" />
      <path d="M40 176 L230 52 L420 176 Z" fill="url(#hh-roof)" stroke="hsl(152 30% 10%)" strokeWidth="3" strokeLinejoin="round" />
      <rect x="205" y="84" width="50" height="28" rx="14" fill="hsl(152 30% 12%)" opacity="0.5" />
      <rect x="96" y="204" width="86" height="70" rx="5" fill="hsl(152 28% 20%)" opacity="0.18" stroke="hsl(152 30% 14%)" strokeWidth="2.5" />
      <path d="M139 204 V274 M96 239 H182" stroke="hsl(152 30% 14%)" strokeWidth="2" />
      <rect x="260" y="226" width="64" height="112" rx="5" fill="hsl(33 70% 46%)" stroke="hsl(152 30% 14%)" strokeWidth="2.5" />
      <circle cx="312" cy="284" r="4" fill="hsl(41 94% 70%)" />
      <rect x="344" y="296" width="30" height="42" rx="3" fill="hsl(152 25% 22%)" opacity="0.22" />
      <path d="M70 316 H390" stroke="hsl(152 30% 14%)" strokeWidth="3" />
      <rect x="352" y="318" width="22" height="9" rx="2" fill="hsl(152 30% 14%)" opacity="0.65" />
      <path d="M80 338 q10 -14 22 0 M370 338 q10 -14 22 0 M40 338 h380" stroke="hsl(152 45% 38%)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      {dot(230, 98, 1, "0s")}
      {dot(139, 239, 2, "0.8s")}
      {dot(292, 262, 3, "1.6s")}
      {dot(363, 322, 4, "2.4s")}
    </svg>
  );
}

/** Top-down room with traps along a wall, showing the "T" placement, pair spacing and the 10-foot rule. */
export function TrapDiagram({ className = "" }: { className?: string }) {
  const trap = (x: number, y: number, rot = 0, key?: string) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-5" y="-19" width="10" height="38" rx="2" fill="hsl(33 70% 46%)" stroke="hsl(152 30% 12%)" strokeWidth="1.5" />
      <rect x="-5" y="-19" width="10" height="9" rx="2" fill="hsl(41 94% 62%)" stroke="hsl(152 30% 12%)" strokeWidth="1.5" />
    </g>
  );
  return (
    <svg viewBox="0 0 520 300" className={className} role="img" aria-label="Top-down diagram. Snap traps sit against the wall with the bait end touching the wall, forming a T. Traps are spaced about ten feet apart, with an optional pair one to two inches apart.">
      <rect x="10" y="10" width="500" height="280" rx="14" fill="hsl(42 36% 94%)" stroke="hsl(42 22% 85%)" />
      <rect x="10" y="10" width="500" height="22" rx="10" fill="hsl(152 30% 18%)" />
      <text x="260" y="26" textAnchor="middle" fontSize="12" fontWeight="700" fill="hsl(42 40% 96%)" fontFamily="DM Sans, sans-serif" letterSpacing="1.5">WALL</text>
      {trap(90, 54, 0, "a")}
      {trap(300, 54, 0, "b")}
      {trap(318, 54, 0, "b2")}
      {trap(470, 54, 0, "c")}
      <path d="M90 76 V150" stroke="hsl(152 45% 30%)" strokeWidth="2" strokeDasharray="5 5" />
      <text x="98" y="148" fontSize="12" fill="hsl(152 40% 22%)" fontFamily="DM Sans, sans-serif" fontWeight="600">Bait end touches the wall (a "T")</text>
      <path d="M90 200 H470" stroke="hsl(152 45% 30%)" strokeWidth="2" />
      <line x1="90" y1="190" x2="90" y2="210" stroke="hsl(152 45% 30%)" strokeWidth="2" />
      <line x1="470" y1="190" x2="470" y2="210" stroke="hsl(152 45% 30%)" strokeWidth="2" />
      <text x="280" y="230" textAnchor="middle" fontSize="13" fill="hsl(152 40% 22%)" fontFamily="DM Sans, sans-serif" fontWeight="700">No more than about 10 feet apart where mice are active</text>
      <path d="M300 78 q9 22 18 0" stroke="hsl(33 90% 42%)" strokeWidth="2" fill="none" />
      <text x="309" y="116" textAnchor="middle" fontSize="11" fill="hsl(33 90% 32%)" fontFamily="DM Sans, sans-serif" fontWeight="600">Optional pair, 1 to 2 in apart</text>
      <text x="260" y="270" textAnchor="middle" fontSize="11" fill="hsl(152 14% 33%)" fontFamily="DM Sans, sans-serif">Illustrative, not to scale. Traps go where you found signs, out of reach of children and pets.</text>
    </svg>
  );
}

/** Life-size 1/4 inch reference: the CDC's "width of a pencil". */
export function GapGauge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 120" className={className} role="img" aria-label="A gap one quarter inch wide, about the width of a pencil, is large enough for a mouse.">
      <rect x="0" y="0" width="360" height="120" rx="14" fill="hsl(42 36% 94%)" stroke="hsl(42 22% 85%)" />
      <rect x="24" y="22" width="120" height="76" rx="4" fill="hsl(152 30% 18%)" />
      <rect x="156" y="22" width="120" height="76" rx="4" fill="hsl(152 30% 18%)" />
      <rect x="144" y="22" width="12" height="76" fill="hsl(41 94% 60%)" opacity="0.9" />
      <path d="M150 12 V108" stroke="hsl(33 90% 40%)" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="290" y="52" fontSize="22" fontWeight="800" fill="hsl(152 48% 21%)" fontFamily="Fraunces, serif">¼ in</text>
      <text x="290" y="72" fontSize="12" fill="hsl(152 14% 33%)" fontFamily="DM Sans, sans-serif">6 mm, a pencil's</text>
      <text x="290" y="87" fontSize="12" fill="hsl(152 14% 33%)" fontFamily="DM Sans, sans-serif">width</text>
    </svg>
  );
}
