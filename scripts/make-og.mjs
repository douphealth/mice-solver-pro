// Renders public/og-image.png (1200x630) from an HTML template. Usage: node scripts/make-og.mjs <path-to-512px-logo.png>
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const logo = readFileSync(process.argv[2]).toString("base64");
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;font-family:'DM Sans',sans-serif;color:#f7f2e4;background:
    radial-gradient(900px 420px at 88% -8%, rgba(232,169,53,.22), transparent 60%),
    radial-gradient(700px 420px at -6% 112%, rgba(60,160,110,.28), transparent 60%),
    linear-gradient(150deg,#14452e 0%,#0f3323 55%,#0a2619 100%);position:relative;overflow:hidden}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px}
  .wrap{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
  .brand{display:flex;align-items:center;gap:18px;font-family:'Fraunces',serif;font-weight:800;font-size:34px}
  .brand img{width:64px;height:64px;border-radius:50%}
  .brand span b{color:#e8a935}
  h1{font-family:'Fraunces',serif;font-weight:800;font-size:76px;line-height:1.05;max-width:900px;letter-spacing:-.01em}
  .kicker{font-weight:700;letter-spacing:.16em;text-transform:uppercase;font-size:20px;color:#e8a935;margin-bottom:22px}
  .row{display:flex;gap:16px;align-items:center}
  .pill{border:2px solid rgba(247,242,228,.35);border-radius:999px;padding:12px 22px;font-size:24px;font-weight:700}
  .cta{background:linear-gradient(135deg,#f6c453,#ef8f1e);color:#1d1a0d;border-radius:14px;padding:14px 28px;font-size:26px;font-weight:700}
  .house{position:absolute;right:56px;bottom:84px;width:330px;opacity:.95}
</style></head><body><div class="grid"></div>
<svg class="house" viewBox="0 0 460 380"><ellipse cx="230" cy="342" rx="200" ry="16" fill="rgba(0,0,0,.35)"/><rect x="70" y="170" width="320" height="168" rx="6" fill="#f3efe0" stroke="#10281c" stroke-width="3"/><path d="M40 176 L230 52 L420 176 Z" fill="#1f5a3c" stroke="#0b1f15" stroke-width="3" stroke-linejoin="round"/><rect x="96" y="204" width="86" height="70" rx="5" fill="#9fb3a7" stroke="#10281c" stroke-width="2.5"/><rect x="260" y="226" width="64" height="112" rx="5" fill="#c9852b" stroke="#10281c" stroke-width="2.5"/><circle cx="230" cy="98" r="11" fill="#f6c453"/><circle cx="139" cy="239" r="11" fill="#f6c453"/><circle cx="292" cy="262" r="11" fill="#f6c453"/><circle cx="363" cy="322" r="11" fill="#f6c453"/></svg>
<div class="wrap"><div class="brand"><img src="data:image/png;base64,${logo}"><span>MiceGone<b>Guide</b></span></div>
<div><div class="kicker">Mouse Control Planner · Free</div><h1>A clear, source-backed plan for your mouse problem</h1></div>
<div class="row"><div class="cta">Build my free plan</div><div class="pill">CDC &amp; UC IPM guidance</div><div class="pill">No signup</div></div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "public/og-image.png" });
await browser.close();
console.log("wrote public/og-image.png");
