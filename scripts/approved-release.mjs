import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const REPO = 'douphealth/mice-solver-pro';
const REF = 'ops/approved-publish-2026-10-02';
const SOURCE = 'ecad2eea2e556358b0a3cb27b3125a0c2987f442';
const SITE = 'https://micegoneguide.com';
const APP = 'https://elimination.micegoneguide.com';
const SLUGS = ['how-to-get-rid-of-mice','signs-of-mice-infestation','how-to-get-rid-of-mice-in-walls','best-mouse-traps-for-homes','humane-mouse-traps','steel-wool-vs-copper-mesh-for-mice','rats-vs-mice-whats-the-difference','mouse-removal','natural-mouse-repellents','mouse-droppings'];
const RUN = process.env.GITHUB_RUN_ID;
const PRIVATE = path.join(process.env.RUNNER_TEMP || '/tmp', 'mgg-approved-release');
const OUT = 'release-evidence';
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const secrets = [];
function check(v, message) { if (!v) throw new Error(message); }
function mask(s) { if (typeof s !== 'string' || !s) return; secrets.push(s); console.log('::add-mask::' + s.replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A')); }
function clean(s) { for (const v of secrets) s = s.split(v).join('[REDACTED]'); return s; }
function write(file, data, privateFile = false) { fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2), { mode: privateFile ? 0o600 : 0o644 }); }
function envelope(data, publicKey, aad) {
  const key = crypto.randomBytes(32), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm',key,iv); c.setAAD(Buffer.from(aad));
  const ciphertext = Buffer.concat([c.update(Buffer.from(JSON.stringify(data))),c.final(),c.getAuthTag()]);
  return {algorithm:'RSA-OAEP-SHA256+A256GCM',aad,wrapped_key:crypto.publicEncrypt({key:publicKey,oaepHash:'sha256',padding:crypto.constants.RSA_PKCS1_OAEP_PADDING},key).toString('base64'),nonce:iv.toString('base64'),ciphertext:ciphertext.toString('base64')};
}
function decrypt(e) {
  check(e.algorithm === 'RSA-OAEP-SHA256+A256GCM' && e.aad === RUN, 'Wrong request envelope');
  const key = crypto.privateDecrypt({key:fs.readFileSync(path.join(PRIVATE,'key.pem')),oaepHash:'sha256',padding:crypto.constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(e.wrapped_key,'base64'));
  const data = Buffer.from(e.ciphertext,'base64');
  const d = crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(e.nonce,'base64'));
  d.setAAD(Buffer.from(RUN)); d.setAuthTag(data.subarray(-16));
  const value = JSON.parse(Buffer.concat([d.update(data.subarray(0,-16)),d.final()]).toString());
  check(value.run_id === RUN && Number(value.expires) > Date.now()/1000, 'Expired or mismatched request');
  return value;
}
async function http(url, headers = {}, method = 'GET', body) {
  const r = await fetch(url,{headers:{'User-Agent':'MiceGoneGuide-Owner-Authorized-Release/1.0',...headers},method,body:body === undefined ? undefined : JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(30000)});
  const text = await r.text(); let data; try { data=JSON.parse(text); } catch { data=null; }
  return {status:r.status,data,text,headers:Object.fromEntries(r.headers)};
}
async function receive(phase, seconds=1200) {
  const until=Date.now()+seconds*1000;
  const url=`https://api.github.com/repos/${REPO}/contents/release/${phase}-${RUN}.json?ref=${encodeURIComponent(REF)}`;
  while(Date.now()<until) {
    const r=await http(url,{'Authorization':`Bearer ${process.env.GH_READ_TOKEN}`,'Accept':'application/vnd.github+json'});
    if(r.status===200) {
      check(r.data?.size < 2000000 && r.data?.encoding==='base64','Invalid request file');
      const v=decrypt(JSON.parse(Buffer.from(r.data.content,'base64').toString()));
      check(v.phase===phase,'Wrong phase'); return v;
    }
    check(r.status===404,`Request lookup HTTP ${r.status}`); await sleep(8000);
  }
  throw new Error(`No ${phase} request received before timeout`);
}
function cfHeaders(a) { return a.kind==='global' ? {'X-Auth-Key':a.key,'X-Auth-Email':a.email,'Content-Type':'application/json'} : {'Authorization':`Bearer ${a.token}`,'Content-Type':'application/json'}; }
async function cf(a, route, method='GET', body) { return http('https://api.cloudflare.com/client/v4'+route,cfHeaders(a),method,body); }
function wpHeaders(w) { return {'Authorization':'Basic '+Buffer.from(w.username+':'+w.password).toString('base64'),'Content-Type':'application/json'}; }
async function wpGet(w,type,id) { const r=await http(`${SITE}/wp-json/wp/v2/${type}/${id}?context=edit`,wpHeaders(w)); check(r.status===200 && typeof r.data?.content?.raw==='string',`Cannot read raw ${type}/${id}: HTTP ${r.status}`); return r.data; }
function minimalPost(p,type) { return {type,id:p.id,slug:p.slug,status:p.status,link:p.link,modified_gmt:p.modified_gmt,title:p.title,content:p.content,excerpt:p.excerpt,featured_media:p.featured_media,categories:p.categories,tags:p.tags}; }
function registerSecrets(c) { for(const w of c.wp_candidates||[]) {mask(w.password);mask(w.password.replaceAll(' ',''));mask(Buffer.from(w.username+':'+w.password).toString('base64'));} for(const a of c.cloudflare||[]) {mask(a.token);mask(a.key);} }
async function init() {
  check(RUN && process.env.GITHUB_REPOSITORY===REPO,'Wrong runner repository');
  fs.mkdirSync(PRIVATE,{recursive:true,mode:0o700}); fs.mkdirSync(OUT,{recursive:true});
  const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:3072,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
  write(path.join(PRIVATE,'key.pem'),privateKey,true);
  write(`${OUT}/handshake.json`,{run_id:RUN,source_commit:SOURCE,repository:REPO,ref:REF,public_key:publicKey,fingerprint:sha(publicKey)});
  console.log('Ephemeral public-key handshake ready for run '+RUN+'. Private key remains only in runner temporary storage.');
}
async function preflight() {
  const c=await receive('preflight'); registerSecrets(c);
  check(Array.isArray(c.cloudflare) && c.cloudflare.length<=6 && Array.isArray(c.wp_candidates) && c.wp_candidates.length<=2,'Invalid credential scope');
  check(crypto.createPublicKey(c.backup_public_key).asymmetricKeyType==='rsa','Invalid rollback public key');
  write(path.join(PRIVATE,'credentials.json'),c,true);
  const report={run_id:RUN,source_commit:SOURCE,wp_auth:[],wordpress:[],cloudflare_auth:[],app_candidates:[],dns:[],errors:[]};
  const backup={run_id:RUN,created_at:new Date().toISOString(),posts:[],cloudflare_projects:[]};
  let selected;
  for(let i=0;i<c.wp_candidates.length;i++) {
    const w=c.wp_candidates[i]; const r=await http(`${SITE}/wp-json/wp/v2/users/me?context=edit&_fields=id,capabilities`,wpHeaders(w));
    report.wp_auth.push({candidate:i,status:r.status,can_edit_posts:!!r.data?.capabilities?.edit_posts});
    if(r.status===200 && r.data?.capabilities?.edit_posts) {selected=i;break;}
  }
  if(selected!==undefined) {
    for(const slug of SLUGS) {
      let found=false;
      for(const type of ['posts','pages']) {
        const r=await http(`${SITE}/wp-json/wp/v2/${type}?context=edit&slug=${encodeURIComponent(slug)}&per_page=2`,wpHeaders(c.wp_candidates[selected]));
        if(r.status===200 && Array.isArray(r.data) && r.data.length===1 && typeof r.data[0].content?.raw==='string') {
          const p=r.data[0]; check(p.slug===slug && p.link.startsWith(SITE+'/'),'Unexpected WordPress record');
          backup.posts.push(minimalPost(p,type)); report.wordpress.push({type,id:p.id,slug,status:p.status,link:p.link,content_sha256:sha(p.content.raw),bytes:Buffer.byteLength(p.content.raw),modified_gmt:p.modified_gmt}); found=true;break;
        }
        if(r.status!==200) report.errors.push(`${type}/${slug}: HTTP ${r.status}`);
      }
      if(!found) report.errors.push('No unique raw WordPress record: '+slug);
    }
  }
  const accounts=new Set(), zones=[];
  for(let i=0;i<c.cloudflare.length;i++) {
    const a=c.cloudflare[i]; const r=await cf(a,'/accounts?per_page=50');
    report.cloudflare_auth.push({candidate:i,accounts_http:r.status,error_codes:r.data?.errors?.map(e=>e.code)||[]});
    for(const account of r.data?.success && Array.isArray(r.data.result)?r.data.result:[]) accounts.add(account.id);
    const z=await cf(a,'/zones?name=micegoneguide.com&per_page=50');
    for(const zone of z.data?.success && Array.isArray(z.data.result)?z.data.result:[]) {
      if(zone.name==='micegoneguide.com') {accounts.add(zone.account.id); zones.push({id:zone.id,auth:i});
        const d=await cf(a,`/zones/${zone.id}/dns_records?name=elimination.micegoneguide.com`);
        for(const row of d.data?.success && Array.isArray(d.data.result)?d.data.result:[]) report.dns.push({type:row.type,name:row.name,content:row.content,proxied:row.proxied});
      }
    }
  }
  check(accounts.size<=30,'Account discovery unexpectedly broad');
  const matches=[];
  for(let i=0;i<c.cloudflare.length;i++) for(const account of accounts) {
    const r=await cf(c.cloudflare[i],`/accounts/${account}/pages/projects?per_page=100`);
    for(const p of r.data?.success && Array.isArray(r.data.result)?r.data.result:[]) {
      if(p.domains?.includes('elimination.micegoneguide.com')) {
        const info={account,project:p.name,auth:i,production_branch:p.production_branch,domains:p.domains,previous_deployment_id:p.canonical_deployment?.id,previous_deployment_url:p.canonical_deployment?.url,source:p.source?.type,source_repo:p.source?.config?.repo_name,source_owner:p.source?.config?.owner,previous_commit:p.canonical_deployment?.deployment_trigger?.metadata?.commit_hash};
        matches.push(info); report.app_candidates.push(info); backup.cloudflare_projects.push({account,project:p});
      }
    }
  }
  const before=await http(APP+'/'); report.app_http=before.status; backup.app_html=before.text;
  report.old_supabase_origins=[];
  for(const match of before.text.matchAll(/<script[^>]+src=["']([^"']+)["']/g)) {
    const u=new URL(match[1],APP); if(u.origin!==APP || !u.pathname.startsWith('/assets/')) continue;
    const r=await http(u.href); if(r.status===200) {for(const m of r.text.matchAll(/https:\/\/[a-z0-9-]+\.supabase\.co/g)) report.old_supabase_origins.push(m[0]);}
  }
  report.old_supabase_origins=[...new Set(report.old_supabase_origins)];
  report.new_supabase_origins=[];
  for(const name of fs.readdirSync('dist/assets').filter(n=>n.endsWith('.js'))) {
    for(const m of fs.readFileSync('dist/assets/'+name,'utf8').matchAll(/https:\/\/[a-z0-9-]+\.supabase\.co/g)) report.new_supabase_origins.push(m[0]);
  }
  report.new_supabase_origins=[...new Set(report.new_supabase_origins)];
  write(path.join(PRIVATE,'state.json'),{selected,matches,zones,backup,report},true);
  write(`${OUT}/preflight.json`,report);
  write(`${OUT}/rollback.encrypted.json`,envelope(backup,c.backup_public_key,'mgg-backup-'+RUN));
  console.log(JSON.stringify(report,null,2));
}
async function deploy() {
  const command=await receive('deploy',1500);
  const c=JSON.parse(fs.readFileSync(path.join(PRIVATE,'credentials.json'))); registerSecrets(c);
  const state=JSON.parse(fs.readFileSync(path.join(PRIVATE,'state.json')));
  const receipt={run_id:RUN,source_commit:SOURCE,wordpress:[],app:null,errors:[]};
  if(command.app) {
    const m=state.matches.find(x=>x.account===command.app.account && x.project===command.app.project && x.auth===command.app.auth);
    check(m && m.previous_deployment_id && m.previous_deployment_id===command.app.previous_deployment_id,'App deployment guard mismatch');
    check(!m.source_repo || m.source_repo==='mice-solver-pro','Cloudflare source repository differs');
    check(JSON.stringify([...state.report.old_supabase_origins].sort())===JSON.stringify([...state.report.new_supabase_origins].sort()) && state.report.new_supabase_origins.length>0,'Supabase configuration differs from production');
    const a=c.cloudflare[m.auth]; check(a.kind==='token','Use a scoped API token for deployment');
    const current=await cf(a,`/accounts/${m.account}/pages/projects/${encodeURIComponent(m.project)}`);
    check(current.data?.result?.canonical_deployment?.id===m.previous_deployment_id,'Production changed since preflight');
    write('dist/mgg-release.json',{source_commit:SOURCE,run_id:RUN,published_at:new Date().toISOString()});
    const args=['--offline','--yes','wrangler@4','pages','deploy','dist','--project-name',m.project,'--branch',m.production_branch||'main','--commit-hash',SOURCE,'--commit-message','Owner-approved evidence-led planner release','--commit-dirty=true'];
    const result=spawnSync('npx',args,{env:{...process.env,CLOUDFLARE_API_TOKEN:a.token,CLOUDFLARE_ACCOUNT_ID:m.account,WRANGLER_SEND_METRICS:'false',CI:'true'},encoding:'utf8',timeout:240000,maxBuffer:2000000});
    console.log(clean((result.stdout||'')+'\n'+(result.stderr||'')));
    check(result.status===0,'Cloudflare deployment command failed');
    let verified=false, deployment;
    for(let i=0;i<18;i++) {
      const marker=await http(APP+'/mgg-release.json?run='+RUN);
      const project=await cf(a,`/accounts/${m.account}/pages/projects/${encodeURIComponent(m.project)}`);
      deployment=project.data?.result?.canonical_deployment;
      if(marker.data?.source_commit===SOURCE && marker.data?.run_id===RUN && deployment?.latest_stage?.status==='success') {verified=true;break;}
      await sleep(5000);
    }
    const header=await http(APP+'/report');
    receipt.app={verified,url:APP+'/',deployment_id:deployment?.id,previous_deployment_id:m.previous_deployment_id,source_commit:SOURCE,report_x_robots_tag:header.headers['x-robots-tag']};
    check(verified,'Deployment not verified at the production domain');
  }
  if(command.wordpress?.length) {
    check(state.selected!==undefined && command.wordpress.length<=10,'WordPress publication is not authorized by preflight');
    for(const patch of command.wordpress) {
      const original=state.backup.posts.find(p=>p.id===patch.id && p.type===patch.type && p.slug===patch.slug);
      check(original && SLUGS.includes(patch.slug) && original.status==='publish' && sha(original.content.raw)===patch.before_sha256,'WordPress source guard mismatch');
      check(typeof patch.content==='string' && patch.content.length>1000 && sha(patch.content)===patch.after_sha256,'Invalid WordPress patch');
      const w=c.wp_candidates[state.selected], current=await wpGet(w,patch.type,patch.id);
      check(current.slug===patch.slug && current.status==='publish' && sha(current.content.raw)===patch.before_sha256,'WordPress changed since backup: '+patch.slug);
      const response=await http(`${SITE}/wp-json/wp/v2/${patch.type}/${patch.id}`,wpHeaders(w),'POST',{content:patch.content});
      check(response.status===200,'WordPress update HTTP '+response.status);
      const after=await wpGet(w,patch.type,patch.id);
      const exact=sha(after.content.raw)===patch.after_sha256;
      if(!exact) {receipt.errors.push('Content was transformed by WordPress: '+patch.slug);write(`${OUT}/receipt.json`,receipt);throw new Error('WordPress changed submitted content; stopped further writes');}
      const publicPage=await http(after.link+'?mgg_release='+RUN);
      receipt.wordpress.push({id:patch.id,slug:patch.slug,url:after.link,before_sha256:patch.before_sha256,after_sha256:sha(after.content.raw),raw_verified:exact,public_http:publicPage.status,public_marker_present:publicPage.text.includes(patch.verify_text||'data-mgg-release'),modified_gmt:after.modified_gmt});
      write(`${OUT}/receipt.json`,receipt); console.log('Published and raw-verified: '+after.link);
    }
  }
  write(`${OUT}/receipt.json`,receipt); console.log(JSON.stringify(receipt,null,2));
}
try {
  const mode=process.argv[2]; check(['init','preflight','deploy'].includes(mode),'Unsupported release stage');
  await ({init,preflight,deploy})[mode]();
} catch(e) {console.error(clean('Release stopped: '+e.message));process.exitCode=1;}
