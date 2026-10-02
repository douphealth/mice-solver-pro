import type { QuizAnswers } from "./quiz-data";
import type { SourceId } from "./sources";

export const PLANNER_LIMITATION =
  "This planner cannot diagnose an infestation, identify a species with certainty, estimate how many mice are present, assess disease risk or promise a clearance date.";
export const METHOD_VERSION = "2026-10-02";

export type Phase = "today" | "week" | "ongoing";
export type StatusLevel = "attention" | "verify" | "unconfirmed";

export interface ActionItem {
  id: string;
  phase: Phase;
  title: string;
  detail: string;
  source?: SourceId;
  tone?: "safety" | "normal";
  /** In-app page where the topic is covered in depth. */
  learnMore?: { to: string; label: string };
}
export interface RoomPrompt { id: string; title: string; prompt: string }
export interface Plan {
  methodVersion: string;
  status: { level: StatusLevel; label: string; summary: string };
  observed: { physical: string[]; uncertain: string[] };
  hazards: ActionItem[];
  priorities: ActionItem[];
  actions: ActionItem[];
  rooms: RoomPrompt[];
  watchFor: string[];
  flags: { physical: boolean; kids: boolean; pets: boolean; multiunit: boolean; returning: boolean; foodOpen: boolean };
}

const PHYSICAL: Record<string, string> = {
  droppings: "Possible droppings. Appearance alone doesn't establish the animal or how recent they are.",
  gnaw_marks: "Chewing damage. Inspect without touching damaged wiring or disturbing waste.",
  nesting: "Possible nesting material. Don't disturb it dry.",
  sighting: "A rodent sighting. One sighting doesn't establish how many animals there are or which species.",
  tracks: "Possible tracks. Compare them with other physical evidence.",
};
const UNCERTAIN: Record<string, string> = {
  sounds: "Scratching or other noises. Noise alone can't confirm rodents or locate a nest.",
  urine_smell: "An odor. Odor alone can't establish its source, how many animals there are or any health risk.",
  grease_marks: "Smudges. Marks alone don't confirm current activity.",
};

const HAZARDS: Record<string, ActionItem> = {
  damaged_wiring: {
    id: "haz-wiring", phase: "today", tone: "safety", source: "ucipm",
    title: "Keep clear of damaged wiring",
    detail: "Don't touch or move it. Arrange an assessment by a qualified electrician. Smoke, sparks or a burning smell need an emergency response. UC IPM notes that mice gnaw wires and that rodent gnawing is suspected in many fires of unknown origin.",
  },
  ventilation: {
    id: "haz-duct", phase: "today", tone: "safety", source: "cdc-clean",
    title: "Leave duct contamination to professionals",
    detail: "Don't clean the heating or cooling system yourself. The CDC advises contacting a professional rodent-control service when there is evidence that rodents have accessed ventilation systems; duct-cleaning companies know the risks.",
  },
  heavy_contamination: {
    id: "haz-heavy", phase: "today", tone: "safety", source: "cdc-clean",
    title: "Don't disturb extensive or hard-to-reach waste",
    detail: "Keep people and pets out of the area. The CDC lists special precautions for heavy contamination and for vacant buildings with large amounts of waste. Ask your local health department or a qualified cleanup service before you disturb it.",
  },
};

const ROOMS: Record<string, RoomPrompt> = {
  kitchen: { id: "kitchen", title: "Kitchen", prompt: "Look behind the stove and refrigerator, in the backs of cabinets and drawers, and around sink plumbing. Protect food and food-contact surfaces. Only move appliances you can disconnect and move safely." },
  attic: { id: "attic", title: "Attic", prompt: "Inspect only from safe, accessible spots and don't step on unsupported ceilings. Leave contaminated insulation alone until you have read the CDC cleanup steps for insulation." },
  basement: { id: "basement", title: "Basement", prompt: "Check the perimeter where walls meet the floor, around utility lines and floor drains, and any stored food. Reduce clutter that offers shelter once it's safe to handle." },
  garage: { id: "garage", title: "Garage", prompt: "Check door seals, stored pet food, birdseed and boxes. Keep grains and feed in thick plastic or metal containers with tight lids." },
  bedroom: { id: "bedroom", title: "Bedroom", prompt: "Inspect accessible edges, closets and under furniture. Remove food, and keep traps and bait where children and pets can't reach." },
  walls: { id: "walls", title: "Near or inside walls", prompt: "Inspect the accessible edges on both sides of the wall. Sounds can't pinpoint a nest, so don't cut into drywall or put loose poison into a wall void." },
  bathroom: { id: "bathroom", title: "Bathroom", prompt: "Check around pipes under sinks and behind the toilet without disturbing electrical or building services." },
  living_room: { id: "living_room", title: "Living room", prompt: "Check along walls, behind furniture and around the fireplace. Remove food debris and pet treats." },
  crawlspace: { id: "crawlspace", title: "Crawl space", prompt: "If access is tight, wet or contaminated, hire a professional rather than crawling in. Check vents and utility penetrations from outside as well." },
  laundry: { id: "laundry", title: "Laundry room", prompt: "Check pipe penetrations, floor drains and door seals. Never block dryer exhaust or fit a lint-catching screen to it." },
};

