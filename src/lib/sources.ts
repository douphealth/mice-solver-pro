/** Primary sources behind the guidance. Page text was reviewed on SOURCES_REVIEWED; linking is not endorsement. */
export type SourceId = "cdc-clean" | "cdc-trap" | "cdc-seal" | "ucipm" | "epa-bait" | "epa-options";

export interface Source {
  id: SourceId;
  org: string;
  label: string;
  url: string;
}

export const SOURCES_REVIEWED = "2 October 2026; EPA pages 25 November 2026";

export const SOURCES: Source[] = [
  { id: "cdc-clean", org: "CDC", label: "CDC: cleaning up after rodents", url: "https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html" },
  { id: "cdc-trap", org: "CDC", label: "CDC: trapping rodents", url: "https://www.cdc.gov/healthy-pets/rodent-control/trap-up.html" },
  { id: "cdc-seal", org: "CDC", label: "CDC: sealing entry gaps", url: "https://www.cdc.gov/healthy-pets/rodent-control/seal-up.html" },
  { id: "ucipm", org: "UC IPM", label: "UC IPM: house mouse management", url: "https://ipm.ucanr.edu/home-and-landscape/house-mouse/" },
  { id: "epa-bait", org: "EPA", label: "EPA: safely use rodent bait products", url: "https://www.epa.gov/rodenticides/safely-use-rodent-bait-products" },
  { id: "epa-options", org: "EPA", label: "EPA: options for dealing with rodents", url: "https://www.epa.gov/rodenticides/options-dealing-rodent-infestations" },
];

/** Emergency lines quoted in poison-safety steps. Checked on the organisations' own pages on 25 November 2026. */
export const POISON_HELP = { phone: "1-800-222-1222", url: "https://www.poison.org/", label: "Poison Help (US)" } as const;
export const PET_POISON_HELP = { phone: "(888) 426-4435", url: "https://www.aspca.org/pet-care/aspca-poison-control", label: "ASPCA Animal Poison Control Center" } as const;

export const SOURCE_BY_ID: Record<SourceId, Source> = Object.fromEntries(SOURCES.map(s => [s.id, s])) as Record<SourceId, Source>;

/** Short badge text used next to a recommendation. */
export const sourceBadge = (id: SourceId): string => SOURCE_BY_ID[id].org;

/** Companion articles on the main site. Live URLs were verified when this was written. */
export const GUIDES = [
  { label: "Mouse-control guide", url: "https://micegoneguide.com/how-to-get-rid-of-mice/" },
  { label: "Safe droppings cleanup", url: "https://micegoneguide.com/how-to-remove-mice-droppings-safely/" },
  { label: "Mouse-proofing guidance", url: "https://micegoneguide.com/mouse-proofing/" },
  { label: "Rats vs. mice: the differences", url: "https://micegoneguide.com/rats-vs-mice-whats-the-difference/" },
  { label: "Where to place mouse traps", url: "https://micegoneguide.com/where-to-place-mouse-traps/" },
  { label: "Humane mouse removal", url: "https://micegoneguide.com/safely-remove-mice/" },
];

export const SITE_ORIGIN = "https://elimination.micegoneguide.com";
export const CONTACT_EMAIL = "admin@micegoneguide.com";
