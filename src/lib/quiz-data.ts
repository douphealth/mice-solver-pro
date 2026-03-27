export interface QuizOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface QuizStep {
  id: string;
  category: string;
  question: string;
  subtitle?: string;
  type: "single" | "multi" | "select" | "zip";
  options?: QuizOption[];
}

export const quizSteps: QuizStep[] = [
  {
    id: "evidence",
    category: "Evidence",
    question: "What signs of mouse activity have you noticed?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { id: "droppings", label: "Droppings", icon: "💩", description: "Small dark pellets, rice-sized" },
      { id: "gnaw_marks", label: "Gnaw Marks", icon: "🦷", description: "Chewed wires, wood, or food packaging" },
      { id: "nesting", label: "Nesting Material", icon: "🪹", description: "Shredded paper, fabric, or insulation" },
      { id: "grease_marks", label: "Grease Marks", icon: "🔲", description: "Dark smudges along walls or baseboards" },
      { id: "sounds", label: "Scratching Sounds", icon: "👂", description: "Noises in walls, ceiling, or floor" },
      { id: "sighting", label: "Saw a Mouse", icon: "🐭", description: "Actually spotted a live or dead mouse" },
    ],
  },
  {
    id: "location",
    category: "Location",
    question: "Where in your home is the activity?",
    subtitle: "Select all affected areas",
    type: "multi",
    options: [
      { id: "kitchen", label: "Kitchen", icon: "🍳" },
      { id: "attic", label: "Attic", icon: "🏠" },
      { id: "basement", label: "Basement", icon: "🏗️" },
      { id: "garage", label: "Garage", icon: "🚗" },
      { id: "bedroom", label: "Bedroom", icon: "🛏️" },
      { id: "walls", label: "Inside Walls", icon: "🧱" },
      { id: "bathroom", label: "Bathroom", icon: "🚿" },
      { id: "living_room", label: "Living Room", icon: "🛋️" },
    ],
  },
  {
    id: "home_type",
    category: "Home Details",
    question: "What type of home do you live in?",
    type: "single",
    options: [
      { id: "detached", label: "Detached House", icon: "🏡" },
      { id: "townhouse", label: "Townhouse / Row Home", icon: "🏘️" },
      { id: "apartment", label: "Apartment / Condo", icon: "🏢" },
      { id: "mobile", label: "Mobile / Manufactured", icon: "🏠" },
      { id: "cabin", label: "Cabin / Rural Home", icon: "🌲" },
    ],
  },
  {
    id: "surroundings",
    category: "Surroundings",
    question: "What best describes your area?",
    type: "single",
    options: [
      { id: "urban", label: "Urban / City", icon: "🏙️" },
      { id: "suburban", label: "Suburban", icon: "🏘️" },
      { id: "rural", label: "Rural / Country", icon: "🌾" },
    ],
  },
  {
    id: "timeline",
    category: "Timeline",
    question: "When did you first notice signs?",
    type: "single",
    options: [
      { id: "days", label: "Last few days", icon: "📅" },
      { id: "weeks", label: "1–3 weeks ago", icon: "📆" },
      { id: "month", label: "About a month", icon: "🗓️" },
      { id: "months", label: "Several months", icon: "⏰" },
      { id: "ongoing", label: "Ongoing / recurring", icon: "🔄" },
    ],
  },
  {
    id: "previous",
    category: "Previous Attempts",
    question: "What have you already tried?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { id: "nothing", label: "Nothing yet", icon: "🤷" },
      { id: "snap_traps", label: "Snap Traps", icon: "🪤" },
      { id: "glue_traps", label: "Glue Traps", icon: "📋" },
      { id: "poison", label: "Poison / Bait", icon: "☠️" },
      { id: "ultrasonic", label: "Ultrasonic Devices", icon: "📡" },
      { id: "professional", label: "Called a Pro", icon: "📞" },
    ],
  },
  {
    id: "household",
    category: "Household",
    question: "Any special considerations?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { id: "kids", label: "Young Children", icon: "👶" },
      { id: "pets_dog", label: "Dogs", icon: "🐕" },
      { id: "pets_cat", label: "Cats", icon: "🐈" },
      { id: "allergies", label: "Allergies / Sensitivities", icon: "🤧" },
      { id: "none", label: "No special concerns", icon: "✅" },
    ],
  },
  {
    id: "zip",
    category: "Location",
    question: "What's your ZIP code?",
    subtitle: "Helps us provide seasonal and regional insights",
    type: "zip",
  },
];

export type QuizAnswers = Record<string, string | string[]>;
