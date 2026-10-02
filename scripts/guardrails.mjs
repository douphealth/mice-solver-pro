// Content and hygiene guardrails. Run in CI and before every deploy.
// 1) No fabricated claims, scores or guarantees may appear in anything users read.
// 2) No secrets may be committed.
// 3) Private pages stay out of the sitemap and the sitemap lists the public tools.
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = dir => readdirSync(dir).flatMap(n => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const userFacing = [...walk("src"), ...walk("worker"), "index.html"].filter(f => /\.(tsx?|html)$/.test(f) && !/\.test\./.test(f));

// Fabricated or unverifiable claims the planner must never make.
const FORBIDDEN = /12,847|12,000\+|\b94%|4\.9\/5|expert-reviewed|fact-checked|professional-grade|expert-grade|AI-powered|same assessment criteria|could grow to|guaranteed (?:results?|removal|clearance|elimination)|eliminate mice permanently|100% (?:effective|guarantee)|money-back|as seen on|\bfake testimonial/i;
for (const file of userFacing) {
  const text = readFileSync(file, "utf8").replace(/hsl\([^)]*\)/g, ""); // colour values such as hsl(41 94% 60%) are not claims
  const hit = text.match(FORBIDDEN);
  assert(!hit, `Forbidden claim "${hit?.[0]}" in ${file}`);
  assert(!/Math\.(?:round|ceil|floor)\([^)]*(?:severity|population|infestation)/i.test(text), `Severity or population formula in ${file}`);
}

// No secrets in tracked files (keys are provided as Cloudflare secrets only).
const SECRET = /\b(?:sk|rk)_live_[A-Za-z0-9]{10,}|\b(?:sk|rk)_test_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{16,}|xkeysib-[A-Za-z0-9-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}/;
const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(f => f && !/\.(png|ico|jpg|lock)$|package-lock\.json$/.test(f));
for (const file of tracked) {
  let text;
  try { text = readFileSync(file, "utf8"); } catch { continue; }
  assert(!SECRET.test(text), `Possible secret committed in ${file}`);
}

// Sitemap hygiene.
const sitemap = readFileSync("public/sitemap.xml", "utf8");
for (const path of ["/", "/quiz", "/tools/calculator", "/tools/entry-points", "/tools/trap-placement", "/tools/cleanup-guide"]) {
  assert(sitemap.includes(`<loc>https://elimination.micegoneguide.com${path === "/" ? "/" : path}</loc>`), `Sitemap is missing ${path}`);
}
assert(!/\/(?:plan|pro|auth|dashboard|payment-success|restore|report)</.test(sitemap), "Private pages must not be in the sitemap");

// The public bundle must not contain Pro-only content (checked on the built output when present).
try {
  for (const f of walk("dist/assets").filter(f => f.endsWith(".js"))) {
    assert(!readFileSync(f, "utf8").includes("d5-steel"), `Pro content found in public bundle ${f}`);
  }
} catch (e) { if (e.code !== "ENOENT") throw e; }

console.log(`Guardrails OK: ${userFacing.length} user-facing files, ${tracked.length} tracked files scanned.`);
