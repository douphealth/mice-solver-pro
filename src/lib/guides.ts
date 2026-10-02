import type { SourceId } from "./sources";

/**
 * Free guide content. Each block paraphrases the cited primary source (pages reviewed 2 October 2026).
 * Keep wording close to the source; do not add numbers, durations or claims the sources don't make.
 */

export interface Procedure { id: string; title: string; summary: string; source: SourceId; steps: string[] }

export const CLEANUP_PREP = {
  disinfectant: "Use a general-purpose household disinfectant (the label must include the word \"disinfectant\") or a fresh bleach solution of 1.5 cups household bleach in 1 gallon of water, which is 1 part bleach to 9 parts water. Make the bleach solution fresh before each use.",
  protection: "Wear rubber or plastic gloves. Homes with heavy rodent infestations need additional precautions.",
  never: "Never vacuum or sweep rodent urine, droppings or nesting material. The CDC explains that diseases mainly spread when people breathe in contaminated air, and sweeping or vacuuming can put tiny droplets carrying viruses into it. If you already vacuumed, follow the cleanup steps below.",
  never_mix: "Never mix bleach or disinfectants with other cleaning chemicals.",
};

export const CLEANUP_PROCEDURES: Procedure[] = [
  {
    id: "droppings", title: "Urine and droppings", source: "cdc-clean",
    summary: "For hard surfaces and floors where waste is visible.",
    steps: [
      "Put on rubber or plastic gloves.",
      "Spray urine and droppings with bleach solution or an EPA-registered disinfectant until very wet. Let it soak for 5 minutes or as long as the disinfectant label says.",
      "Wipe up the urine or droppings and the cleaning product with paper towels.",
      "Put the paper towels in a covered garbage can that is emptied regularly.",
      "Mop or sponge the area with a disinfectant. Clean all hard surfaces, including floors, countertops, cabinets and drawers.",
      "Wash your gloved hands with soap and water or a disinfectant before taking the gloves off.",
      "Wash your hands with soap and warm water after removing the gloves. If soap isn't available and your hands aren't visibly dirty, use an alcohol-based hand rub.",
    ],
  },
  {
    id: "dead", title: "Dead rodents and nests", source: "cdc-clean",
    summary: "Fleas are common on rodents, so the CDC suggests insect repellent (DEET or another EPA-registered product) on clothing, shoes and hands while you do this.",
    steps: [
      "Put on rubber or plastic gloves.",
      "Spray the dead rodent, the nest and the surrounding area with disinfectant. Let it soak for 5 minutes or as long as the label says.",
      "Place the dead rodent or nesting material in a plastic bag together with any used traps (see the next section if you plan to reuse a trap).",
      "Tie the bag closed, place it in a second plastic bag and tie that closed too.",
      "Put the bag in a covered garbage can that is emptied regularly. You can also ask your state health department about other ways to dispose of dead rodents.",
      "Wash your gloved hands with soap and water or a disinfectant before removing the gloves.",
      "Wash your hands with soap and warm water after removing the gloves.",
    ],
  },
  {
    id: "reuse", title: "Reusing a snap trap", source: "cdc-clean",
    summary: "Traditional snap traps can be reused if you clean them first.",
    steps: [
      "While wearing rubber gloves, submerge the trap with the rodent in disinfectant in a bucket for 5 minutes.",
      "Hold the trap over a plastic bag and lift the metal bar so the rodent drops into the bag.",
      "Rinse the trap well with water to remove the disinfectant scent and let it dry completely.",
      "Double bag the rodent, dispose of the bag and wash your gloves and hands as above.",
    ],
  },
  {
    id: "spaces", title: "Enclosed homes, cabins, sheds and barns", source: "cdc-clean",
    summary: "Ventilate first, then clean.",
    steps: [
      "Open all doors and windows for 30 minutes before cleaning, and leave the area during that time.",
      "Come back in, look for rodent waste and put on rubber or plastic gloves.",
      "Clean up all urine, droppings, nests and dead rodents using the steps above.",
      "Mop hard floors, or spray dirt floors in outbuildings, with disinfectant. Clean hard surfaces such as countertops, cabinets and drawers with disinfectant.",
      "Move storage boxes and containers with possibly contaminated items outside to a well-ventilated area in direct sunlight.",
      "If exposed insulation is contaminated with urine and droppings, put it into plastic bags for removal. Stay upwind while handling contaminated material outside so dust doesn't blow toward your face.",
      "Throw away cardboard boxes contaminated by urine or droppings. Plastic, glass or metal containers can be disinfected.",
      "Wash your gloved hands, remove the gloves and wash your hands with soap and warm water.",
    ],
  },
  {
    id: "fabrics", title: "Fabrics, carpets, books and paper", source: "cdc-clean",
    summary: "Do this after waste has been removed and sanitised.",
    steps: [
      "Launder possibly contaminated clothing, bedding and stuffed animals in hot water with detergent, then machine dry on high or hang them to dry in the sun.",
      "Shampoo rugs and upholstered furniture with a commercial disinfectant, or use a commercial-grade steam cleaner or shampoo.",
      "Leave books, papers and other items that can't take liquid disinfectant outdoors in sunlight for several hours. They can also sit in a rodent-free indoor area for at least three weeks; the CDC strongly suggests six.",
    ],
  },
  {
    id: "vehicle", title: "Cars, trucks and campers", source: "cdc-clean",
    summary: "Rodents can nest in vehicles that sit unused. Ask a qualified mechanic for help with anything mechanical.",
    steps: [
      "Work in a well-ventilated space. Open the hood, doors and trunk and let the vehicle air out for 20 minutes. Wear plastic gloves and a long-sleeved shirt.",
      "Inspect the air intakes and filters before starting an engine that has sat idle. Disconnect the battery cables before inspecting the engine compartment.",
      "Don't use a vacuum or high-pressure sprayer on waste or contaminated surfaces until they've been disinfected.",
      "Spray the waste and nesting material with disinfectant until soaked and let it sit for 5 minutes or as long as the label says. Pick it up with a paper towel and put it in the garbage.",
      "Clean the rest of the area with more disinfectant. If you find nesting material in the air intake, remove it along with the air filter and fit a new filter.",
      "Reconnect the battery when the area is dry, then wash your gloved hands and your bare hands.",
    ],
  },
];

