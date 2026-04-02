import { QuizAnswers } from "./quiz-data";

export interface ReportData {
  species: {
    name: string;
    scientificName: string;
    description: string;
    behavior: string;
    diet: string;
    reproductionRate: string;
  };
  severity: number;
  severityLabel: string;
  severityDescription: string;
  estimatedPopulation: { min: number; max: number };
  healthRisks: string[];
  entryPoints: string[];
  urgencyDays: number;
  populationIn30Days: { min: number; max: number };
  immediateActions: string[];
  // Premium content (shown blurred for free users)
  roomByRoomStrategy: string[];
  shoppingList: { name: string; reason: string; affiliateUrl?: string }[];
  eliminationTimeline: { day: string; action: string }[];
  decontaminationSteps: string[];
  preventionCalendar: { month: string; task: string }[];
}

export function generateReport(answers: QuizAnswers): ReportData {
  const evidence = (answers.evidence as string[]) || [];
  const locations = (answers.location as string[]) || [];
  const timeline = answers.timeline as string;
  const homeType = answers.home_type as string;
  const surroundings = answers.surroundings as string;
  const household = (answers.household as string[]) || [];
  const previous = (answers.previous as string[]) || [];
  const homeAge = answers.home_age as string;
  const droppingsDetail = answers.droppings_detail as string;
  const sightingDetail = answers.sighting_detail as string;
  const attractants = (answers.attractants as string[]) || [];
  const budget = answers.budget as string;
  const foodStorage = answers.food_storage as string;

  // Determine species
  const isRural = surroundings === "rural";
  const hasAttic = locations.includes("attic");
  const hasBasement = locations.includes("basement");
  const isLargeRodent = droppingsDetail === "large_blunt";

  let species;
  if (isLargeRodent && (hasBasement || locations.includes("garage"))) {
    species = {
      name: "Norway Rat",
      scientificName: "Rattus norvegicus",
      description: "Large, stocky rodent with a blunt nose, small ears, and a tail shorter than its body. Typically brown or gray.",
      behavior: "Ground-dwelling, prefers basements and ground floors. Strong swimmers. Creates extensive burrow systems near foundations.",
      diet: "Omnivorous — meats, grains, fruits, garbage. Needs water daily.",
      reproductionRate: "4-6 litters per year, 6-12 pups each. Extremely rapid population growth.",
    };
  } else if (isLargeRodent && hasAttic) {
    species = {
      name: "Roof Rat",
      scientificName: "Rattus rattus",
      description: "Sleek, dark-colored rat with large ears, pointed nose, and a tail longer than its body. Agile climber.",
      behavior: "Excellent climbers that prefer attics, rafters, and upper floors. Nests in trees and dense vegetation outdoors.",
      diet: "Fruits, nuts, vegetables, grains. Prefers fresh food over garbage.",
      reproductionRate: "3-5 litters per year, 5-8 pups each.",
    };
  } else if (isRural && (hasAttic || locations.includes("garage"))) {
    species = {
      name: "Deer Mouse",
      scientificName: "Peromyscus maniculatus",
      description: "A small, bicolored mouse with white feet and belly. Common in rural and semi-rural areas. Known carrier of Hantavirus.",
      behavior: "Primarily nocturnal. Excellent climbers that prefer elevated nesting sites in attics, garages, and outbuildings. They cache food in hidden spots.",
      diet: "Seeds, nuts, berries, insects, and small invertebrates. Will eat stored grains and pet food.",
      reproductionRate: "2-4 litters per year, 3-8 pups each. Can reproduce year-round indoors.",
    };
  } else if (hasBasement || locations.includes("garage")) {
    species = {
      name: "Norway Rat",
      scientificName: "Rattus norvegicus",
      description: "Large, stocky rodent with a blunt nose, small ears, and a tail shorter than its body. Typically brown or gray.",
      behavior: "Ground-dwelling, prefers basements and ground floors. Strong swimmers. Creates extensive burrow systems near foundations.",
      diet: "Omnivorous — meats, grains, fruits, garbage. Needs water daily.",
      reproductionRate: "4-6 litters per year, 6-12 pups each. Extremely rapid population growth.",
    };
  } else if (hasAttic) {
    species = {
      name: "Roof Rat",
      scientificName: "Rattus rattus",
      description: "Sleek, dark-colored rat with large ears, pointed nose, and a tail longer than its body. Agile climber.",
      behavior: "Excellent climbers that prefer attics, rafters, and upper floors. Nests in trees and dense vegetation outdoors.",
      diet: "Fruits, nuts, vegetables, grains. Prefers fresh food over garbage.",
      reproductionRate: "3-5 litters per year, 5-8 pups each.",
    };
  } else {
    species = {
      name: "House Mouse",
      scientificName: "Mus musculus",
      description: "Small, dusty gray mouse with large ears, small eyes, and a long tail. The most common household rodent worldwide.",
      behavior: "Curious and exploratory. Travels along walls and edges. Nests close to food sources, often in wall voids, cabinets, and appliances.",
      diet: "Grains, seeds, sweets, and just about anything. Needs very little water — gets moisture from food.",
      reproductionRate: "5-10 litters per year, 5-6 pups each. Can breed at just 6 weeks old.",
    };
  }

  // Calculate severity (1-10) with enhanced scoring
  let severity = 2;
  if (evidence.includes("sighting")) severity += 2;
  if (evidence.includes("droppings")) severity += 1;
  if (evidence.includes("gnaw_marks")) severity += 1;
  if (evidence.includes("nesting")) severity += 2;
  if (evidence.includes("grease_marks")) severity += 1;
  if (evidence.includes("sounds")) severity += 1;
  if (evidence.includes("urine_smell")) severity += 1;
  if (evidence.includes("tracks")) severity += 1;
  if (locations.length > 2) severity += 1;
  if (locations.length > 4) severity += 1;
  if (timeline === "months" || timeline === "ongoing") severity += 2;
  else if (timeline === "month") severity += 1;
  if (previous.includes("professional")) severity += 1;
  if (sightingDetail === "one_day") severity += 1;
  if (sightingDetail === "multiple") severity += 2;
  if (droppingsDetail === "scattered") severity += 1;
  if (homeAge === "old" || homeAge === "very_old") severity += 1;
  if (attractants.length > 2) severity += 1;
  severity = Math.min(10, Math.max(1, severity));

  const severityLabel = severity <= 3 ? "Mild" : severity <= 6 ? "Moderate" : severity <= 8 ? "Significant" : "Severe";

  const severityDescriptions: Record<string, string> = {
    Mild: `Your score is ${severity}/10 — This appears to be an early-stage situation, likely 1-2 mice exploring your home. Catching it now means the easiest and cheapest fix. Act within the next 7 days for best results.`,
    Moderate: `Your score is ${severity}/10 — This is a moderate, active infestation that has likely been developing for 3-5 weeks. Without intervention, the population could double within 30 days.`,
    Significant: `Your score is ${severity}/10 — This is a well-established infestation with multiple nesting sites. The population is actively growing and spreading through your home. Immediate, multi-pronged action is critical.`,
    Severe: `Your score is ${severity}/10 — This is a severe infestation requiring aggressive, immediate action. Multiple generations are likely present with established travel routes and nesting sites throughout your home.`,
  };

  // Population estimates
  const baseMin = severity <= 3 ? 1 : severity <= 6 ? 4 : severity <= 8 ? 10 : 20;
  const baseMax = severity <= 3 ? 3 : severity <= 6 ? 12 : severity <= 8 ? 30 : 50;

  // Health risks
  const healthRisks: string[] = [];
  if (species.name === "Deer Mouse") {
    healthRisks.push("⚠️ HIGH RISK: Hantavirus — Deer mice are the primary carrier. Avoid sweeping droppings (aerosolizes virus). Use wet cleanup methods only.");
  }
  healthRisks.push("Salmonella & E. coli contamination of food surfaces and utensils");
  healthRisks.push("Leptospirosis risk from urine on surfaces");
  if (evidence.includes("droppings") && locations.includes("kitchen")) {
    healthRisks.push("🔴 CRITICAL: Kitchen contamination detected — sanitize all food preparation surfaces immediately");
  }
  if (household.includes("kids")) {
    healthRisks.push("Children are especially vulnerable to rodent-borne diseases due to floor play and hand-to-mouth behavior");
  }
  if (household.includes("pregnant")) {
    healthRisks.push("⚠️ Pregnant individuals should avoid direct contact with mouse droppings — risk of Lymphocytic choriomeningitis (LCMV)");
  }
  if (household.includes("allergies")) {
    healthRisks.push("Mouse dander and droppings are potent allergens and can trigger asthma attacks");
  }
  if (evidence.includes("urine_smell")) {
    healthRisks.push("Strong urine odor indicates high concentration of mice — increased airborne allergen and pathogen risk");
  }

  // Entry points
  const entryPoints: string[] = [];
  if (homeType === "detached" || homeType === "cabin") {
    entryPoints.push("Foundation gaps and cracks (mice enter through openings as small as ¼ inch)");
    entryPoints.push("Gaps around utility pipes and wires entering the home");
    entryPoints.push("Garage door seal gaps");
  }
  if (homeType === "townhouse") {
    entryPoints.push("Shared walls with adjacent units — mice travel between connected homes");
    entryPoints.push("Utility chase pipes between floors");
  }
  if (homeType === "apartment") {
    entryPoints.push("Gaps around plumbing under sinks — the #1 entry point in apartments");
    entryPoints.push("Spaces behind electrical outlets on shared walls");
    entryPoints.push("Gaps where pipes enter from adjacent units");
  }
  if (homeType === "mobile") {
    entryPoints.push("Gaps in skirting and underbelly — mobile homes have many access points below");
    entryPoints.push("Plumbing penetrations through the floor");
  }
  entryPoints.push("Door sweeps and weatherstripping gaps");
  entryPoints.push("Dryer vent and exhaust fan openings without proper covers");
  if (hasAttic) entryPoints.push("Roof vents, soffit gaps, and chimney flashing");
  if (homeAge === "old" || homeAge === "very_old") {
    entryPoints.push("Settling cracks in older foundations and walls — age-related gaps are common entry points");
  }

  // Immediate actions
  const immediateActions: string[] = [];
  const hasPets = household.includes("pets_dog") || household.includes("pets_cat");
  const hasKids = household.includes("kids");

  if (evidence.includes("droppings") && locations.includes("kitchen")) {
    immediateActions.push("Tonight: Put on gloves and a mask. Spray droppings with a bleach solution (1:10), wait 5 minutes, then wipe up with paper towels. Dispose in a sealed bag. Do NOT sweep or vacuum dry droppings.");
  }

  if (locations.includes("kitchen") || foodStorage === "open" || foodStorage === "mixed") {
    immediateActions.push("Move all open food (including pet food, bread, cereal) into hard-sided sealed containers or the refrigerator. Mice can chew through bags and cardboard in minutes.");
  }

  if (hasPets || hasKids) {
    immediateActions.push(`Set 2-3 enclosed snap trap stations along walls in active areas. These protect ${hasKids ? "children" : ""}${hasKids && hasPets ? " and " : ""}${hasPets ? "pets" : ""} from the snap mechanism while being effective. Bait with a pea-sized amount of peanut butter.`);
  } else {
    immediateActions.push("Set 3-4 snap traps perpendicular to walls in active areas — the trigger end should touch the wall. Bait with a pea-sized dab of peanut butter. Place 2 behind the refrigerator, 1 under the kitchen sink, and 1 near the most active evidence area.");
  }

  if (immediateActions.length < 3) {
    immediateActions.push("Seal the most obvious gap you can find tonight using steel wool stuffed tightly into the opening, then covered with caulk. Focus on gaps around pipes under sinks first — the #1 entry point.");
  }

  // Premium content — room-by-room strategy
  const roomByRoomStrategy: string[] = [];
  if (locations.includes("kitchen")) {
    roomByRoomStrategy.push("KITCHEN: Remove all food from lower cabinets. Clean with enzymatic cleaner. Place 2 snap traps behind fridge, 1 under sink. Seal pipe gaps with steel wool + caulk. Install cabinet door bumpers.");
  }
  if (locations.includes("attic")) {
    roomByRoomStrategy.push("ATTIC: Wear N95 mask. Set 4-6 snap traps along rafters and walls. Seal all soffit gaps with hardware cloth. Remove any nesting material with gloves.");
  }
  if (locations.includes("basement")) {
    roomByRoomStrategy.push("BASEMENT: Focus on foundation-level entry points. Set traps along walls every 6-8 feet. Seal utility penetrations. Remove clutter that provides harborage.");
  }
  if (locations.includes("garage")) {
    roomByRoomStrategy.push("GARAGE: Replace worn door seals. Set traps near storage areas. Move bird seed and pet food to sealed metal containers. Seal gaps around utility connections.");
  }
  if (locations.includes("bedroom")) {
    roomByRoomStrategy.push("BEDROOM: Set traps behind furniture along walls. Check for entry points around heating vents and baseboards. Remove any food or wrappers from the room.");
  }
  if (roomByRoomStrategy.length === 0) {
    roomByRoomStrategy.push("Focus on the kitchen and areas where you've seen the most evidence. Set traps along walls and behind appliances.");
  }

  // Shopping list with affiliate-ready links
  const shoppingList: { name: string; reason: string; affiliateUrl?: string }[] = [];
  if (hasPets || hasKids) {
    shoppingList.push({ name: "Tomcat Press 'N Set Enclosed Trap (6-pack)", reason: "Child & pet safe enclosed snap traps", affiliateUrl: "https://amzn.to/mouse-trap-enclosed" });
  } else {
    shoppingList.push({ name: "Victor M150 Snap Traps (12-pack)", reason: "Most effective traditional snap trap", affiliateUrl: "https://amzn.to/victor-snap-traps" });
  }
  shoppingList.push({ name: "Xcluder Steel Wool Fill Fabric", reason: "Mice can't chew through — stuff into gaps", affiliateUrl: "https://amzn.to/xcluder-steel-wool" });
  shoppingList.push({ name: "DAP Alex Plus Caulk", reason: "Seal over steel wool for permanent barrier", affiliateUrl: "https://amzn.to/dap-caulk" });
  shoppingList.push({ name: "Clorox Bleach Spray", reason: "Sanitize contaminated surfaces (1:10 dilution)", affiliateUrl: "https://amzn.to/clorox-spray" });
  shoppingList.push({ name: "N95 Respirator Masks (10-pack)", reason: "Protection during cleanup of droppings", affiliateUrl: "https://amzn.to/n95-masks" });
  shoppingList.push({ name: "Nitrile Disposable Gloves", reason: "Handle droppings and traps safely", affiliateUrl: "https://amzn.to/nitrile-gloves" });
  if (foodStorage === "open" || foodStorage === "mixed") {
    shoppingList.push({ name: "Glass Food Storage Containers Set", reason: "Mouse-proof your food supply", affiliateUrl: "https://amzn.to/glass-containers" });
  }

  // Elimination timeline
  const eliminationTimeline = [
    { day: "Day 1 (Tonight)", action: "Clean contaminated areas, set initial traps, seal most obvious entry point" },
    { day: "Day 2-3", action: "Check traps twice daily, reset as needed, identify additional entry points" },
    { day: "Day 4-7", action: "Seal all identified entry points with steel wool + caulk. Relocate traps if no catches" },
    { day: "Day 7-14", action: "Continue monitoring. Move traps to new locations. Deep clean affected areas" },
    { day: "Day 14-21", action: "Reduce trap count if no activity. Begin decontamination protocol" },
    { day: "Day 21-30", action: "Final inspection. Set monitoring traps. Begin prevention protocol" },
  ];

  // Decontamination steps
  const decontaminationSteps = [
    "Ventilate affected areas for 30 minutes before cleaning (open windows and doors)",
    "Wear N95 mask and disposable gloves throughout the entire process",
    "Spray all droppings, nesting material, and contaminated surfaces with bleach solution (1 part bleach : 10 parts water). Let soak 5 minutes",
    "Wipe up with disposable paper towels. Double-bag in sealed plastic bags for disposal",
    "NEVER sweep or vacuum dry droppings — this aerosolizes dangerous pathogens",
    "Mop hard floors with bleach solution. Steam clean carpets in heavily affected areas",
    "Wash all potentially contaminated fabrics (towels, linens, clothing) in hot water",
    "Disinfect kitchen surfaces, utensils, and cutting boards that may have been contacted",
  ];

  // Prevention calendar
  const preventionCalendar = [
    { month: "January", task: "Check all door sweeps and weatherstripping. Inspect attic for signs of nesting." },
    { month: "March", task: "Spring cleaning — deep clean behind appliances, check for new droppings." },
    { month: "May", task: "Inspect exterior foundation for new cracks. Trim vegetation 3 feet from home." },
    { month: "July", task: "Check outdoor attractants (compost, bird feeders). Clean garage thoroughly." },
    { month: "September", task: "CRITICAL: Pre-fall inspection. Seal all gaps before mice seek winter shelter." },
    { month: "November", task: "Set monitoring traps in attic, basement, garage. Check stored food for contamination." },
  ];

  return {
    species,
    severity,
    severityLabel,
    severityDescription: severityDescriptions[severityLabel],
    estimatedPopulation: { min: baseMin, max: baseMax },
    healthRisks,
    entryPoints,
    urgencyDays: severity <= 3 ? 14 : severity <= 6 ? 7 : 3,
    populationIn30Days: { min: Math.round(baseMin * 1.8), max: Math.round(baseMax * 2.5) },
    immediateActions,
    roomByRoomStrategy,
    shoppingList,
    eliminationTimeline,
    decontaminationSteps,
    preventionCalendar,
  };
}
