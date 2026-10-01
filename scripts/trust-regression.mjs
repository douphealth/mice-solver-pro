import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const files = ['src/pages/Index.tsx','src/pages/ReportPage.tsx','src/pages/CalculatorPage.tsx','src/pages/EntryPointsPage.tsx','src/components/Footer.tsx','src/components/EmailCaptureModal.tsx','src/lib/report-generator.ts','src/lib/pdf-generator.ts','supabase/functions/mice-elimination-lead/index.ts','index.html', ...readdirSync('src/components/report').filter(x=>x.endsWith('.tsx')).map(x=>join('src/components/report',x))];
for (const file of files) {
  const source = readFileSync(file,'utf8');
  assert(!/12,847|12,000\+|94%|4\.9\/5|EXPERT-REVIEWED|FACT-CHECKED|professional-grade|expert-grade|AI-Powered|same assessment criteria|could grow to|guarantees return|eliminate mice permanently/i.test(source), `Fabricated claim remains in ${file}`);
  assert(!/Math\.(round|ceil)\(.*(?:severity|population|sqft)/i.test(source), `Population/trap formula remains in ${file}`);
}
assert(!/sticky top-0/.test(readFileSync('src/components/Navbar.tsx','utf8')));
assert(!readFileSync('public/sitemap.xml','utf8').includes('/auth'));
assert(readFileSync('public/_headers','utf8').includes('X-Robots-Tag: noindex'));
console.log(`Trust regression: ${files.length} active surfaces checked; no forbidden claims, metric formulas, sticky header or auth sitemap entry.`);
