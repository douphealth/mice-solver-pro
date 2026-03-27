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
}

export function generateReport(answers: QuizAnswers): ReportData {
  const evidence = (answers.evidence as string[]) || [];
  const locations = (answers.location as string[]) || [];
  const timeline = answers.timeline as string;
  const homeType = answers.home_type as string;
  const surroundings = answers.surroundings as string;
  const household = (answers.household as string[]) || [];
  const previous = (answers.previous as string[]) || [];

  // Determine species
  const isRural = surroundings === "rural";
  const hasAttic = locations.includes("attic");
  const hasBasement = locations.includes("basement");

  let species;
  if (isRural && (hasAttic || locations.includes("garage"))) {
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

  // Calculate severity (1-10)
  let severity = 2;
  if (evidence.includes("sighting")) severity += 2;
  if (evidence.includes("droppings")) severity += 1;
  if (evidence.includes("gnaw_marks")) severity += 1;
  if (evidence.includes("nesting")) severity += 2;
  if (evidence.includes("grease_marks")) severity += 1;
  if (evidence.includes("sounds")) severity += 1;
  if (locations.length > 2) severity += 1;
  if (locations.length > 4) severity += 1;
  if (timeline === "months" || timeline === "ongoing") severity += 2;
  else if (timeline === "month") severity += 1;
  if (previous.includes("professional")) severity += 1;
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
  if (household.includes("allergies")) {
    healthRisks.push("Mouse dander and droppings are potent allergens and can trigger asthma attacks");
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
  entryPoints.push("Door sweeps and weatherstripping gaps");
  entryPoints.push("Dryer vent and exhaust fan openings without proper covers");
  if (hasAttic) entryPoints.push("Roof vents, soffit gaps, and chimney flashing");

  // Immediate actions
  const immediateActions: string[] = [];
  const hasPets = household.includes("pets_dog") || household.includes("pets_cat");
  const hasKids = household.includes("kids");

  if (evidence.includes("droppings") && locations.includes("kitchen")) {
    immediateActions.push("Tonight: Put on gloves and a mask. Spray droppings with a bleach solution (1:10), wait 5 minutes, then wipe up with paper towels. Dispose in a sealed bag. Do NOT sweep or vacuum dry droppings.");
  }

  if (locations.includes("kitchen")) {
    immediateActions.push("Move all open food (including pet food, bread, cereal) into hard-sided sealed containers or the refrigerator. Mice can chew through bags and cardboard in minutes.");
  }

  if (hasPets || hasKids) {
    immediateActions.push(`Set 2-3 enclosed snap trap stations (like the Tomcat Press 'N Set in a covered station) along walls in active areas. These protect ${hasKids ? "children" : ""}${hasKids && hasPets ? " and " : ""}${hasPets ? "pets" : ""} from the snap mechanism while being effective. Bait with a pea-sized amount of peanut butter.`);
  } else {
    immediateActions.push("Set 3-4 snap traps perpendicular to walls in active areas — the trigger end should touch the wall. Bait with a pea-sized dab of peanut butter. Place 2 behind the refrigerator, 1 under the kitchen sink, and 1 near the most active evidence area.");
  }

  if (immediateActions.length < 3) {
    immediateActions.push("Seal the most obvious gap you can find tonight using steel wool stuffed tightly into the opening, then covered with caulk. Focus on gaps around pipes under sinks first — the #1 entry point.");
  }

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
  };
}
