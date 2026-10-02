export interface ToolMeta { to: string; title: string; blurb: string; icon: "Search" | "DoorOpen" | "Target" | "SprayCan"; time: string }

/** The four free tools. Keep in sync with the sitemap and the worker's route list. */
export const TOOLS: ToolMeta[] = [
  { to: "/tools/calculator", title: "Signs & next steps", blurb: "What a sign can and can't tell you, and the safest next move.", icon: "Search", time: "1 min" },
  { to: "/tools/entry-points", title: "Entry-gap checklist", blurb: "Inspect inside and outside for gaps a pencil could fit through.", icon: "DoorOpen", time: "10 min" },
  { to: "/tools/trap-placement", title: "Trap placement guide", blurb: "Where traps go, how to bait them and how to space them.", icon: "Target", time: "3 min" },
  { to: "/tools/cleanup-guide", title: "Safe cleanup guide", blurb: "Step-by-step cleanup that never involves sweeping or vacuuming.", icon: "SprayCan", time: "5 min" },
];

export const SEO: Record<string, { title: string; description: string; index: boolean }> = {
  "/": {
    title: "Mouse Control Planner: Free Step-by-Step Plan",
    description: "Build a free, source-backed mouse control plan in two minutes: what to do today, this week and ongoing. Traps, safe cleanup and sealing entry gaps, based on CDC and UC IPM guidance.",
    index: true,
  },
  "/quiz": {
    title: "Build Your Free Mouse Control Plan",
    description: "Answer seven quick questions about what you've observed and get a personalised, source-backed action plan. No email or signup required.",
    index: true,
  },
  "/tools/calculator": {
    title: "Mouse Signs: What They Mean and What to Do Next",
    description: "Droppings, noises, odors or gnaw marks: see what each sign can and can't tell you, and the safest next step, with CDC and UC IPM sources.",
    index: true,
  },
  "/tools/entry-points": {
    title: "Mouse Entry-Gap Inspection Checklist",
    description: "An interactive checklist of the places mice get in, inside and outside your home, with sealing materials that work and ones that don't.",
    index: true,
  },
  "/tools/trap-placement": {
    title: "Where to Place Mouse Traps: A Visual Guide",
    description: "How to place, bait and space snap traps, with a layout helper based on UC IPM and CDC guidance, plus what to avoid.",
    index: true,
  },
  "/tools/cleanup-guide": {
    title: "How to Clean Up After Mice Safely",
    description: "A step-by-step checklist for cleaning droppings, urine, nests and traps without sweeping or vacuuming, following CDC guidance.",
    index: true,
  },
  "/privacy": { title: "Privacy", description: "How the Mouse Control Planner handles your information.", index: true },
  "/terms": { title: "Terms and Purchase Information", description: "Terms of use and purchase information for the Mouse Control Planner and Pro Masterplan.", index: true },
  "/plan": { title: "Your Mouse Control Plan", description: "Your personalised mouse control plan.", index: false },
  "/pro": { title: "Pro Masterplan", description: "Your Pro Masterplan workspace.", index: false },
  "/payment-success": { title: "Confirming Your Purchase", description: "Purchase confirmation.", index: false },
  "/restore": { title: "Restore Your Purchase", description: "Restore access to your Pro Masterplan.", index: false },
};
