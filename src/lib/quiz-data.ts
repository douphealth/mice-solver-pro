export interface QuizOption { id: string; label: string; icon: string; description?: string; }
export interface QuizStep { id: string; category: string; question: string; subtitle?: string; type: "single" | "multi"; options: QuizOption[]; }
export type QuizAnswers = Record<string, string | string[]>;
export const quizSteps: QuizStep[] = [
  { id: "evidence", category: "Observations", question: "What have you actually observed?", subtitle: "Select only what you observed. More selections do not mean a larger infestation.", type: "multi", options: [
    { id: "droppings", label: "Possible droppings", icon: "", description: "Do not touch or test their texture." },
    { id: "gnaw_marks", label: "Chewing damage", icon: "" },
    { id: "nesting", label: "Possible nesting material", icon: "" },
    { id: "sighting", label: "A rodent sighting", icon: "" },
    { id: "tracks", label: "Possible tracks", icon: "" },
    { id: "sounds", label: "Noises only or with other signs", icon: "" },
    { id: "urine_smell", label: "An unexplained odor", icon: "" },
    { id: "grease_marks", label: "Smudges along edges", icon: "" },
    { id: "damaged_wiring", label: "Damaged wiring", icon: "", description: "Keep away; arrange qualified electrical help." },
    { id: "ventilation", label: "Waste in heating/cooling ducts", icon: "", description: "Needs professional assessment." },
    { id: "heavy_contamination", label: "Extensive or inaccessible waste", icon: "" },
    { id: "none", label: "No signs confirmed", icon: "" },
  ] },
  { id: "location", category: "Inspection areas", question: "Where did you notice the signs?", subtitle: "These answers organize inspection areas; they do not identify a species or cavity.", type: "multi", options: [
    { id: "kitchen", label: "Kitchen", icon: "" }, { id: "attic", label: "Attic", icon: "" }, { id: "basement", label: "Basement", icon: "" }, { id: "garage", label: "Garage", icon: "" }, { id: "bedroom", label: "Bedroom", icon: "" }, { id: "walls", label: "Near or inside walls", icon: "" }, { id: "bathroom", label: "Bathroom", icon: "" }, { id: "living_room", label: "Living room", icon: "" }, { id: "crawlspace", label: "Crawl space", icon: "" }, { id: "laundry", label: "Laundry", icon: "" }, { id: "none", label: "Not sure", icon: "" },
  ] },
  { id: "home_type", category: "Property", question: "What type of property is this?", type: "single", options: [
    { id: "detached", label: "Detached house", icon: "" }, { id: "townhouse", label: "Townhouse / shared walls", icon: "" }, { id: "apartment", label: "Apartment / condo", icon: "" }, { id: "mobile", label: "Manufactured home", icon: "" }, { id: "cabin", label: "Cabin / outbuilding", icon: "" },
  ] },
  { id: "household", category: "Access precautions", question: "Who might reach a trap?", subtitle: "Consider visitors too. No trap is automatically child- or pet-safe.", type: "multi", options: [
    { id: "kids", label: "Children", icon: "" }, { id: "pets_dog", label: "Dogs", icon: "" }, { id: "pets_cat", label: "Cats or other pets", icon: "" }, { id: "none", label: "None of these", icon: "" },
  ] },
  { id: "previous", category: "Previous steps", question: "What have you already tried?", type: "multi", options: [
    { id: "snap_traps", label: "Snap traps", icon: "" }, { id: "glue_traps", label: "Glue traps", icon: "" }, { id: "poison", label: "Rodenticide / bait stations", icon: "" }, { id: "ultrasonic", label: "Ultrasonic devices", icon: "" }, { id: "peppermint", label: "Scents or essential oils", icon: "" }, { id: "sealing", label: "Entry-gap repairs", icon: "" }, { id: "professional", label: "Professional service", icon: "" }, { id: "nothing", label: "Nothing yet", icon: "" },
  ] },
  { id: "food_storage", category: "Food access", question: "How is accessible food stored?", type: "single", options: [
    { id: "sealed", label: "Robust containers with tight lids", icon: "" }, { id: "mixed", label: "Some bags or cardboard packages", icon: "" }, { id: "open", label: "Open food or pet bowls", icon: "" },
  ] },
];
