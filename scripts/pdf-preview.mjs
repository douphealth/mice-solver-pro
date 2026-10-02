// Renders selected PDF pages to PNG via pdf.js in headless Chromium (no poppler needed).
// Usage: node scripts/pdf-preview.mjs <file.pdf> <outPrefix> <pageNumbers comma separated>
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const [file, prefix, pagesArg = "1"] = process.argv.slice(2);
const pages = pagesArg.split(",").map(Number);
const b64 = readFileSync(file).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
await page.goto("about:blank");
await page.addScriptTag({ url: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js" });
const info = await page.evaluate(async ({ b64 }) => {
  // eslint-disable-next-line no-undef
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  const data = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  // eslint-disable-next-line no-undef
  window.__pdf = await pdfjsLib.getDocument({ data }).promise;
  return window.__pdf.numPages;
}, { b64 });
console.log("pages:", info);
for (const n of pages) {
  if (n > info) continue;
  const dataUrl = await page.evaluate(async n => {
    const p = await window.__pdf.getPage(n);
    const viewport = p.getViewport({ scale: 1.25 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width; canvas.height = viewport.height;
    await p.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    return canvas.toDataURL("image/png");
  }, n);
  const { writeFileSync } = await import("node:fs");
  writeFileSync(`${prefix}-p${n}.png`, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log("wrote", `${prefix}-p${n}.png`);
}
await browser.close();
