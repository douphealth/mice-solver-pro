import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let source = fs.readFileSync('scripts/approved-release.mjs', 'utf8');
function replaceOnce(before, after) {
  if (source.split(before).length !== 2) throw new Error('Release adapter source changed');
  source = source.replace(before, after);
}
replaceOnce("import crypto from 'node:crypto';", "import crypto from 'node:crypto';\nimport { gunzipSync } from 'node:zlib';");
replaceOnce("const value = JSON.parse(Buffer.concat([d.update(data.subarray(0,-16)),d.final()]).toString());", "const decoded = Buffer.concat([d.update(data.subarray(0,-16)),d.final()]);\n  const value = JSON.parse((e.compression === 'gzip' ? gunzipSync(decoded, {maxOutputLength: 2000000}) : decoded).toString());");
replaceOnce("if(p.domains?.includes('elimination.micegoneguide.com')) {", "if(p.domains?.includes('elimination.micegoneguide.com') || p.name === 'mice-solver-fixed') {");
replaceOnce("check(typeof patch.content==='string' && patch.content.length>1000 && sha(patch.content)===patch.after_sha256,'Invalid WordPress patch');", "if (Array.isArray(patch.edits)) {\n        check(patch.edits.length > 0 && patch.edits.length <= 120, 'Unexpected edit count');\n        patch.content = original.content.raw;\n        for (const edit of patch.edits) {\n          check(typeof edit.old === 'string' && edit.old.length > 0 && typeof edit.new === 'string', 'Invalid edit');\n          const parts = patch.content.split(edit.old);\n          check(parts.length === (edit.count || 1) + 1, 'Exact replacement conflict: ' + patch.slug);\n          patch.content = parts.join(edit.new);\n        }\n      }\n      check(typeof patch.content==='string' && patch.content.length>1000 && sha(patch.content)===patch.after_sha256,'Invalid WordPress patch');");
replaceOnce("if(r.status===200) {for(const m of r.text.matchAll(/https:\\/\\/[a-z0-9-]+\\.supabase\\.co/g)) report.old_supabase_origins.push(m[0]);}", "report.production_assets ||= []; report.production_assets.push({url:u.href,status:r.status,bytes:Buffer.byteLength(r.text),sha256:sha(r.text),content_type:r.headers['content-type']}); if(r.status===200) {backup.production_assets ||= []; backup.production_assets.push({url:u.href,text:r.text}); for(const m of r.text.matchAll(/https:\\/\\/[a-z0-9-]+\\.supabase\\.co/g)) report.old_supabase_origins.push(m[0]);}");
const entry = path.join(process.env.RUNNER_TEMP || '/tmp', 'mgg-release-adapter.mjs');
fs.writeFileSync(entry, source, {mode: 0o600});
await import(pathToFileURL(entry).href);
