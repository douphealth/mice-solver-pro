/** Primary sources behind the guidance. Page text was reviewed on SOURCES_REVIEWED; linking is not endorsement. */
export type SourceId = "cdc-clean" | "cdc-trap" | "cdc-seal" | "ucipm";

export interface Source {
  id: SourceId;
  org: string;
  label: string;
  url: string;
}

export const SOURCES_REVIEWED = "2 October 2026";

export const SOURCES: Source[] = [
  { id: "cdc-clean", org: "CDC", label: "CDC: cleaning up after rodents", url: "https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html" },
  { id: "cdc-trap", org: "CDC", label: "CDC: trapping rodents", url: "https://www.cdc.gov/healthy-pets/rodent-control/trap-up.html" },
  { id: "cdc-seal", org: "CDC", label: "CDC: sealing entry gaps", url: "https://www.cdc.gov/healthy-pets/rodent-control/seal-up.html" },
  { id: "ucipm", org: "UC IPM", label: "UC IPM: house mouse management", url: "https://ipm.ucanr.edu/home-and-landscape/house-mouse/" },
];

export const SOURCE_BY_ID: Record<SourceId, Source> = Object.fromEntries(SOURCES.map(s => [s.id, s])) as Record<SourceId, Source>;

/** Short badge text used next to a recommendation. */
export const sourceBadge = (id: SourceId): string => SOURCE_BY_ID[id].org;

/** Companion articles on the main site. Live URLs were verified when this was written. */
export const GUIDES = [
  { label: "Mouse-control guide", url: "https://micegoneguide.com/how-to-get-rid-of-mice/" },
  { label: "Safe droppings cleanup", url: "https://micegoneguide.com/how-to-remove-mice-droppings-safely/" },
  { label: "Mouse-proofing guidance", url: "https://micegoneguide.com/mouse-proofing/" },
  { label: "Rats vs. mice: the differences", url: "https://micegoneguide.com/rats-vs-mice-whats-the-difference/" },
];

export const SITE_ORIGIN = "https://elimination.micegoneguide.com";
export const CONTACT_EMAIL = "admin@micegoneguide.com";
