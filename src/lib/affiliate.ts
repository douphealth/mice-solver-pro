/** Amazon Associates tracking tag for micegoneguide.com. Links are plain search URLs, so no price, rating or availability is claimed. */
export const AMAZON_TAG = "papalex-20";
export const amazonSearchUrl = (query: string): string =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;
export const AFFILIATE_DISCLOSURE =
  "As an Amazon Associate, MiceGoneGuide earns from qualifying purchases. Links open an Amazon search, so you choose the exact product and see current prices there. Our recommendations don't change with the commission.";
