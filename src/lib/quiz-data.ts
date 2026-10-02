export interface QuizOption {
  id: string;
  label: string;
  /** Name of a lucide icon; resolved in components/quiz/option-icons.tsx. */
  icon: string;
  description?: string;
  /** Hazard options show an inline safety note as soon as they are chosen. */
  hazard?: boolean;
}
export interface QuizStep {
  id: string;
  category: string;
  question: string;
  subtitle?: string;
  type: "single" | "multi";
  options: QuizOption[];
}
export type QuizAnswers = Record<string, string | string[]>;

export const quizSteps: QuizStep[] = [
  {
    id: "evidence", category: "Observations", type: "multi",
    question: "What have you actually observed?",
    subtitle: "Choose only what you have seen or found. Selecting more does not mean a bigger problem.",
    options: [
      { id: "droppings", label: "Possible droppings", icon: "Grip", description: "Small dark pellets. Don't touch or sweep them." },
      { id: "gnaw_marks", label: "Chewing damage", icon: "Scissors", description: "Fresh gnaw marks on packaging, wood or cords." },
      { id: "nesting", label: "Possible nesting material", icon: "Layers", description: "Shredded paper or fabric in a sheltered spot." },
      { id: "sighting", label: "A rodent sighting", icon: "Eye", description: "Seen alive or dead, day or night." },
      { id: "tracks", label: "Possible tracks", icon: "Footprints", description: "Footprints or tail marks in dust." },
      { id: "sounds", label: "Scratching or other noises", icon: "Volume2", description: "Noise alone can't confirm a cause." },
      { id: "urine_smell", label: "An unexplained odor", icon: "Wind", description: "A stale, musky smell with no clear source." },
      { id: "grease_marks", label: "Smudges along edges", icon: "Paintbrush", description: "Dark rub marks where something travels." },
      { id: "damaged_wiring", label: "Damaged wiring", icon: "Zap", hazard: true, description: "Keep away and arrange qualified electrical help." },
      { id: "ventilation", label: "Waste in heating or cooling ducts", icon: "Fan", hazard: true, description: "Needs professional assessment." },
      { id: "heavy_contamination", label: "Extensive or hard-to-reach waste", icon: "AlertTriangle", hazard: true, description: "Don't disturb it dry." },
      { id: "none", label: "No signs confirmed yet", icon: "HelpCircle", description: "A good place to start with inspection." },
    ],
  },
  {
    id: "location", category: "Where", type: "multi",
    question: "Where did you notice the signs?",
    subtitle: "These choices decide which areas your inspection prompts cover. They don't identify a species or a nest.",
    options: [
      { id: "kitchen", label: "Kitchen", icon: "CookingPot" },
      { id: "attic", label: "Attic", icon: "Home" },
      { id: "basement", label: "Basement", icon: "ArrowDownToLine" },
      { id: "garage", label: "Garage", icon: "Car" },
      { id: "bedroom", label: "Bedroom", icon: "BedDouble" },
      { id: "walls", label: "Near or inside walls", icon: "BrickWall" },
      { id: "bathroom", label: "Bathroom", icon: "Bath" },
      { id: "living_room", label: "Living room", icon: "Sofa" },
      { id: "crawlspace", label: "Crawl space", icon: "Rows3" },
      { id: "laundry", label: "Laundry room", icon: "WashingMachine" },
      { id: "none", label: "Not sure yet", icon: "HelpCircle" },
    ],
  },
  {
    id: "home_type", category: "Property", type: "single",
    question: "What type of property is this?",
    subtitle: "Shared walls and outbuildings change who needs to be involved and where to look.",
    options: [
      { id: "detached", label: "Detached house", icon: "Home" },
      { id: "townhouse", label: "Townhouse or shared walls", icon: "Building" },
      { id: "apartment", label: "Apartment or condo", icon: "Building2" },
      { id: "mobile", label: "Manufactured home", icon: "Truck" },
      { id: "cabin", label: "Cabin or outbuilding", icon: "Tent" },
    ],
  },
  {
    id: "household", category: "Safety", type: "multi",
    question: "Who might reach a trap or bait?",
    subtitle: "Think about visitors too. No trap is automatically child- or pet-safe.",
    options: [
      { id: "kids", label: "Children", icon: "Baby" },
      { id: "pets_dog", label: "Dogs", icon: "Dog" },
      { id: "pets_cat", label: "Cats or other pets", icon: "Cat" },
      { id: "none", label: "None of these", icon: "UserCheck" },
    ],
  },
  {
    id: "previous", category: "History", type: "multi",
    question: "What have you already tried?",
    subtitle: "This tailors what to keep, change or stop.",
    options: [
      { id: "snap_traps", label: "Snap traps", icon: "Target" },
      { id: "glue_traps", label: "Glue traps", icon: "Layers" },
      { id: "poison", label: "Rodenticide or bait stations", icon: "Skull" },
      { id: "ultrasonic", label: "Ultrasonic devices", icon: "Radio" },
      { id: "peppermint", label: "Scents or essential oils", icon: "Sprout" },
      { id: "sealing", label: "Entry-gap repairs", icon: "Wrench" },
      { id: "professional", label: "A professional service", icon: "BadgeCheck" },
      { id: "nothing", label: "Nothing yet", icon: "CircleDashed" },
    ],
  },
  {
    id: "food_storage", category: "Food access", type: "single",
    question: "How is accessible food stored?",
    subtitle: "Include pet food, pantry items and anything kept in a garage or basement.",
    options: [
      { id: "sealed", label: "Thick containers with tight lids", icon: "PackageCheck", description: "Plastic, metal or glass." },
      { id: "mixed", label: "A mix, including bags or cardboard", icon: "Package", description: "Some items are easy to chew into." },
      { id: "open", label: "Open food or pet bowls", icon: "UtensilsCrossed", description: "Left out overnight or unsealed." },
    ],
  },
  {
    id: "duration", category: "Timeline", type: "single",
    question: "How long have you noticed signs?",
    subtitle: "This only adjusts the review steps. It does not estimate how many mice are present.",
    options: [
      { id: "new", label: "Just noticed", icon: "Sparkles", description: "Within the last few days." },
      { id: "weeks", label: "A few weeks", icon: "CalendarDays" },
      { id: "months", label: "More than a month", icon: "CalendarRange" },
      { id: "returning", label: "It came back", icon: "RotateCcw", description: "After an earlier round of control." },
    ],
  },
];

export const QUIZ_ANSWER_KEYS = quizSteps.map(s => s.id);