export const CLEANUP_PRO_HELP = [
  "Evidence that rodents have been in heating or cooling ducts: contact a professional rodent-control service. Duct-cleaning companies know the risks.",
  "Heavy infestations, vacant buildings with large numbers of rodents, or confirmed rodent-borne disease in the local rodent population: special precautions apply. Contact your local health department with questions about your situation.",
  "Illness you think may be linked to rodents: talk to a healthcare provider and tell them about any exposure.",
];

export const GAP_PLACES = {
  inside: [
    "Inside, under and behind kitchen cabinets",
    "Floor areas in closets, especially corners",
    "Around the fireplace",
    "Around windows and doors",
    "Behind appliances",
    "Around the pipes under sinks and washing machines",
    "Around the pipes leading to water heaters and furnaces",
    "Around floor air vents and dryer vents",
    "Around all electrical, water, gas and sewer lines",
    "Inside the attic",
    "In the basement or crawl space",
    "Around floor drains, such as in a basement or laundry room",
    "Where the floor meets the wall",
  ],
  outside: [
    "The roof among rafters, gables, eaves and soffits",
    "Around windows and doors, especially those without weather stripping",
    "Between the foundation of the home and the ground",
    "Around attic and crawl-space vents",
    "Around holes for electrical, plumbing, cable and gas lines",
    "Gaps in trailer skirting and around the base of the house",
    "Outbuildings and garages",
  ],
};

export interface Material { id: string; use: string; note: string; verdict: "works" | "temporary" | "avoid"; source: SourceId }
export const MATERIALS: Material[] = [
  { id: "steel-wool", use: "Coarse steel wool, packed into small holes", note: "The CDC suggests holding it in place with caulk or spray foam. UC IPM calls steel wool a good temporary plug that may rust over time.", verdict: "temporary", source: "cdc-seal" },
  { id: "wire", use: "Wire screen or hardware cloth", note: "UC IPM lists wire screen for small openings. The CDC lists hardware cloth for larger ones. Use mesh openings smaller than 1/4 inch.", verdict: "works", source: "ucipm" },
  { id: "metal", use: "Sheet metal, flashing, lath screen or cement", note: "Durable for larger holes, foundation cracks and openings around pipes, vents and cables. Cut materials to fit around pipes.", verdict: "works", source: "cdc-seal" },
  { id: "caulk", use: "Caulk", note: "Seals gaps between the foundation and the ground and holds steel wool in place. It isn't a barrier by itself in a large gap.", verdict: "temporary", source: "cdc-seal" },
  { id: "foam", use: "Expanding foam, plastic, rubber, vinyl or wood used alone", note: "UC IPM lists these as ineffective for plugging holes mice use, because mice can gnaw through them.", verdict: "avoid", source: "ucipm" },
];

