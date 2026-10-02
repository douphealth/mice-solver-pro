import type { ProPack } from "../src/lib/pro-types";

/**
 * Pro Masterplan content. Served only to verified purchasers (see worker/index.ts), so it is deliberately not part of the public bundle.
 * Every recommendation traces to the CDC rodent-control pages or the UC IPM house-mouse pest notes (reviewed 2 October 2026),
 * or is plain household-safety practice. Nothing here estimates mouse numbers or promises a result.
 */
export const PRO_PACK: ProPack = {
  version: "2026-10-02",

  milestones: [
    {
      day: 0, title: "Safety check and setup", focus: "Decide what is safe to do yourself, then get ready.",
      tasks: [
        { id: "d0-hazards", text: "Re-read the hazards in your plan. If you reported damaged wiring, duct contamination or heavy contamination, arrange qualified help before continuing.", source: "cdc-clean" },
        { id: "d0-supplies", text: "Gather gloves, disinfectant (label must say \"disinfectant\") or fresh bleach solution, paper towels, plastic bags, a covered trash can and mouse-size snap traps.", source: "cdc-clean" },
        { id: "d0-map", text: "Sketch the floor plan or take photos, and mark every place you found signs. This becomes your baseline for the evidence log.", source: "ucipm" },
        { id: "d0-ventilate", text: "Before cleaning an enclosed home, cabin or outbuilding, open doors and windows for 30 minutes and leave the area during that time.", source: "cdc-clean" },
      ],
    },
    {
      day: 1, title: "Lock down food and set the first traps", focus: "Remove the reward, then start trapping where signs are.",
      tasks: [
        { id: "d1-food", text: "Move food and pet food into thick plastic, metal or glass containers with tight lids. Put pet bowls away overnight and cover indoor garbage.", source: "cdc-seal" },
        { id: "d1-traps", text: "Set snap traps against walls where you found signs, with the bait end next to the wall in a \"T\". Space them no more than about 10 feet apart where mice are active, and consider pairs 1 to 2 inches apart.", source: "ucipm" },
        { id: "d1-bait", text: "Use only a small amount of bait on each trigger. Too much lets a mouse remove it without setting the trap off.", source: "ucipm" },
        { id: "d1-clean", text: "Clean up droppings the safe way: spray until very wet, wait 5 minutes, wipe with paper towels and bin them. Never sweep or vacuum.", source: "cdc-clean" },
      ],
    },
    {
      day: 3, title: "Inspect the inside for gaps", focus: "Find every opening a pencil could pass through.",
      tasks: [
        { id: "d3-indoor", text: "Check under and behind kitchen cabinets, behind appliances, around pipes under sinks and washing machines, around water heater and furnace pipes, around floor air and dryer vents, and where floors meet walls.", source: "cdc-seal" },
        { id: "d3-closets", text: "Check closet corners, the fireplace surround, the attic, the basement or crawl space, and floor drains.", source: "cdc-seal" },
        { id: "d3-mark", text: "Mark each gap with painter's tape and note its approximate size. Anything about 1/4 inch (6 mm) or larger needs closing.", source: "cdc-seal" },
      ],
    },
    {
      day: 4, title: "Inspect the outside for gaps", focus: "Walk the whole perimeter with a flashlight.",
      tasks: [
        { id: "d4-roof", text: "Check the roofline: rafters, gables, eaves and soffits.", source: "cdc-seal" },
        { id: "d4-base", text: "Check the foundation line, around attic and crawl-space vents, and every hole for electrical, plumbing, cable and gas lines.", source: "cdc-seal" },
        { id: "d4-doors", text: "Check windows and doors, especially any without weather stripping. Doors, windows and screens should fit tightly.", source: "ucipm" },
        { id: "d4-plants", text: "Note plants or vines climbing walls. House mice climb well, so thin or remove them.", source: "ucipm" },
      ],
    },
    {
      day: 5, title: "Seal small holes and cracks", focus: "Use materials mice can't chew through.",
      tasks: [
        { id: "d5-steel", text: "Pack small holes with coarse steel wool and secure it with caulk or spray foam so it can't be pulled out. UC IPM notes steel wool can rust over time, so plan to re-check it.", source: "cdc-seal" },
        { id: "d5-foundation", text: "Seal cracks in the foundation and around openings for water pipes, vents and utility cables with metal or concrete.", source: "ucipm" },
        { id: "d5-caulk", text: "Use caulk to seal gaps between the home's foundation and the ground, and use flashing around the base of the house.", source: "cdc-seal" },
      ],
    },
    {
      day: 6, title: "Close larger gaps, doors and screens", focus: "Use metal or hardware cloth where gaps are larger.",
      tasks: [
        { id: "d6-large", text: "Cover larger holes with lath screen, metal, cement, hardware cloth or metal sheeting, cut to fit around pipes.", source: "cdc-seal" },
        { id: "d6-edges", text: "If door or window edges show gnawing, cover them with metal. Plastic, rubber, vinyl, wood and expanding foam on their own are ineffective.", source: "ucipm" },
        { id: "d6-services", text: "Don't block ventilation or drainage, and never fit a lint-catching screen to dryer exhaust. Ask a qualified tradesperson about utilities and fire-rated construction.", source: "cdc-seal" },
      ],
    },
    {
      day: 7, title: "Week-one review", focus: "Read your log and adjust before week two.",
      tasks: [
        { id: "d7-log", text: "Review your log. Count catches and new signs per location, without turning them into an estimate of how many mice are present.", source: "ucipm" },
        { id: "d7-adjust", text: "If new droppings, gnawing or catches continue, move traps to the busiest routes, refresh bait and look again for missed gaps.", source: "cdc-trap" },
        { id: "d7-pro", text: "If you still can't find where they are getting in, or signs are in places you can't reach, book a professional inspection.", source: "cdc-trap" },
      ],
    },
    {
      day: 10, title: "Tidy the outside", focus: "Take away outdoor food and shelter.",
      tasks: [
        { id: "d10-bins", text: "Use thick plastic or metal garbage cans with tight lids and no holes. Keep outdoor cooking areas and grills clean.", source: "cdc-seal" },
        { id: "d10-wood", text: "Move woodpiles at least 100 feet from the house and raise wood at least a foot off the ground. Keep compost bins at least 100 feet away.", source: "cdc-seal" },
        { id: "d10-feed", text: "Move bird feeders away from the house and store grains and animal feed in thick containers with tight lids. Trim brush and weeds near the house.", source: "cdc-seal" },
      ],
    },
    {
      day: 12, title: "Service traps and rotate bait", focus: "Keep traps clean and attractive.",
      tasks: [
        { id: "d12-reuse", text: "To reuse a snap trap safely: wearing gloves, submerge it with the rodent in disinfectant for 5 minutes, release it over a plastic bag, rinse and let it dry fully.", source: "cdc-clean" },
        { id: "d12-bait", text: "Try the food mice are already eating as bait. Peanut butter works well but can be an allergy risk for some people. A small ball of cotton wool or dental floss can lure mice that want nesting material.", source: "ucipm" },
      ],
    },
    {
      day: 14, title: "Two-week review", focus: "Are signs fading, steady or moving?",
      tasks: [
        { id: "d14-log", text: "Compare weeks one and two in the log chart. Moved or repeated signs point to another route or a gap you missed.", source: "ucipm" },
        { id: "d14-repairs", text: "Re-inspect every repair for chew marks or pulled-out material, and redo any that failed.", source: "ucipm" },
      ],
    },
    {
      day: 21, title: "Three-week review", focus: "Test whether activity has really stopped.",
      tasks: [
        { id: "d21-log", text: "Check the log: no catches and no new signs for a full week is the CDC's check-in point for ending trapping. It isn't a guarantee.", source: "cdc-trap" },
        { id: "d21-continue", text: "If signs persist, keep trapping and consider professional help. The CDC says that if trapping does not solve the problem you can consider a poison bait station or seek professional help.", source: "cdc-trap" },
      ],
    },
    {
      day: 28, title: "Final quiet-week check", focus: "Decide whether to move into monitoring.",
      tasks: [
        { id: "d28-quiet", text: "If the last seven days brought no catches and no new signs, you can step down from daily checks. Leave a few traps in the most likely spots and keep checking the bait weekly. The CDC advises checking bait weekly for at least 15 days.", source: "cdc-trap" },
        { id: "d28-clean", text: "Do a final wet clean of areas where waste was found, then wash hands thoroughly.", source: "cdc-clean" },
      ],
    },
    {
      day: 30, title: "Month review and maintenance plan", focus: "Make the result last.",
      tasks: [
        { id: "d30-calendar", text: "Add the seasonal checks from the Prevention tab to your calendar, starting with an autumn re-check of seals.", source: "ucipm" },
        { id: "d30-monthly", text: "Do a quick 10-minute inspection each month: gaps, food storage, garbage and new droppings.", source: "cdc-seal" },
      ],
    },
  ],

  dailyCheck: {
    fromDay: 2,
    toDay: 27,
    text: "Check every trap. Wearing gloves, double-bag and dispose of any catch, reset or move traps where activity continues, and record the result in your log.",
    source: "cdc-trap",
  },

  rooms: {
    kitchen: {
      id: "kitchen", title: "Kitchen",
      inspect: [
        "Inside, under and behind cabinets, and the backs of drawers.",
        "Behind the stove and refrigerator. Only move appliances you can disconnect and move safely.",
        "Around pipes under the sink and around gas, water and electrical lines.",
        "Around floor air vents and where the floor meets the wall.",
      ],
      trapping: ["Closed spots such as behind the stove and refrigerator and at the back of cabinets are where the CDC suggests placing traps.", "Put traps flat against the wall, bait end to the wall."],
      keep: ["Store food in thick plastic, metal or glass containers with tight lids.", "Clean up spills right away and wash dishes soon after use.", "Put pet food away and keep garbage covered."],
      safety: ["Keep traps and bait away from food-preparation areas and out of reach of children and pets.", "Disinfect hard surfaces after cleanup following the product label, and wash hands with soap and warm water."],
      sources: ["cdc-seal", "cdc-trap"],
    },
    attic: {
      id: "attic", title: "Attic",
      inspect: [
        "Look for nests of shredded paper or fibre, droppings and gnawed wiring from safe, accessible positions.",
        "From outside, check rafters, gables, eaves, soffits and attic vents.",
      ],
      trapping: ["The CDC lists attics among areas without regular human traffic where traps can go. Place them near entry points and along edges."],
      keep: ["Store items in sealed plastic containers rather than cardboard."],
      safety: [
        "Don't step on unsupported ceilings. Use a stable platform and good light.",
        "Contaminated insulation can be bagged for removal, but wear the protection the CDC describes and call a professional for heavy contamination.",
        "Keep clear of damaged wiring and arrange an electrician.",
      ],
      sources: ["cdc-seal", "cdc-clean", "ucipm"],
    },
    basement: {
      id: "basement", title: "Basement",
      inspect: [
        "Where the floor meets the walls, around floor drains, and around pipes leading to the water heater and furnace.",
        "Foundation cracks and utility penetrations.",
      ],
      trapping: ["Basements and crawl spaces are listed by the CDC among likely entry areas. Place traps along walls near stored items and utility lines."],
      keep: ["Keep stored food, pet food and seed in thick containers with tight lids.", "Reduce cardboard clutter that gives mice shelter."],
      safety: ["Disturb dusty or contaminated storage only after wet cleanup steps.", "Move boxes that may be contaminated outside to a well-ventilated area in direct sunlight, as the CDC suggests."],
      sources: ["cdc-seal", "cdc-trap", "cdc-clean"],
    },
    garage: {
      id: "garage", title: "Garage",
      inspect: ["Door seals and the threshold.", "Stored pet food, birdseed, grains and boxes.", "Utility lines and vehicles that sit unused."],
      trapping: ["Place traps along walls and behind stored items where signs are present."],
      keep: ["Keep grains and animal feed in thick plastic or metal containers with tight lids.", "Don't leave food in vehicles."],
      safety: ["If a vehicle has rodent waste or nests, follow the CDC's vehicle checklist: air it out, inspect air intakes and filters before starting, and disinfect without vacuuming first."],
      sources: ["cdc-seal", "cdc-trap", "cdc-clean"],
    },
    bedroom: {
      id: "bedroom", title: "Bedroom",
      inspect: ["Closet floors and corners, edges of the room and under the bed or furniture.", "Floor air vents."],
      trapping: ["Use traps only where children and pets can't reach them."],
      keep: ["Remove food and snacks from the room.", "Wash potentially contaminated bedding, clothing and stuffed animals in hot water with detergent, then machine dry on high."],
      safety: ["Don't set traps where a child or pet could reach them, even inside an enclosure."],
      sources: ["cdc-seal", "cdc-clean"],
    },
    walls: {
      id: "walls", title: "Near or inside walls",
      inspect: ["Accessible edges on both sides of the wall.", "Pipe, wire and vent penetrations.", "Where the floor meets the wall."],
      trapping: ["Trap along the wall at the base. Mice prefer to run next to walls and objects."],
      keep: ["Don't cut into drywall because of sounds alone. Noise can't pinpoint a nest."],
      safety: ["Don't put loose poison into a wall void. UC IPM notes poisoned mice often die in the building, which can cause odor."],
      sources: ["cdc-trap", "ucipm"],
    },
    bathroom: {
      id: "bathroom", title: "Bathroom",
      inspect: ["Around pipes under sinks and behind the toilet.", "Floor drains and penetrations around the tub or shower."],
      trapping: ["Place traps flat on the floor along walls, away from water."],
      keep: ["Keep the space free of food and clutter."],
      safety: ["Disinfect hard surfaces per the label. Never mix cleaning chemicals."],
      sources: ["cdc-seal", "cdc-clean"],
    },
    living_room: {
      id: "living_room", title: "Living room",
      inspect: ["Along the walls and behind furniture.", "Around the fireplace.", "Floor air vents and edges of the room."],
      trapping: ["Traps go behind or beside furniture, against the wall."],
      keep: ["Clear food debris and pet treats."],
      safety: ["Clean carpets and upholstery after waste removal with a commercial disinfectant or steam cleaning, as the CDC suggests."],
      sources: ["cdc-seal", "cdc-clean"],
    },
    crawlspace: {
      id: "crawlspace", title: "Crawl space",
      inspect: ["Vents and utility penetrations from the outside.", "Pipes and ducts from a safe position."],
      trapping: ["The CDC lists crawl spaces among places without regular human traffic where traps belong."],
      keep: ["Keep the area dry and free of stored food."],
      safety: ["If access is tight, wet or contaminated, hire a professional.", "Contamination inside heating or cooling ducts needs a professional."],
      sources: ["cdc-seal", "cdc-trap", "cdc-clean"],
    },
    laundry: {
      id: "laundry", title: "Laundry room",
      inspect: ["Pipes leading to washing machines.", "Floor drains and dryer vents.", "Door seals."],
      trapping: ["Place traps along the walls behind machines only where you can reach safely."],
      keep: ["Keep dirty clothing off the floor and don't store pet food here."],
      safety: ["Never block dryer exhaust or fit a lint-catching screen to it.", "Launder suspect clothing in hot water with detergent."],
      sources: ["cdc-seal", "cdc-clean"],
    },
  },

  materials: [
    { id: "small", where: "Small holes and cracks (about 1/4 inch and up)", use: "Coarse steel wool packed tightly and held in with caulk or spray foam, or wire screen.", caution: "Steel wool can rust over time. Re-check it, and replace it if it's damaged.", avoid: "Plastic, rubber, vinyl, wood or foam on their own, which mice can chew through.", sources: ["cdc-seal", "ucipm"] },
    { id: "large", where: "Larger holes", use: "Lath screen, metal, cement, hardware cloth or metal sheeting, cut to fit around pipes.", caution: "Secure edges so nothing can be pulled free. Use mesh openings smaller than 1/4 inch.", avoid: "Cardboard, wood or other chewable fillers.", sources: ["cdc-seal"] },
    { id: "foundation", where: "Foundation cracks and utility openings", use: "Metal or concrete around pipes, vents and utility cables, and caulk where the foundation meets the ground.", caution: "Pipes and vents need working clearance. Don't seal anything that must stay open for ventilation or drainage.", avoid: "Expanding foam as the only barrier.", sources: ["ucipm", "cdc-seal"] },
    { id: "doors", where: "Doors, windows and screens", use: "Make them fit tightly and add weather stripping. Cover edges with metal if mice are gnawing them.", caution: "Check gaps under doors, where mice can squeeze under a 1/4-inch gap.", avoid: "Plastic screening or soft weather stripping alone where gnawing is happening.", sources: ["ucipm", "cdc-seal"] },
    { id: "trailer", where: "Manufactured-home skirting and the base of the house", use: "Repair skirting gaps and use flashing around the base.", caution: "Re-check after storms or ground settling.", avoid: "Leaving small gaps because they look too tight.", sources: ["cdc-seal"] },
    { id: "services", where: "Dryer vents, flues and fire-rated construction", use: "Ask a qualified tradesperson.", caution: "Never fit a lint-catching screen to dryer exhaust.", avoid: "Packing combustible material near heat sources or wiring.", sources: ["cdc-seal"] },
  ],

  supplies: [
    { id: "traps", name: "Mouse-size snap traps", essential: true, why: "The CDC recommends traditional snap traps and UC IPM calls them a great first step for most homes.", criteria: ["Sized for mice, not rats", "Wide trigger plate (UC IPM reports higher catch rates)", "Sets lightly and springs easily", "Easy to set, clean and reuse"], query: "mouse snap traps", sources: ["cdc-trap", "ucipm"] },
    { id: "gloves", name: "Rubber or plastic gloves", essential: true, why: "Required for safe cleanup and when handling traps or rodents.", criteria: ["Waterproof", "Long enough to protect wrists", "Disposable or easy to disinfect"], query: "rubber cleaning gloves", sources: ["cdc-clean"] },
    { id: "disinfectant", name: "Household disinfectant", essential: true, why: "Used to soak droppings, urine and nests before wiping up.", criteria: ["The label includes the word \"disinfectant\"", "Check the contact time on the label", "Never mix with other chemicals"], query: "household disinfectant spray", sources: ["cdc-clean"] },
    { id: "bags", name: "Strong plastic bags and paper towels", essential: true, why: "Bag waste twice and bin it in a covered can.", criteria: ["Thick enough not to tear", "Fit your trash can", "Paper towels for wiping up"], query: "heavy duty trash bags", sources: ["cdc-clean"] },
    { id: "steel", name: "Coarse steel wool", essential: true, why: "Packs small holes that mice can't chew through.", criteria: ["Coarse grade, not fine", "Plan to hold it in place with caulk or foam", "Re-check for rust"], query: "coarse steel wool", sources: ["cdc-seal", "ucipm"] },
    { id: "cloth", name: "Hardware cloth or metal flashing", essential: false, why: "Covers larger holes, vents and the base of a home.", criteria: ["Mesh openings smaller than 1/4 inch", "Cut with snips and fasten securely", "Keep vents open to airflow"], query: "hardware cloth 1/4 inch", sources: ["cdc-seal", "ucipm"] },
    { id: "caulk", name: "Exterior caulk or sealant", essential: false, why: "Holds steel wool in place and seals foundation-to-ground gaps.", criteria: ["Suited to the surface", "Weather resistant outdoors"], query: "exterior caulk", sources: ["cdc-seal"] },
    { id: "containers", name: "Airtight food containers", essential: true, why: "Mice chew through bags and cardboard.", criteria: ["Thick plastic, metal or glass", "Tight lid", "Large enough for bulk pet food and grains"], query: "airtight food storage containers", sources: ["cdc-seal"] },
    { id: "can", name: "Covered trash can", essential: false, why: "For disposing of waste and wipes safely.", criteria: ["Thick plastic or metal", "Tight lid"], query: "trash can with lid", sources: ["cdc-clean", "cdc-seal"] },
    { id: "light", name: "Flashlight or headlamp", essential: false, why: "Inspect dark corners, attics and crawl spaces.", criteria: ["Bright and focused", "Hands-free is handy"], query: "led headlamp", sources: ["ucipm"] },
    { id: "repellent", name: "Insect repellent for handling nests", essential: false, why: "The CDC suggests DEET or another EPA-registered repellent when handling dead rodents and nests because fleas are common.", criteria: ["EPA-registered", "Apply to clothing, shoes and hands as directed"], query: "deet insect repellent", sources: ["cdc-clean"] },
  ],

  seasons: [
    { id: "autumn", title: "Autumn", when: "Before nights turn cold", tasks: [
      { id: "s-aut-1", text: "Walk the perimeter and re-check every seal, vent and door sweep. UC IPM says mice often enter homes in autumn when nights get colder.", source: "ucipm" },
      { id: "s-aut-2", text: "Bring pet food and birdseed into tight containers and move woodpiles at least 100 feet from the house.", source: "cdc-seal" },
    ]},
    { id: "winter", title: "Winter", when: "While the heating is on", tasks: [
      { id: "s-win-1", text: "Check basements, garages and storage areas monthly for new droppings, gnawing and nests.", source: "ucipm" },
      { id: "s-win-2", text: "If you see signs, set traps along walls straight away and follow your plan's cleanup steps.", source: "cdc-trap" },
    ]},
    { id: "spring", title: "Spring", when: "After the thaw", tasks: [
      { id: "s-spr-1", text: "Inspect for damage after winter weather and repair foundation cracks, flashing and skirting.", source: "cdc-seal" },
      { id: "s-spr-2", text: "Clear brush and weeds near the house and keep grass and shrubs trimmed within 100 feet.", source: "cdc-seal" },
    ]},
    { id: "summer", title: "Summer", when: "During outdoor season", tasks: [
      { id: "s-sum-1", text: "Keep grills and outdoor cooking areas clean, use secure garbage cans and keep compost bins at least 100 feet away.", source: "cdc-seal" },
      { id: "s-sum-2", text: "Keep bird feeders away from the house and use squirrel guards.", source: "cdc-seal" },
    ]},
  ],

  trap: {
    maxSpacingFt: 10,
    pairGapIn: "1 to 2",
    rangeFt: 30,
    sources: ["ucipm", "cdc-trap"],
    baits: [
      { name: "Peanut butter", note: "Popular and attractive, but can be an allergy risk for some people. Use a small smear." },
      { name: "The food mice are already eating", note: "UC IPM says the best bait is often what they are already taking." },
      { name: "Cotton wool or dental floss", note: "Can attract mice that are looking for nest material." },
      { name: "Mutton fat", note: "The CDC lists chunky peanut butter or mutton fat as baits that work well." },
    ],
    rules: [
      "Place traps against a wall with the baited end next to it, forming a \"T\".",
      "Set the trigger lightly so it springs easily.",
      "Use only a small amount of bait.",
      "Space traps no more than about 10 feet apart where mice are active.",
      "Consider pairs of traps 1 to 2 inches apart.",
      "Check daily and dispose of catches immediately.",
    ],
    avoid: [
      "Glue traps and live traps. The CDC advises against them, and UC IPM notes drawbacks including suffering and avoidance by adult mice.",
      "Traps where children, pets or wildlife can reach them.",
      "Relocating live mice. UC IPM says it's ineffective and is illegal in some places such as California.",
    ],
  },

  escalation: {
    before: [
      "Your evidence log with dates, locations and trap checks.",
      "Photos of signs, damaged items and any gaps you found.",
      "A list of what you have tried, including any rodenticide, so the provider can avoid unsafe combinations.",
      "Who lives in or visits the property, including children, pets and anyone with health concerns.",
    ],
    ask: [
      "Will you inspect inside and outside the property and show me what you find?",
      "Does your service include sealing entry points, not only trapping or bait?",
      "Which products or devices will you use, where, and how will children and pets be kept away?",
      "What follow-up visits are included and what are the terms in writing?",
      "Are you licensed or certified where I live?",
    ],
    document: [
      "Keep the invoice, products used and visit notes.",
      "Ask for a written summary of repairs recommended and completed.",
    ],
  },
};
