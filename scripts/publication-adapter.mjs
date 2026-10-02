import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
let source=fs.readFileSync('scripts/publication-final.mjs','utf8');
function replace(a,b){if(source.split(a).length!==2)throw new Error('Release adapter mismatch');source=source.replace(a,b);}
replace('let content=original.content;for(const edit of patch.edits){',"let content=original.content;if(patch.content_blob_sha){check(/^[a-f0-9]{40}$/.test(patch.content_blob_sha),'Invalid content SHA');const body=await gh('/git/blobs/'+patch.content_blob_sha);check(body.status===200&&body.data.encoding==='base64','Replacement document unavailable');content=Buffer.from(body.data.content,'base64').toString();}for(const edit of patch.edits||[]){");
replace("check(typeof edit.old==='string'&&edit.old.length>0&&typeof edit.new==='string','Bad exact edit');", "if(edit.start&&edit.end){check(content.split(edit.start).length===2,'Ambiguous range start');const first=content.indexOf(edit.start),last=content.indexOf(edit.end,first+edit.start.length);check(last>first,'Range end missing');edit.old=content.slice(first,last+(edit.include_end?edit.end.length:0));}check(typeof edit.old==='string'&&edit.old.length>0&&typeof edit.new==='string','Bad exact edit');");
replace("if(cmd.app){check(cmd.app.source_commit", "if(cmd.app){check(fs.existsSync('app-source/.release-validated'),'App validation did not pass');check(cmd.app.source_commit");
const target=path.join(process.env.RUNNER_TEMP,'mgg-final-adapter.mjs');fs.writeFileSync(target,source,{mode:0o600});await import(pathToFileURL(target).href);