export const TRAP_STEPS = [
  { title: "Choose snap traps sized for mice", body: "The CDC recommends traditional snap traps, and UC IPM calls them a great first step for most homes. Simple wooden traps are the cheapest option. Plastic ones are easier to set and clean. A wide trigger plate has a higher catch rate, so set the trigger lightly.", source: "ucipm" as SourceId },
  { title: "Bait lightly", body: "UC IPM says the best bait is often the food mice are already eating. Peanut butter is popular but can be an allergy risk for some people. The CDC lists chunky peanut butter or mutton fat. Because nest-building females are highly motivated, a ball of cotton wool or dental floss can also work. Use a small amount on the trigger. Too much and a mouse can take it without setting the trap off.", source: "ucipm" as SourceId },
  { title: "Place traps against walls, forming a \"T\"", body: "Rodents prefer to run next to walls and objects. Put the trap on the floor against the wall with the baited end next to the wall, so the trap and wall form a \"T\". UC IPM adds that traps should sit close to the wall so a mouse passes directly over the trigger.", source: "cdc-trap" as SourceId },
  { title: "Go where the evidence is", body: "Set traps where you've seen mice, nesting material, urine and droppings, nibbled food or gnaw marks, and in closed areas such as behind the stove and refrigerator and at the back of cabinets and drawers. Also try attics, basements and crawl spaces. UC IPM adds dark corners and spots behind objects.", source: "cdc-trap" as SourceId },
  { title: "Use enough traps, spaced sensibly", body: "UC IPM says to use enough traps to make trapping short and decisive. House mice rarely stray more than about 30 feet from their nest and food, so space traps no more than about 10 feet apart where mice are active. Pairs set 1 to 2 inches apart can increase success with mice that jump over obstacles.", source: "ucipm" as SourceId },
  { title: "Check daily and dispose safely", body: "Check traps every day and dispose of any dead rodent right away, using gloves and double bagging. Reset traps until activity stops. Don't touch mice with bare hands and wash your hands after handling traps.", source: "cdc-trap" as SourceId },
  { title: "Keep going until it's quiet", body: "The CDC says to continue trapping until no more rodents are caught and no new signs appear for a week. If trapping doesn't solve the problem you can consider a poison bait station (EPA-registered, out of reach of children and pets) or seek professional help.", source: "cdc-trap" as SourceId },
];

export const TRAP_AVOID = [
  { title: "Glue traps and live traps", body: "The CDC advises against them because a frightened rodent may urinate, raising your chance of getting sick. UC IPM adds that adult mice often avoid glue boards and trapped animals may not die quickly.", source: "cdc-trap" as SourceId },
  { title: "Relocating live mice", body: "UC IPM says relocation is ineffective, since mice moved as much as half a mile can find their way back, and in California it's illegal without a permit.", source: "ucipm" as SourceId },
  { title: "Traps where children, pets or wildlife can reach them", body: "Always keep traps and bait out of reach. No trap is automatically child- or pet-safe.", source: "cdc-trap" as SourceId },
  { title: "Relying on ultrasonic or other devices", body: "UC IPM found little evidence that sound, magnetic or vibrational devices drive established house mice out of buildings.", source: "ucipm" as SourceId },
];

