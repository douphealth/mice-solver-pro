import type { QuizAnswers } from "./quiz-data";

export const PLANNER_LIMITATION = "This planning tool cannot diagnose an infestation, identify a species with certainty, estimate the number of mice, assess disease risk or guarantee a clearance date.";
export const SOURCES = [
  { label: "CDC: cleaning up after rodents", url: "https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html" },
  { label: "CDC: trapping rodents", url: "https://www.cdc.gov/healthy-pets/rodent-control/trap-up.html" },
  { label: "CDC: sealing entry gaps", url: "https://www.cdc.gov/healthy-pets/rodent-control/seal-up.html" },
  { label: "UC IPM: house mouse management", url: "https://ipm.ucanr.edu/home-and-landscape/house-mouse/" },
];

export interface ReportData {
  methodVersion: "2026-10-01";
  physicalSigns: string[];
  uncertainSigns: string[];
  professionalHelp: string[];
  // Null legacy fields preserve the saved-report shape without inventing measurements.
  severity: null;
  estimatedPopulation: { min: null; max: null };
  populationIn30Days: { min: null; max: null };
  urgencyDays: null;
  severityLabel: string;
  severityDescription: string;
  species: { name: string; scientificName: string; description: string; behavior: string; diet: string; reproductionRate: string };
  healthRisks: string[];
  entryPoints: string[];
  immediateActions: string[];
  roomByRoomStrategy: string[];
  shoppingList: { name: string; reason: string; affiliateUrl?: string }[];
  eliminationTimeline: { day: string; action: string }[];
  decontaminationSteps: string[];
  preventionCalendar: { month: string; task: string }[];
}

const physical: Record<string, string> = {
  droppings: "Possible rodent droppings reported; identity and age are not established by appearance alone.",
  gnaw_marks: "Chewing damage reported; inspect without touching damaged wiring or disturbing contamination.",
  nesting: "Possible nesting material reported; do not disturb it dry.",
  sighting: "A rodent sighting reported; this does not establish the total population or exact species.",
  tracks: "Possible tracks reported; compare with other physical evidence.",
};
const uncertain: Record<string, string> = {
  sounds: "Scratching or other noises reported; noise alone does not confirm rodents or pinpoint a wall cavity.",
  urine_smell: "Odor reported; odor alone does not establish its source, animal numbers or disease risk.",
  grease_marks: "Smudges reported; marks alone do not confirm current rodent activity.",
};
const hazards: Record<string, string> = {
  damaged_wiring: "Reported damaged wiring: keep away from it and arrange assessment by a qualified electrician. Smoke, sparks or burning smells require an emergency response.",
  ventilation: "Reported contamination in heating/cooling ducts: do not clean the duct system yourself. Contact a qualified rodent-control and duct-cleaning service.",
  heavy_contamination: "Reported extensive or inaccessible contamination: keep people and pets out and seek qualified cleanup advice before disturbing it.",
};
const rooms: Record<string, string> = {
  kitchen: "Kitchen: inspect accessible cabinet edges and plumbing penetrations; protect food and food-contact surfaces. Do not move connected appliances unsafely.",
  attic: "Attic: inspect only from safe, accessible locations. Do not step on unsupported ceilings or disturb insulation and waste.",
  basement: "Basement: inspect visible perimeter gaps and stored food; reduce accessible clutter after safe cleanup.",
  garage: "Garage: inspect door seals and storage areas; keep pet food and seed in robust, tightly closed containers.",
  bedroom: "Bedroom: inspect accessible edges and remove food; keep traps inaccessible to children and pets.",
  walls: "Walls: inspect accessible room edges on either side. Sounds cannot pinpoint a nest; do not cut drywall or put loose poison into a void.",
  bathroom: "Bathroom: inspect accessible gaps around plumbing without disturbing electrical or building services.",
  living_room: "Living room: inspect accessible edges and furniture surroundings; remove food debris.",
  crawlspace: "Crawl space: use a professional when access, structural condition or contamination makes inspection unsafe.",
  laundry: "Laundry: inspect accessible pipe penetrations and door seals. Do not obstruct dryer exhaust or install a lint-catching screen.",
};
const selected = (input: unknown, allowed: Record<string, string>): string[] =>
  Array.isArray(input) ? [...new Set(input.filter((v): v is string => typeof v === "string" && Object.prototype.hasOwnProperty.call(allowed, v)))].map(v => allowed[v]) : [];
const includes = (input: unknown, item: string): boolean => Array.isArray(input) && input.includes(item);

