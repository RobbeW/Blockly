/* Build the public website from a reviewed allowlist, never from the workspace. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'output/github-upload');
const site=path.join(output,'site');
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,'public-site-manifest.json'),'utf8'));
const privateParts=new Set(['grading','source','submissions','reports','output','tmp','docs','.git','.archive','.harness','.codex','.agents','Vakantiecursus']);
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function noSymlinkComponents(base,relative){
  let current=base;
  for(const part of relative.split('/')){
    current=path.join(current,part);
    let info;
    try{info=fs.lstatSync(current);}catch(error){if(error.code==='ENOENT')return;throw error;}
    assert.ok(!info.isSymbolicLink(),`Symlink in publication path: ${relative}`);
  }
}

function validateName(name){
  assert.equal(typeof name,'string');
  assert.ok(name&&!path.isAbsolute(name)&&!name.includes('\\')&&!name.includes('\0'),'Invalid public path');
  assert.equal(path.posix.normalize(name),name,'Public paths must be normalized');
  assert.ok(!name.startsWith('media/'),'Working screenshots are not public assets');
  assert.ok(!name.split('/').some(p=>p==='..'||p==='.'||privateParts.has(p)),`Private path: ${name}`);
  assert.ok(!/(?:^|\/)(?:\.DS_Store|\._[^/]*|AGENTS\.md|HARNESS_START_HERE\.md|brand_motion(?:_notes)?\.md|\.env(?:\..*)?|rubric[^/]*|assessment\.json|review\.json|evidence\.json)$/.test(name),`Private metadata: ${name}`);
  assert.ok(!/\.(?:csv|tsv|xlsx?|docx?|py[co]?|command|pem|key|p12|pfx)$/i.test(name),`Non-public document: ${name}`);
  assert.ok(!/\.pdf$/i.test(name)||name===spec.publicPdf,`Unapproved PDF: ${name}`);
}
function inventory(directory,prefix=''){
  if(!fs.existsSync(directory))return [];
  assert.ok(!fs.lstatSync(directory).isSymbolicLink(),'Upload folder may not be a symlink');
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const relative=prefix+entry.name,absolute=path.join(directory,entry.name);
    assert.ok(!entry.isSymbolicLink(),`Symlink in upload folder: ${relative}`);
    if(entry.isDirectory())return inventory(absolute,relative+'/');
    assert.ok(entry.isFile(),`Unknown upload entry: ${relative}`);
    return [relative];
  });
}
function validateTree(directory,files){
  const allowed=new Set(files);
  for(const name of inventory(directory)){
    validateName(name);
    assert.ok(allowed.has(name),`Unreviewed file in upload folder: ${name}`);
  }
}
function checkReferences(directory,files){
  let count=0;
  function local(from,reference,fromRoot=false){
    if(!reference||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference))return;
    assert.ok(!reference.includes('${'),`Unresolved template in static reference: ${from}`);
    const cleaned=decodeURIComponent(reference.split(/[?#]/)[0]);
    if(!cleaned)return;
    const target=path.resolve(fromRoot?directory:path.dirname(path.join(directory,from)),cleaned);
    assert.ok(target.startsWith(directory+path.sep),`Reference escapes public website: ${reference}`);
    assert.ok(fs.existsSync(target)&&fs.statSync(target).isFile(),`Missing ${reference} in ${from}`);
    count++;
  }
  for(const name of files){
    if(!/\.(?:html|css|js|mjs|json|md)$/.test(name))continue;
    const text=fs.readFileSync(path.join(directory,name),'utf8');
    if(name.endsWith('.html')){
      // Avoid treating HTML templates in inline JavaScript as actual page assets.
      const markup=text.replace(/<script\b([^>]*)>[\s\S]*?<\/script\s*>/gi,(_all,attrs)=>`<script${attrs}></script>`);
      for(const tag of markup.matchAll(/<(?:script|link|img|a|iframe|source|audio|video)\b[^>]*>/gi))
        for(const match of tag[0].matchAll(/\b(?:src|href)=["']([^"']+)["']/gi))local(name,match[1]);
      for(const match of text.matchAll(/\b(?:from|import\s*\()\s*["'](\.[^"']+)["']/g))local(name,match[1]);
    }
    if(name.endsWith('.css'))for(const match of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g))local(name,match[1]);
    if(name.endsWith('.md'))for(const match of text.matchAll(/\]\(([^)]+)\)/g))local(name,match[1]);
    if(name==='content/catalog.json')for(const chapter of JSON.parse(text).chapters)local(name,chapter.path);
    if(!name.endsWith('.mjs')&&!name.endsWith('.json'))for(const match of text.matchAll(/["'`]((?:assessment|assets|common|content|maze|syllabus|vendor)\/[^"'`\s<>?#]+\.(?:js|mjs|css|json|png|svg|webp|mp3|ogg|pdf|ttf|gif|cur|jpg))["'`]/g))local(name,match[1],true);
  }
  for(const version of ['A','B','C']){
    const entry=`evaluations/chapter-2/versions/${version}/index.html`;
    const context={window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(directory,`evaluations/chapter-2/versions/${version}/config.js`),'utf8'),context,{timeout:1000});
    assert.equal(context.window.ASSESSMENT_CONFIG.version,version);
    for(const group of context.window.ASSESSMENT_CONFIG.groups)for(const task of group.tasks||[])if(task.asset)local(entry,task.asset);
  }
  const assets={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(directory,'assessment/assets-bundle.js'),'utf8'),assets,{timeout:5000});
  vm.runInNewContext(fs.readFileSync(path.join(directory,'evaluations/chapter-2/chapter2-assets.js'),'utf8'),assets,{timeout:5000});
  for(const filename of ['NotoSans-Regular.ttf','NotoSans-Bold.ttf','NotoSansMono-Regular.ttf']){
    const relative=`assessment/vendor/fonts/${filename}`;
    assert.equal(sha(Buffer.from(assets.window.ASSESSMENT_ASSETS[relative].split(',')[1],'base64')),sha(fs.readFileSync(path.join(directory,relative))),'PDF font mismatch');
  }
  for(const [relative,data] of Object.entries(assets.window.CHAPTER2_ASSETS)){
    const absolute=path.resolve(directory,'evaluations/chapter-2/versions/A',relative);
    assert.ok(absolute.startsWith(directory+path.sep));
    assert.equal(sha(Buffer.from(data.split(',')[1],'base64')),sha(fs.readFileSync(absolute)),'Turtle export diagram mismatch');
  }
  return count;
}
function prepare({checkOnly=false}={}){
  assert.equal(spec.schemaVersion,1);
  const files=spec.files;
  assert.deepEqual(files,[...new Set(files)].sort(),'Public manifest must be unique and sorted');
  files.forEach(validateName);
  noSymlinkComponents(root,'output/github-upload/site');
  validateTree(site,files);
  for(const name of files){
    const source=path.join(root,name),destination=path.join(site,name);
    noSymlinkComponents(root,name);
    assert.ok(fs.lstatSync(source).isFile()&&!fs.lstatSync(source).isSymbolicLink(),`Invalid source: ${name}`);
    assert.ok(fs.realpathSync(source).startsWith(root+path.sep),`Source outside project: ${name}`);
    if(!checkOnly){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(source,destination);}
    assert.ok(fs.existsSync(destination),`Missing public copy: ${name}`);
    assert.equal(sha(fs.readFileSync(source)),sha(fs.readFileSync(destination)),`Stale public copy: ${name}`);
  }
  assert.deepEqual(inventory(site).sort(),files);
  const references=checkReferences(site,files);
  const manifest={purpose:'Complete public Blockly website; upload site contents into repository root',files:Object.fromEntries(files.map(name=>[name,sha(fs.readFileSync(path.join(site,name)))])),verifiedLocalReferences:references};
  if(!checkOnly){
    fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    fs.writeFileSync(path.join(output,'README.md'),`# Clean public website upload\n\nUpload only the **contents of site/** into the root of RobbeW/Blockly. This is the complete website, including Maze A/B/C and Turtle A/B/C. Keep the existing relative folders; do not upload an extra site/ folder layer.\n\nNever upload the Blockly workspace itself: it also contains the local harness, teacher tools and private student records. The site payload is generated from scripts/public-site-manifest.json. No grading tools/keys, original tests, student PDFs, results, harness, caches or working screenshots are included. The linked public teaching syllabus is intentionally included.\n\nRegenerate: node scripts/prepare-github-upload.cjs\nVerify without changing files: node scripts/prepare-github-upload.cjs --check\n\nThe checksum manifest and this README are local upload instructions and do not need uploading. Existing unwanted files already committed to GitHub must be removed there when committing the staged cleanup; adding .gitignore alone does not remove old tracked files or erase history. No push or deployment has been performed by this build.\n`);
  }
  console.log(`PASS: ${files.length} reviewed public files; ${references} references; six evaluations; export fonts/diagrams; no private files.`);
  console.log(`Upload only: ${site}`);
  return manifest;
}
if(require.main===module){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--check'),'Only --check is supported');
  prepare({checkOnly:process.argv.includes('--check')});
}
module.exports={validateName,validateTree,inventory,noSymlinkComponents,prepare};