export interface SignInfo { id: string; label: string; physical: boolean; means: string; cannot: string; next: string[]; source: SourceId; hazard?: boolean }
export const SIGNS: SignInfo[] = [
  { id: "droppings", label: "Droppings", physical: true, source: "ucipm",
    means: "UC IPM lists droppings, fresh gnaw marks and tracks as signs of areas where mice are active.",
    cannot: "Droppings alone can't tell you which species left them, how many animals there are or how long ago they were left.",
    next: ["Don't touch, sweep or vacuum them. Follow the wet cleanup steps.", "Photograph and note where they are so you can spot new ones after cleanup.", "Set snap traps nearby, against the wall, and check daily."] },
  { id: "gnaw_marks", label: "Gnaw marks", physical: true, source: "ucipm",
    means: "Fresh gnaw marks on packaging, wood or cords point to places where mice are active and feeding.",
    cannot: "A gnaw mark doesn't tell you whether the animal is still around or how many there are.",
    next: ["Check the area for droppings and nests.", "Move food into thick containers with tight lids.", "Look for gaps in the same room."] },
  { id: "sighting", label: "A mouse sighting", physical: true, source: "ucipm",
    means: "UC IPM notes mice are mostly active at night but can be seen in daylight, because they're active whenever food is available.",
    cannot: "One sighting doesn't establish how many mice there are or how long they've been there.",
    next: ["Note where and when you saw it.", "Set traps along the route, against walls.", "Secure food and seal gaps."] },
  { id: "tracks", label: "Tracks or tail marks", physical: true, source: "ucipm",
    means: "UC IPM says tracks or footprints can also indicate presence, though they're harder to find.",
    cannot: "Tracks can't confirm how recent the activity is.",
    next: ["Compare with other physical evidence.", "Place traps where tracks lead along walls."] },
  { id: "nesting", label: "Nesting material", physical: true, source: "ucipm",
    means: "UC IPM says house mouse nests are built in sheltered locations from finely shredded paper or other fibrous material, often behind boxes, in drawers, in garages or near woodpiles.",
    cannot: "A nest doesn't show whether it's currently in use.",
    next: ["Don't disturb it dry. Wear gloves, spray with disinfectant and follow the nest cleanup steps.", "Look for what they're using as shelter and remove it."] },
  { id: "sounds", label: "Scratching or other noises", physical: false, source: "ucipm",
    means: "Mice are mostly nocturnal, so noise at night can be a clue.",
    cannot: "Noise alone can't confirm rodents or pinpoint a nest in a wall. Don't cut drywall because of sound alone.",
    next: ["Inspect for physical evidence in nearby accessible areas.", "Check for gaps around the room.", "If you find nothing, keep a short log before deciding what to do."] },
  { id: "urine_smell", label: "A musky odor", physical: false, source: "ucipm",
    means: "UC IPM says house mice have a characteristic musky odor that is common in large or long-term infestations.",
    cannot: "An odor alone doesn't establish the source, how many animals there are or any health risk. Other things smell musty too.",
    next: ["Look for droppings, nests and urine stains near the odor.", "Ventilate the space before cleaning.", "If you can't find the source, consider a professional inspection."] },
  { id: "grease_marks", label: "Smudges along edges", physical: false, source: "cdc-trap",
    means: "The CDC notes rodents prefer to run next to walls, so rub marks along edges can show a travel route.",
    cannot: "Marks alone don't confirm current activity.",
    next: ["Look for fresh droppings or gnawing along the same route.", "If you find evidence, place traps along that route."] },
  { id: "damaged_wiring", label: "Damaged wiring", physical: true, hazard: true, source: "ucipm",
    means: "UC IPM says mice gnaw wires and that rodent gnawing is believed to cause many fires of unknown origin.",
    cannot: "Only a qualified electrician can tell whether a wire is still safe.",
    next: ["Keep away from the damaged wiring.", "Arrange a qualified electrician.", "Smoke, sparks or a burning smell need an emergency response."] },
  { id: "ventilation", label: "Waste in heating or cooling ducts", physical: true, hazard: true, source: "cdc-clean",
    means: "The CDC says evidence that rodents have been in ventilation systems needs a professional.",
    cannot: "You can't judge the extent of duct contamination by looking.",
    next: ["Don't run or clean the system yourself.", "Contact a professional rodent-control service and a duct-cleaning company."] },
  { id: "heavy_contamination", label: "Extensive or hard-to-reach waste", physical: true, hazard: true, source: "cdc-clean",
    means: "The CDC lists special precautions for heavy infestations and for vacant buildings with large amounts of waste.",
    cannot: "Routine cleanup steps aren't enough for every situation.",
    next: ["Keep people and pets out.", "Contact your local or state health department or a qualified cleanup service before disturbing it."] },
];