export function generateReport(input: QuizAnswers | unknown): ReportData {
  const a: Record<string, unknown> = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const physicalSigns = selected(a.evidence, physical);
  const uncertainSigns = selected(a.evidence, uncertain);
  const professionalHelp = selected(a.evidence, hazards);
  const havePhysical = physicalSigns.length > 0;
  const householdProtection = ["kids", "pets_dog", "pets_cat", "pets"].some(v => includes(a.household, v));
  const multiunit = ["apartment", "townhouse"].includes(String(a.home_type));
  const entryPoints = [
    "Inspect accessible gaps around pipes, doors and the building perimeter. These are inspection prompts, not confirmed entry routes.",
    "For small non-service gaps, CDC describes steel wool secured with caulk; larger openings may need metal, hardware cloth or another suitable repair. Match materials to the assembly.",
    "Do not fill drainage paths, block ventilation or put conductive packing near wiring. Use qualified help for utilities, dryer exhaust and fire-rated construction.",
    ...(multiunit ? ["Coordinate shared-wall and common-area inspection with the owner or building manager; do not alter shared services yourself."] : []),
  ];
  const immediateActions = [
    ...professionalHelp,
    havePhysical ? "Record where signs were seen and inspect nearby accessible areas. After safe cleanup, record any newly appearing signs rather than guessing their age." : "Start with a safe inspection for physical evidence. Do not treat noises or odors alone as an infestation diagnosis.",
    "Secure food and pet food in robust containers with close-fitting lids; remove accessible food debris and rubbish.",
    ...(havePhysical ? ["CDC recommends correctly sized snap traps rather than glue or live traps. Follow manufacturer instructions, place them on observed travel routes and check them daily."] : []),
    householdProtection ? "Choose protected trap locations or appropriate enclosed devices. An enclosure is not a guarantee of child or pet safety; prevent access and follow the label." : "Keep traps out of reach of children, pets and other non-target animals, including visitors.",
    ...(includes(a.previous, "ultrasonic") || includes(a.previous, "peppermint") ? ["Do not use a scent or ultrasonic device as proof of control; prioritize physical exclusion, food management and trapping where activity is confirmed."] : []),
  ];
  return {
    methodVersion: "2026-10-01", physicalSigns, uncertainSigns, professionalHelp,
    severity: null, estimatedPopulation: { min: null, max: null }, populationIn30Days: { min: null, max: null }, urgencyDays: null,
    severityLabel: professionalHelp.length ? "Reported conditions need qualified attention" : havePhysical ? "Physical signs reported: inspect and verify" : "Activity not confirmed by physical evidence",
    severityDescription: "This summary reflects selected observations, not an inspection of your property. " + PLANNER_LIMITATION,
    species: { name: "Species not established", scientificName: "Not determined", description: "Room location, noise, odor and pellet appearance cannot establish exact species. Clear observations or professional identification may be needed.", behavior: "Inspect actual activity rather than relying on an assumed species.", diet: "Protect accessible food regardless of species.", reproductionRate: "Not estimated for this property." },
    healthRisks: ["No disease assessment is made from your answers. For illness following a possible rodent exposure, contact a healthcare professional and explain the exposure.", "Use the cleanup instructions below; do not dry-sweep or vacuum untreated waste.", ...professionalHelp],
    entryPoints, immediateActions,
    roomByRoomStrategy: selected(a.location, rooms),
    shoppingList: [
      { name: "Appropriate mouse traps and protected placements", reason: "Choose by the animal identified, household access and manufacturer directions; this is not an exact quantity calculation." },
      { name: "Rubber or plastic gloves and a suitable disinfectant", reason: "Check the disinfectant label, surface compatibility and contact time; never mix cleaning chemicals." },
      { name: "Materials matched to confirmed entry gaps", reason: "Choose a durable repair appropriate to the gap and building services; a material name alone does not guarantee exclusion." },
      { name: "Food containers with close-fitting lids", reason: "Use robust containers suitable for the food and storage area." },
    ],
    eliminationTimeline: [
      { day: "Inspect", action: "Record physical evidence and address unsafe conditions before DIY work." },
      { day: "Control and clean", action: "Reduce food access; use appropriate protected traps and safe wet cleanup. Coordinate entry-gap repairs with control." },
      { day: "Recheck", action: "Check traps daily and log any newly appearing evidence after cleanup. Adjust placements to observations." },
      { day: "Review", action: "If signs persist, inaccessible areas are involved or the plan is not working, seek qualified help. No date proves permanent clearance." },
    ],
    decontaminationSteps: [
      "For a home or outbuilding, CDC advises opening doors and windows for 30 minutes and leaving during that ventilation period before cleanup.",
      "Wear rubber or plastic gloves. Do not dry-sweep, vacuum or blow untreated droppings, urine or nests.",
      "Thoroughly wet the material with an appropriate disinfectant. Allow 5 minutes or the product label contact time, then use paper towels and place waste in a covered rubbish bin.",
      "Disinfect the affected hard surfaces as directed. For carcasses and nests, follow CDC's double-bag disposal procedure and local disposal guidance.",
      "Wash gloved hands before removing gloves, then wash bare hands with soap and warm water. Never mix disinfectants or cleaning chemicals.",
      "Heavy, inaccessible or ventilation-system contamination needs qualified assessment and additional precautions; this routine checklist is not sufficient for every situation.",
    ],
    preventionCalendar: [
      { month: "During active control", task: "Check traps daily and record location, catches and new evidence." },
      { month: "After repairs or weather damage", task: "Reinspect accessible seals and the building perimeter without blocking drainage or ventilation." },
      { month: "Routine household checks", task: "Review food storage, waste handling and accessible areas for new signs; restart inspection when evidence changes." },
    ],
  };
}