const has = (input: unknown, id: string): boolean => Array.isArray(input) && input.includes(id);
const pick = (input: unknown, allowed: Record<string, string>): string[] =>
  Array.isArray(input)
    ? [...new Set(input.filter((v): v is string => typeof v === "string" && Object.prototype.hasOwnProperty.call(allowed, v)))].map(v => allowed[v])
    : [];

/** Build the free plan. Deterministic: the same answers always produce the same plan. */
export function generatePlan(input: QuizAnswers | unknown): Plan {
  const a: Record<string, unknown> = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const physical = pick(a.evidence, PHYSICAL);
  const uncertain = pick(a.evidence, UNCERTAIN);
  const hazards = (Array.isArray(a.evidence) ? [...new Set(a.evidence)] : [])
    .filter((v): v is string => typeof v === "string" && Object.prototype.hasOwnProperty.call(HAZARDS, v))
    .map(v => HAZARDS[v]);
  const havePhysical = physical.length > 0;
  const kids = has(a.household, "kids");
  const pets = has(a.household, "pets_dog") || has(a.household, "pets_cat") || has(a.household, "pets");
  const multiunit = a.home_type === "apartment" || a.home_type === "townhouse";
  const returning = a.duration === "returning";
  const lingering = a.duration === "months" || returning;
  const foodOpen = a.food_storage === "open";
  const foodMixed = a.food_storage === "mixed";
  const previously = (id: string) => has(a.previous, id);

  const actions: ActionItem[] = [...hazards];

  // ---- Today ----
  if (!havePhysical) {
    actions.push({
      id: "t-inspect", phase: "today", source: "ucipm",
      title: "Look for physical evidence before you act",
      detail: "Check along walls, behind boxes and appliances, and in drawers, garages and woodpiles for droppings, fresh gnaw marks, tracks and nests of shredded paper or fibre. Noises and odors alone don't confirm rodents.",
    });
  } else {
    actions.push({
      id: "t-record", phase: "today",
      title: "Record what you found and where",
      detail: "Note each location and take a quick photo. After safe cleanup, anything new is easier to recognize and easier to describe to a professional.",
    });
  }
  actions.push({
    id: "t-food", phase: "today", source: "cdc-seal",
    title: foodOpen ? "Close off open food and pet bowls now" : foodMixed ? "Move chewable packaging into hard containers" : "Keep food storage airtight",
    detail: "Store food in thick plastic, metal or glass containers with tight lids. Clean up spills right away, don't leave pet food or water bowls out overnight, and keep indoor garbage in covered, thick containers that you empty often.",
  });
  actions.push({
    id: "t-supplies", phase: "today", source: "cdc-clean",
    title: "Gather your cleanup and trapping supplies",
    detail: "You'll need rubber or plastic gloves, a household disinfectant (the label must say \"disinfectant\") or a fresh bleach solution of 1.5 cups bleach per gallon of water, paper towels, plastic bags and a covered trash can. Add snap traps sized for mice. Never mix cleaning chemicals.",
    learnMore: { to: "/tools/cleanup-guide", label: "Cleanup guide" },
  });
  if (havePhysical) {
    actions.push({
      id: "t-traps", phase: "today", source: "cdc-trap",
      title: "Set snap traps where you found signs",
      detail:
        "Place traps against a wall with the baited end next to the wall, forming a \"T\". Use only a small amount of bait on the trigger, because UC IPM warns that too much lets a mouse take it without setting the trap off. " +
        (kids || pets
          ? "Put traps where children and pets can't reach them, such as behind appliances or in enclosed spots, and check that nothing but a mouse can trigger them. A covered trap is not automatically safe. "
          : "Keep traps out of reach of children, pets and other non-target animals, including visitors. ") +
        "Follow the instructions on the box.",
      learnMore: { to: "/tools/trap-placement", label: "Trap placement guide" },
    });
  }
  if (previously("glue_traps")) {
    actions.push({
      id: "t-glue", phase: "today", tone: "safety", source: "cdc-trap",
      title: "Stop using glue traps",
      detail: "The CDC advises against glue and live traps because a frightened rodent may urinate. UC IPM adds that adult mice often avoid glue boards, that trapped animals may not die quickly, and that vegetable oil can loosen glue if a pet or wild animal is caught.",
    });
  }
  if (previously("poison")) {
    actions.push({
      id: "t-poison", phase: "today", tone: "safety", source: "ucipm",
      title: "Keep rodenticide in locked, tamper-resistant stations",
      detail: "All rodenticides are toxic to people, pets and wildlife. Keep bait out of reach, follow the label exactly and don't add other products on top. UC IPM also notes that mice poisoned indoors may die inside the structure, which can cause odor.",
    });
  }
  if (previously("ultrasonic") || previously("peppermint")) {
    actions.push({
      id: "t-devices", phase: "today", source: "ucipm",
      title: "Don't rely on repellents or ultrasonic devices",
      detail: "UC IPM found little evidence that sound, magnetic or vibrational devices drive established house mice out of buildings. The CDC and UC IPM pages this planner draws on don't list scents or essential oils as a control method. Put your effort into gaps, food access and traps.",
    });
  }

  // ---- This week ----
  if (havePhysical) {
    actions.push({
      id: "w-check", phase: "week", source: "cdc-trap",
      title: "Check traps every day",
      detail: "Dispose of any dead rodent right away using gloves and double bagging, and reset or move traps where activity continues. The CDC notes that house mice are less cautious than rats and may be trapped more quickly. UC IPM suggests pairs of traps 1 to 2 inches apart and, where mice are active, traps no more than about 10 feet apart.",
      learnMore: { to: "/tools/trap-placement", label: "Trap placement guide" },
    });
  }
  actions.push({
    id: "w-clean", phase: "week", source: "cdc-clean",
    title: "Clean up safely. Never sweep or vacuum waste",
    detail: "Open doors and windows for 30 minutes and leave the area first. Wearing gloves, spray droppings, urine and nests with disinfectant until very wet, wait 5 minutes (or the label time), wipe up with paper towels, bin them in a covered can, then mop or sponge hard surfaces and wash your hands.",
    learnMore: { to: "/tools/cleanup-guide", label: "Cleanup guide" },
  });
  actions.push({
    id: "w-gaps", phase: "week", source: "cdc-seal",
    title: "Inspect for gaps a pencil could fit through",
    detail: "Mice can use a hole about 1/4 inch (6 mm) wide. UC IPM adds that they can squeeze under a gap 1/4 inch tall and through an opening 3/8 inch wide. Check around pipes, vents, doors, windows, the foundation line and utility lines.",
    learnMore: { to: "/tools/entry-points", label: "Entry-gap checklist" },
  });
  actions.push({
    id: "w-seal", phase: "week", source: "cdc-seal",
    title: "Seal what you find with materials mice can't chew",
    detail: "The CDC suggests steel wool for small holes, held in place with caulk or spray foam, and lath screen, metal, cement or hardware cloth for larger ones. UC IPM stresses that plastic, rubber, vinyl, wood and foam on its own are easy to gnaw through.",
    learnMore: { to: "/tools/entry-points", label: "Entry-gap checklist" },
  });
  if (multiunit) {
    actions.push({
      id: "w-multiunit", phase: "week", source: "cdc-seal",
      title: "Tell your landlord or building manager",
      detail: "Shared walls and service openings mean your own repairs may not be enough, and common-area repairs usually need the owner. Don't alter shared building services yourself. The CDC also suggests contacting your local or state health department with questions.",
    });
  }
  if (a.home_type === "mobile") {
    actions.push({
      id: "w-mobile", phase: "week", source: "cdc-seal",
      title: "Check skirting and the base of the home",
      detail: "The CDC specifically lists fixing gaps in trailer skirting and using flashing around the base of the home.",
    });
  }
  if (a.home_type === "cabin") {
    actions.push({
      id: "w-cabin", phase: "week", source: "cdc-clean",
      title: "Air out closed cabins and sheds first",
      detail: "For closed outbuildings, the CDC advises opening doors and windows for 30 minutes before cleaning and staying out during that time. Seal outbuildings and garages as well.",
    });
  }

  // ---- Ongoing ----
  actions.push({
    id: "o-trapping", phase: "ongoing", source: "cdc-trap",
    title: "Keep trapping until catches and new signs stop",
    detail: "The CDC says to continue until no more rodents are caught and no new signs appear for a week. Treat that as a check-in point rather than a guarantee, and keep monitoring afterwards.",
  });
  if (lingering) {
    actions.push({
      id: "o-reinspect", phase: "ongoing", source: "ucipm",
      title: returning ? "Re-inspect your earlier repairs" : "Re-inspect for missed gaps",
      detail: "UC IPM calls exclusion the most successful and permanent form of house-mouse control. If signs return or last a long time, look for gaps that were missed, repairs mice chewed through and materials that were easy to gnaw.",
    });
  }
  actions.push({
    id: "o-outdoor", phase: "ongoing", source: "cdc-seal",
    title: "Reduce outdoor food and shelter",
    detail: "The CDC suggests keeping compost bins and woodpiles at least 100 feet from the house (with wood raised a foot off the ground), using tight-lidded garbage cans, keeping grills clean, moving bird feeders away and trimming brush. UC IPM adds that mice climb well, so thin plants growing up walls.",
  });
  actions.push({
    id: "o-autumn", phase: "ongoing", source: "ucipm",
    title: "Re-check your seals before autumn",
    detail: "Where mice live outdoors, UC IPM notes they often move into homes in autumn when nights turn colder.",
  });
  actions.push({
    id: "o-escalate", phase: "ongoing", source: "cdc-trap",
    title: "Decide in advance when to call a professional",
    detail: "The CDC says that if trapping does not resolve the problem you can consider a poison bait station or seek professional help. Signs in places you can't reach, hazards listed above and activity that continues after cleanup and sealing are all good reasons to call.",
  });

  // ---- Priorities (top three) ----
  const order = ["haz-wiring", "haz-duct", "haz-heavy", "t-glue", "t-poison", "t-traps", "t-food", "t-inspect", "t-supplies", "t-record"];
  const priorities = order.map(id => actions.find(x => x.id === id)).filter((x): x is ActionItem => Boolean(x)).slice(0, 3);

  // ---- Status ----
  const status: Plan["status"] = hazards.length
    ? { level: "attention", label: "Reported conditions need qualified attention", summary: "At least one thing you reported shouldn't be handled as a DIY job. Start there, then work through the rest of your plan." }
    : havePhysical
    ? { level: "verify", label: "Physical signs reported: inspect and verify", summary: "You reported physical signs. Confirm what you can see, set protected traps, secure food and seal gaps in that order." }
    : { level: "unconfirmed", label: "Activity not confirmed by physical evidence", summary: "Nothing you selected confirms rodents yet. Inspect for physical evidence first so you act on what's really there." };

  const rooms = Array.isArray(a.location)
    ? [...new Set(a.location)].filter((v): v is string => typeof v === "string" && Object.prototype.hasOwnProperty.call(ROOMS, v)).map(v => ROOMS[v])
    : [];

  const watchFor = [
    ...(hazards.length ? ["You reported damaged wiring, duct contamination or heavy contamination. Ask a qualified professional before you proceed."] : []),
    "Signs keep appearing after a week or more of consistent trapping, safe cleanup and sealing.",
    "Evidence is in places you can't safely reach, such as inside walls, ducts, a crawl space or a roof void.",
    "You develop symptoms after possible rodent exposure. Talk to a healthcare provider and mention the exposure, as the CDC advises.",
  ];

  return {
    methodVersion: METHOD_VERSION,
    status,
    observed: { physical, uncertain },
    hazards,
    priorities,
    actions,
    rooms,
    watchFor,
    flags: { physical: havePhysical, kids, pets, multiunit, returning, foodOpen },
  };
}

export const PHASE_META: Record<Phase, { label: string; blurb: string }> = {
  today: { label: "Today", blurb: "Safety first, then the steps that start working immediately." },
  week: { label: "This week", blurb: "Check traps daily, clean up and close the gaps." },
  ongoing: { label: "Ongoing", blurb: "Monitor, stay sealed and know when to escalate." },
};

const safetyFirst = (list: ActionItem[]): ActionItem[] => [...list.filter(x => x.tone === "safety"), ...list.filter(x => x.tone !== "safety")];

export function actionsByPhase(plan: Plan): Record<Phase, ActionItem[]> {
  return {
    today: safetyFirst(plan.actions.filter(x => x.phase === "today")),
    week: safetyFirst(plan.actions.filter(x => x.phase === "week")),
    ongoing: safetyFirst(plan.actions.filter(x => x.phase === "ongoing")),
  };
}

/** The opening sentence of a longer explanation, for compact cards. Never cuts a sentence in half. */
export function firstSentence(text: string, max = 190): string {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  const sentence = (m ? m[0] : text).trim();
  if (sentence.length <= max) return sentence;
  const cut = sentence.slice(0, max).replace(/\s+\S*$/, "");
  return `${cut}...`;
}
