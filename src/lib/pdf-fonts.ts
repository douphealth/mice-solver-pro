import type { jsPDF } from "jspdf";

/**
 * Display typography for the PDF blueprint.
 *
 * Loads Playfair Display (OFL) at generation time and registers it with
 * jsPDF. PD.family starts as "helvetica" and flips to "Playfair" once the
 * fonts are embedded — every display call site reads PD.family, so the
 * whole document upgrades the moment fonts are ready and degrades
 * gracefully (plain Helvetica) if the fetch fails, e.g. in tests.
 *
 * The fetched font bytes are cached in module scope, but registration
 * (addFileToVFS/addFont) happens per-document: a fresh jsPDF instance
 * never inherits fonts from a previous one.
 */
export const PD = { family: "helvetica" };

interface CachedFont {
  file: string;
  family: string;
  style: string;
  b64: string;
}

let cachedFonts: CachedFont[] | null = null;
let fetchPromise: Promise<CachedFont[]> | null = null;

const FONT_FILES = [
  {
    file: "PlayfairDisplay-Bold.ttf",
    family: "Playfair",
    style: "bold",
    // Same-origin first (if self-hosted under public/fonts), pinned CDN fallback.
    urls: [
      "/fonts/PlayfairDisplay-Bold.ttf",
      "https://cdn.jsdelivr.net/npm/@expo-google-fonts/playfair-display@0.2.3/PlayfairDisplay_700Bold.ttf",
    ],
  },
  {
    file: "PlayfairDisplay-Italic.ttf",
    family: "Playfair",
    style: "italic",
    urls: [
      "/fonts/PlayfairDisplay-Italic.ttf",
      "https://cdn.jsdelivr.net/npm/@expo-google-fonts/playfair-display@0.2.3/PlayfairDisplay_500Medium_Italic.ttf",
    ],
  },
];

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(bin);
}

/** Fetch with a hard timeout — never let font loading stall PDF generation. */
async function fetchWithTimeout(url: string, ms = 4000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchFonts(): Promise<CachedFont[]> {
  return Promise.all(
    FONT_FILES.map(async (f) => {
      let lastErr: unknown = null;
      for (const url of f.urls) {
        try {
          const r = await fetchWithTimeout(url);
          if (!r.ok) throw new Error(`font fetch failed: ${url}`);
          return {
            file: f.file,
            family: f.family,
            style: f.style,
            b64: arrayBufferToBase64(await r.arrayBuffer()),
          };
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr instanceof Error ? lastErr : new Error(`font fetch failed: ${f.file}`);
    })
  );
}

function registerFonts(doc: jsPDF, fonts: CachedFont[]): void {
  for (const f of fonts) {
    doc.addFileToVFS(f.file, f.b64);
    doc.addFont(f.file, f.family, f.style);
  }
  PD.family = "Playfair";
}

/** Ensure display fonts are embedded in this doc; resolves false on failure. */
export async function ensurePDFFonts(doc: jsPDF): Promise<boolean> {
  try {
    if (!cachedFonts) {
      if (!fetchPromise) fetchPromise = fetchFonts();
      cachedFonts = await fetchPromise;
    }
    registerFonts(doc, cachedFonts);
    return true;
  } catch {
    fetchPromise = null;
    return false;
  }
}
