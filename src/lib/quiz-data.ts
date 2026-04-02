export interface QuizOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
  image?: string; // for image-based questions
}

export interface QuizStep {
  id: string;
  category: string;
  question: string;
  subtitle?: string;
  type: "single" | "multi" | "select" | "zip";
  options?: QuizOption[];
  showIf?: (answers: QuizAnswers) => boolean; // branching logic
}

export const quizSteps: QuizStep[] = [
  // 1. Evidence
  {
    id: "evidence",
    category: "Evidence",
    question: "What signs of mouse activity have you noticed?",
    subtitle: "Select all that apply — the more you select, the better your report",
    type: "multi",
    options: [
      { id: "droppings", label: "Droppings", icon: "💩", description: "Small dark pellets, rice-sized" },
      { id: "gnaw_marks", label: "Gnaw Marks", icon: "🦷", description: "Chewed wires, wood, or food packaging" },
      { id: "nesting", label: "Nesting Material", icon: "🪹", description: "Shredded paper, fabric, or insulation" },
      { id: "grease_marks", label: "Grease Marks", icon: "🔲", description: "Dark smudges along walls or baseboards" },
      { id: "sounds", label: "Scratching Sounds", icon: "👂", description: "Noises in walls, ceiling, or floor" },
      { id: "sighting", label: "Saw a Mouse", icon: "🐭", description: "Actually spotted a live or dead mouse" },
      { id: "urine_smell", label: "Musky Odor", icon: "👃", description: "Strong ammonia-like smell in enclosed areas" },
      { id: "tracks", label: "Footprints / Tracks", icon: "🐾", description: "Tiny tracks in dust or along surfaces" },
    ],
  },
  // 2. Droppings detail (branching)
  {
    id: "droppings_detail",
    category: "Evidence Details",
    question: "How would you describe the droppings?",
    subtitle: "This helps us identify the species",
    type: "single",
    showIf: (a) => ((a.evidence as string[]) || []).includes("droppings"),
    options: [
      { id: "small_dark", label: "Small & Dark (rice-sized)", icon: "🔹", description: "3-6mm, pointed ends — typical house mouse" },
      { id: "large_blunt", label: "Larger & Blunt (bean-sized)", icon: "🔸", description: "12-18mm, rounded ends — likely a rat" },
      { id: "scattered", label: "Scattered Everywhere", icon: "📍", description: "Found in many rooms, not just one spot" },
      { id: "concentrated", label: "Concentrated in One Spot", icon: "📌", description: "Piled up in one area — near a nest" },
    ],
  },
  // 3. Sighting detail (branching)
  {
    id: "sighting_detail",
    category: "Evidence Details",
    question: "Tell us about the mouse sighting",
    subtitle: "This helps determine severity and species",
    type: "single",
    showIf: (a) => ((a.evidence as string[]) || []).includes("sighting"),
    options: [
      { id: "one_night", label: "One mouse, at night", icon: "🌙", description: "Typical — mice are nocturnal" },
      { id: "one_day", label: "One mouse, during the day", icon: "☀️", description: "Daytime sightings suggest overcrowding" },
      { id: "multiple", label: "Multiple mice", icon: "🐭🐭", description: "Seeing 2+ means a larger colony" },
      { id: "dead", label: "Found a dead mouse", icon: "💀", description: "Could indicate poison use or natural death" },
    ],
  },
  // 4. Location
  {
    id: "location",
    category: "Location",
    question: "Where in your home is the activity?",
    subtitle: "Select all affected areas",
    type: "multi",
    options: [
      { id: "kitchen", label: "Kitchen", icon: "🍳", description: "Near food sources — most common" },
      { id: "attic", label: "Attic", icon: "🏠", description: "Upper levels and roof spaces" },
      { id: "basement", label: "Basement", icon: "🏗️", description: "Below-grade areas" },
      { id: "garage", label: "Garage", icon: "🚗", description: "Attached or detached garage" },
      { id: "bedroom", label: "Bedroom", icon: "🛏️", description: "Sleeping areas" },
      { id: "walls", label: "Inside Walls", icon: "🧱", description: "Sounds or evidence within walls" },
      { id: "bathroom", label: "Bathroom", icon: "🚿", description: "Around pipes and drains" },
      { id: "living_room", label: "Living Room", icon: "🛋️", description: "Common areas" },
      { id: "crawlspace", label: "Crawl Space", icon: "🕳️", description: "Under the house" },
      { id: "laundry", label: "Laundry Room", icon: "👕", description: "Near washer/dryer" },
    ],
  },
  // 5. Home type
  {
    id: "home_type",
    category: "Home Details",
    question: "What type of home do you live in?",
    type: "single",
    options: [
      { id: "detached", label: "Detached House", icon: "🏡", description: "Single-family home" },
      { id: "townhouse", label: "Townhouse / Row Home", icon: "🏘️", description: "Shared walls with neighbors" },
      { id: "apartment", label: "Apartment / Condo", icon: "🏢", description: "Multi-unit building" },
      { id: "mobile", label: "Mobile / Manufactured", icon: "🏠", description: "Mobile or modular home" },
      { id: "cabin", label: "Cabin / Rural Home", icon: "🌲", description: "Remote or seasonal home" },
    ],
  },
  // 6. Home age
  {
    id: "home_age",
    category: "Home Details",
    question: "How old is your home?",
    subtitle: "Older homes have more potential entry points",
    type: "single",
    options: [
      { id: "new", label: "0-10 years", icon: "🆕", description: "Recently built" },
      { id: "mid", label: "10-30 years", icon: "🏠", description: "Some wear expected" },
      { id: "old", label: "30-50 years", icon: "🏚️", description: "Likely gaps and settling" },
      { id: "very_old", label: "50+ years", icon: "🏛️", description: "Many potential entry points" },
    ],
  },
  // 7. Surroundings
  {
    id: "surroundings",
    category: "Environment",
    question: "What best describes your area?",
    type: "single",
    options: [
      { id: "urban", label: "Urban / City", icon: "🏙️", description: "Dense housing, restaurants nearby" },
      { id: "suburban", label: "Suburban", icon: "🏘️", description: "Residential neighborhood" },
      { id: "rural", label: "Rural / Country", icon: "🌾", description: "Farmland, fields, woods nearby" },
    ],
  },
  // 8. Nearby attractants
  {
    id: "attractants",
    category: "Environment",
    question: "Any nearby mouse attractants?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { id: "bird_feeder", label: "Bird Feeders", icon: "🐦", description: "Spilled seed attracts mice" },
      { id: "compost", label: "Compost Bin", icon: "♻️", description: "Food scraps near the house" },
      { id: "pet_food_outside", label: "Outdoor Pet Food", icon: "🐕", description: "Pet food bowls left outside" },
      { id: "woodpile", label: "Firewood Stack", icon: "🪵", description: "Near the house — nesting habitat" },
      { id: "construction", label: "Nearby Construction", icon: "🏗️", description: "Displaces rodents into homes" },
      { id: "none_attractants", label: "None of These", icon: "✅" },
    ],
  },
  // 9. Timeline
  {
    id: "timeline",
    category: "Timeline",
    question: "When did you first notice signs?",
    type: "single",
    options: [
      { id: "days", label: "Last few days", icon: "📅", description: "Very recent" },
      { id: "weeks", label: "1–3 weeks ago", icon: "📆", description: "Developing situation" },
      { id: "month", label: "About a month", icon: "🗓️", description: "Established activity" },
      { id: "months", label: "Several months", icon: "⏰", description: "Long-term problem" },
      { id: "ongoing", label: "Ongoing / recurring", icon: "🔄", description: "Keeps coming back" },
    ],
  },
  // 10. Season
  {
    id: "season",
    category: "Timeline",
    question: "What season are you experiencing this?",
    subtitle: "Mouse behavior changes with seasons",
    type: "single",
    options: [
      { id: "fall", label: "Fall", icon: "🍂", description: "Peak invasion season" },
      { id: "winter", label: "Winter", icon: "❄️", description: "Mice seek warmth indoors" },
      { id: "spring", label: "Spring", icon: "🌸", description: "Breeding season begins" },
      { id: "summer", label: "Summer", icon: "☀️", description: "Active outdoors but may nest inside" },
    ],
  },
  // 11. Previous attempts
  {
    id: "previous",
    category: "Previous Attempts",
    question: "What have you already tried?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { id: "nothing", label: "Nothing yet", icon: "🤷", description: "Haven't started" },
      { id: "snap_traps", label: "Snap Traps", icon: "🪤", description: "Traditional spring-loaded" },
      { id: "glue_traps", label: "Glue Traps", icon: "📋", description: "Adhesive boards" },
      { id: "poison", label: "Poison / Bait Stations", icon: "☠️", description: "Rodenticide products" },
      { id: "ultrasonic", label: "Ultrasonic Devices", icon: "📡", description: "Electronic repellers" },
      { id: "peppermint", label: "Peppermint Oil / Natural", icon: "🌿", description: "Natural deterrents" },
      { id: "sealing", label: "Sealed Entry Points", icon: "🔧", description: "Caulk, steel wool, etc." },
      { id: "professional", label: "Called a Pro", icon: "📞", description: "Professional service" },
    ],
  },
  // 12. Previous attempt results (branching)
  {
    id: "previous_results",
    category: "Previous Attempts",
    question: "How did your previous attempts work?",
    showIf: (a) => {
      const prev = (a.previous as string[]) || [];
      return prev.length > 0 && !prev.includes("nothing");
    },
    type: "single",
    options: [
      { id: "no_effect", label: "No effect at all", icon: "❌", description: "Problem unchanged" },
      { id: "temporary", label: "Worked temporarily", icon: "⏳", description: "Came back after a while" },
      { id: "some_improvement", label: "Some improvement", icon: "📉", description: "Reduced but not gone" },
      { id: "caught_some", label: "Caught some mice", icon: "🪤", description: "But still seeing activity" },
    ],
  },
  // 13. Household
  {
    id: "household",
    category: "Household",
    question: "Any special considerations?",
    subtitle: "This affects which solutions we recommend",
    type: "multi",
    options: [
      { id: "kids", label: "Young Children", icon: "👶", description: "Under 6 years old" },
      { id: "pets_dog", label: "Dogs", icon: "🐕", description: "May access traps/bait" },
      { id: "pets_cat", label: "Cats", icon: "🐈", description: "May interact with mice" },
      { id: "allergies", label: "Allergies / Asthma", icon: "🤧", description: "Sensitive to allergens" },
      { id: "pregnant", label: "Pregnant Person", icon: "🤰", description: "Extra health precautions" },
      { id: "elderly", label: "Elderly Resident", icon: "👴", description: "Mobility considerations" },
      { id: "none", label: "No special concerns", icon: "✅" },
    ],
  },
  // 14. Food storage
  {
    id: "food_storage",
    category: "Household",
    question: "How do you currently store food?",
    subtitle: "This affects contamination risk and recommendations",
    type: "single",
    options: [
      { id: "open", label: "Open packages on shelves", icon: "📦", description: "Cereal boxes, chip bags, etc." },
      { id: "mixed", label: "Mix of sealed and open", icon: "🫙", description: "Some containers, some bags" },
      { id: "sealed", label: "Everything in sealed containers", icon: "🔒", description: "Airtight glass or plastic" },
      { id: "unsure", label: "Not sure / haven't checked", icon: "🤔" },
    ],
  },
  // 15. Budget
  {
    id: "budget",
    category: "Preferences",
    question: "What's your budget for solving this?",
    type: "single",
    options: [
      { id: "minimal", label: "As cheap as possible", icon: "💵", description: "Under $25" },
      { id: "moderate", label: "Moderate ($25-$75)", icon: "💰", description: "Willing to invest in quality" },
      { id: "whatever", label: "Whatever it takes", icon: "💎", description: "Just solve the problem" },
    ],
  },
  // 16. ZIP code
  {
    id: "zip",
    category: "Location",
    question: "What's your ZIP code?",
    subtitle: "Helps us provide seasonal and regional insights",
    type: "zip",
  },
];

export type QuizAnswers = Record<string, string | string[]>;
