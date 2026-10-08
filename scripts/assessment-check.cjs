/* Focused integration check. Run with NODE_PATH pointing to your Playwright installation. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const {pathToFileURL}=require('url');
const assert = require('assert/strict');
let playwright;
try { playwright = require('playwright'); }
catch (_) { throw new Error('Install Playwright or set NODE_PATH to the bundled node_modules directory.'); }
const root = path.resolve(__dirname, '..');
const version=process.env.ASSESSMENT_VERSION||'A';
assert.ok(['A','B','C'].includes(version),'ASSESSMENT_VERSION must be A, B or C');
const entry=`test_maze_version_${version}.html`;
const basePath=process.env.ASSESSMENT_BASE_PATH||'/';
assert.ok(basePath.startsWith('/')&&basePath.endsWith('/'),'ASSESSMENT_BASE_PATH must start and end with /');
const output = path.join(root, 'tmp', 'assessment-check',version);
fs.mkdirSync(output, {recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.gif':'image/gif','.ttf':'font/ttf','.json':'application/json'};
const server = http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith(basePath)){res.writeHead(404);res.end();return;}
  const requested = path.resolve(root, './'+pathname.slice(basePath.length));
  if (!requested.startsWith(root+path.sep) && requested!==root) {res.writeHead(403);res.end();return;}
  let exactPath=root;
  for(const segment of path.relative(root,requested).split(path.sep)){if(!fs.existsSync(exactPath)||!fs.statSync(exactPath).isDirectory()||!fs.readdirSync(exactPath).includes(segment)){res.writeHead(404);res.end();return;}exactPath=path.join(exactPath,segment);}
  fs.readFile(requested,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(requested)]||'application/octet-stream');res.end(data);});
});
const errors=[], externalRequests=[];
const check = (condition, message) => assert.ok(condition, message);
async function main() {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await playwright.chromium.launch({headless:true,...(process.env.ASSESSMENT_BROWSER?{executablePath:process.env.ASSESSMENT_BROWSER}:{})});
  try {
    const context=await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const address=`http://127.0.0.1:${server.address().port}${basePath}${entry}`;
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()}: ${response.url()}`);});
    page.on('request',request=>{if(/^https?:/.test(request.url())&&!request.url().startsWith(new URL(address).origin)&&request.url()!=='https://school.example/toets-upload')externalRequests.push(request.url());});
    await page.goto(address);await page.screenshot({path:path.join(output,'gate.png'),fullPage:true});
    assert.equal(await page.locator('.primary').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(82, 0, 255)','brand CSS loads under deployment prefix');
    for(let i=1;i<=6;i++){await page.locator('#student-class').fill(String(i));await page.locator('#student-class').blur();assert.equal(await page.locator('#student-class').inputValue(),'1STEAM'+i);}
    await page.locator('#student-class').fill('1steam7');check(!(await page.locator('#student-class').evaluate(field=>field.checkValidity())),'class outside 1STEAM1–6 is rejected');
    await page.locator('#student-name').fill('Zoë Testleerling');await page.locator('#student-class').fill('1steam1');await page.locator('#student-number').fill('7');
    await page.locator('#start-password').fill('wrong');await page.locator('#start-form button').click();
    await assert.equal(await page.locator('#exam').isVisible(),false,'wrong password must not unlock');
    await page.locator('#start-password').fill('Charles');await page.locator('#start-form button').click();
    await page.waitForSelector('#exam:not([hidden])');
    check(await page.locator('#exam-timer').isVisible(),'timer starts after unlock');check(/^(45:00|44:5\d)$/.test(await page.locator('#timer-value').textContent()),'timer starts at 45 minutes');
    const testConfig=await page.evaluate(()=>window.AssessmentApp.config);assert.equal(testConfig.groups.reduce((sum,g)=>sum+g.points,0),25);assert.equal(testConfig.exercises.reduce((sum,e)=>sum+e.points,0),9);
    assert.equal(testConfig.version,version);assert.equal(await page.locator('#version-label').textContent(),`Versie ${version}`);
    check(await page.getByRole('heading',{name:'1b. Vertaal naar JavaScript'}).isVisible(),'clear JavaScript translation section');
    check(await page.getByRole('heading',{name:'1c. Vertaal naar Nederlands'}).isVisible(),'clear Dutch translation section');
    check((await page.locator('#question-panel').textContent()).includes(testConfig.groups[0].rows[0][1]),'concept sentence retained');
    await page.screenshot({path:path.join(output,'translation.png'),fullPage:true});
    for(let i=0;i<6;i++)await page.locator(`[data-answer="q1"][data-index="${i}"]`).fill(['sequentie','if','pad rechts','anders','zolang','pad vooruit'][i]);
    await page.locator('.nav-button[data-group="q2"]').click();
    for(let i=0;i<3;i++)await page.locator(`[data-answer="q2"][data-index="${i}"]`).fill(['moveForward();','if (isPathRight()) { turnRight(); }','while (notDone()) { if (isPathLeft()) { turnLeft(); } }'][i]);
    await page.locator('.nav-button[data-group="q3"]').click();await page.locator('[data-answer="q3"]').fill('Hij onderzoekt het pad en voert de blokken in volgorde uit.');
    assert.equal(await page.locator('.question-heading .points').textContent(),'1 punt');
    check((await page.locator('.taalzorg').textContent()).includes('hoofdletters en leestekens'),'taalzorg marker on open answer');
    await page.locator('.nav-button[data-group="q4"]').click();await page.locator('[data-branch="code"]').click();
    check((await page.locator('[data-maze="1"] .maze-state').textContent()).includes('Nog leeg'),'unfinished maze indicator');
    await page.locator('[data-coding-next]').click();await page.waitForSelector('#coding-review-dialog[open]');
    assert.equal(await page.locator('[data-resume-maze]').count(),4);await page.locator('[data-close-coding]').click();
    const firstTurn=version==='B'?'Right':'Left',secondTurn=version==='B'?'Left':'Right';
    const correct=`while (notDone()) {\n  moveForward();\n  turn${firstTurn}();\n  moveForward();\n  turn${secondTurn}();\n}`;
    await page.locator('#code-answer').fill(correct);await page.locator('[data-run]').click();
    await page.waitForFunction(()=>window.AssessmentApp.getState().exercises['maze-1'].results.code?.status==='reached');
    assert.equal(await page.locator('[data-maze="0"] .maze-state').textContent(),'Doel bereikt');
    await page.locator('[data-stop]').click();
    // Infinite code is terminated without freezing answers/navigation.
    await page.locator('#code-answer').fill('while (true) {}');await page.locator('[data-run]').click();
    await page.waitForFunction(()=>window.AssessmentApp.getState().exercises['maze-1'].results.code?.status==='error');
    await page.locator('#code-answer').fill(correct);await page.locator('[data-run]').click();
    await page.waitForFunction(()=>window.AssessmentApp.getState().exercises['maze-1'].results.code?.status==='reached');await page.locator('[data-stop]').click();
    await page.locator('[data-branch="blocks"]').click();
    await page.evaluate(()=>{const w=Blockly.getMainWorkspace(),b=w.newBlock('assessment_maze_move_forward');b.initSvg();b.render();});
    await page.waitForTimeout(150);await page.locator('[data-branch="code"]').click();assert.equal(await page.locator('#code-answer').inputValue(),correct);
    await page.locator('[data-branch="blocks"]').click();check(await page.evaluate(()=>Blockly.getMainWorkspace().getAllBlocks(false).length===1),'block draft restored');
    await page.evaluate(version=>{
      const w=Blockly.getMainWorkspace();w.clear();
      const make=type=>{const b=w.newBlock(type);b.initSvg();b.render();return b;};
      const loop=make('controls_whileUntil'),condition=make('assessment_maze_not_done');
      loop.getInput('BOOL').connection.connect(condition.outputConnection);
      const body=['assessment_maze_move_forward',version==='B'?'assessment_maze_turn_right':'assessment_maze_turn_left','assessment_maze_move_forward',version==='B'?'assessment_maze_turn_left':'assessment_maze_turn_right'].map(make);
      loop.getInput('DO').connection.connect(body[0].previousConnection);for(let i=1;i<body.length;i++)body[i-1].nextConnection.connect(body[i].previousConnection);
    },version);
    await page.waitForTimeout(100);await page.locator('[data-run]').click();await page.waitForFunction(()=>window.AssessmentApp.getState().exercises['maze-1'].results.blocks?.status==='reached');await page.locator('[data-stop]').click();
    await page.locator('[data-branch="code"]').click();await page.screenshot({path:path.join(output,'coding-code.png'),fullPage:true});
    for(const i of [1,2]) {
      await page.locator(`[data-maze="${i}"]`).click();await page.locator('[data-branch="code"]').click();await page.locator('#code-answer').fill('// UNSUBMITTED_CODE_SECRET');
      await page.locator('[data-branch="blocks"]').click();
      await page.evaluate(()=>{const w=Blockly.getMainWorkspace();const a=w.newBlock('assessment_maze_move_forward'),b=w.newBlock('assessment_maze_turn_right');for(const x of [a,b]){x.initSvg();x.render();}a.nextConnection.connect(b.previousConnection);});
      await page.waitForTimeout(150);await page.locator('[data-run]').click();await page.waitForFunction(id=>window.AssessmentApp.getState().exercises[id].results.blocks!==null,`maze-${i+1}`);await page.locator('[data-stop]').click();
    }
    await page.screenshot({path:path.join(output,'coding-blocks.png'),fullPage:true});
    await page.locator('[data-maze="3"]').click();await page.locator('[data-branch="code"]').click();
    await page.locator('#maze-explanation').fill('EXPLANATION_JS: Ik herken het padpatroon en controleer mijn keuzes tot het doel bereikt is.');
    await page.locator('[data-branch="blocks"]').click();assert.equal(await page.locator('#maze-explanation').inputValue(),'');await page.locator('#maze-explanation').fill('UNSUBMITTED_EXPLANATION_SECRET');
    await page.locator('[data-branch="code"]').click();check((await page.locator('#maze-explanation').inputValue()).startsWith('EXPLANATION_JS'),'explanation drafts remain independent');
    const code4='// Laatste maze: eigen ontwerp\n'+Array.from({length:80},(_,i)=>`// Lange regel ${i}: deze code blijft leesbaar en wordt volledig geëxporteerd.`).join('\n');
    await page.locator('#code-answer').fill(code4);
    await page.locator('.nav-button[data-group="q5"]').click();
    await page.evaluate(()=>{const el=document.querySelector('#mark-code'),node=el.firstChild,start=node.textContent.indexOf('moveForward'),range=document.createRange();range.setStart(node,start);range.setEnd(node,start+13);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);});
    await page.waitForTimeout(80);await page.locator('[data-tool="action"]').click();
    check(await page.evaluate(()=>window.AssessmentApp.getState().exercises['maze-1'].drafts.code.markings.length===1),'code marking persisted');
    // Mark any block with either classification: the exam must not reveal correctness.
    await page.locator('[data-maze="1"]').click();await page.locator('[data-tool="condition"]').click();
    await page.evaluate(()=>{const w=Blockly.getMainWorkspace(),b=w.getAllBlocks(false)[0];Blockly.Events.fire(new Blockly.Events.Selected(null,b.id,w.id));});
    await page.waitForTimeout(150);
    check(await page.evaluate(()=>Object.values(window.AssessmentApp.getState().exercises['maze-2'].drafts.blocks.markings).some(m=>m.kind==='condition')),'incorrect classification accepted');
    await page.screenshot({path:path.join(output,'marking-blocks.png'),fullPage:true});
    await page.locator('.nav-button[data-group="q6"]').click();for(let i=0;i<3;i++)await page.locator(`[data-answer="q6"][data-index="${i}"]`).fill(`Uitleg ${i}: een algoritme gebruikt duidelijke stappen.\n`+'Lange open uitleg met accenten: efficiënt, ideeën, café. '.repeat(i===0?120:2));
    await page.locator('.nav-button[data-group="q7"]').click();for(let i=0;i<5;i++)await page.locator(`[data-answer="q7"][data-index="${i}"]`).selectOption(String([2,5,3,4,1][i]));
    await page.locator('[data-answer="q7"][data-index="0"]').selectOption('5');check((await page.locator('#ordering-error').textContent()).length>0,'duplicate ordering warning');await page.locator('[data-answer="q7"][data-index="0"]').selectOption('2');
    await page.locator('.nav-button[data-group="q8"]').click();check((await page.locator('.reference-code').textContent()).includes('while (notDone())'),'infinite-loop source rendered');for(let i=0;i<3;i++)await page.locator(`[data-answer="q8"][data-index="${i}"]`).fill(`LOOP_ANSWER_${i}: mijn uitleg en verbetering.`);await page.screenshot({path:path.join(output,'infinite-loop.png'),fullPage:true});
    if(version==='A'){check((await page.locator('.reference-code').textContent()).includes('turnLeft();'),'A uses turning-only infinite loop');check(await page.locator('.reference-program').evaluate(image=>image.complete&&image.naturalWidth>0),'Pegman level 3 reference loads');}
    await page.locator('.nav-button[data-group="q9"]').click();
    await page.evaluate(version=>{const w=Blockly.getMainWorkspace();const make=type=>{const b=w.newBlock(type);b.initSvg();b.render();return b;};const once=['assessment_maze_move_forward','assessment_maze_move_forward',version==='B'?'assessment_maze_turn_right':'assessment_maze_turn_left'].map(make),loop=make('controls_whileUntil'),condition=make('assessment_maze_not_done'),body=make('assessment_maze_move_forward');loop.getInput('BOOL').connection.connect(condition.outputConnection);loop.getInput('DO').connection.connect(body.previousConnection);for(let i=1;i<once.length;i++)once[i-1].nextConnection.connect(once[i].previousConnection);once[2].nextConnection.connect(loop.previousConnection);window.__boundaryBlocks={once:once.map(b=>b.id),body:body.id};},version);
    await page.waitForTimeout(150);await page.locator('[data-run]').click();await page.waitForFunction(()=>window.AssessmentApp.getState().boundaries.q9.result?.status==='reached');await page.locator('[data-stop]').click();
    await page.locator('[data-boundary-tool="once"]').click();await page.evaluate(()=>{const w=Blockly.getMainWorkspace();for(const id of [...window.__boundaryBlocks.once,window.__boundaryBlocks.body])Blockly.Events.fire(new Blockly.Events.Selected(null,id,w.id));});await page.waitForTimeout(100);
    check(await page.evaluate(()=>window.AssessmentApp.getState().boundaries.q9.markings[window.__boundaryBlocks.body]?.kind==='once'),'student classification accepted without revealing correctness');
    await page.locator('[data-boundary-tool="repeated"]').click();await page.evaluate(()=>{const w=Blockly.getMainWorkspace();Blockly.Events.fire(new Blockly.Events.Selected(null,window.__boundaryBlocks.body,w.id));});await page.waitForTimeout(100);check((await page.locator('#boundary-marks').textContent()).includes('4 van 4'),'all action blocks marked');await page.screenshot({path:path.join(output,'loop-boundary.png'),fullPage:true});
    await page.evaluate(()=>window.AssessmentApp.flush());const before=await page.evaluate(()=>window.AssessmentApp.getState());
    await page.reload();check(await page.locator('#gate').isVisible(),'reload requires unlock');
    check(await page.locator('#new-attempt').isChecked(),'new attempt is selected by default');await page.locator('#new-attempt').uncheck();
    await page.locator('#student-name').fill('Zoë Testleerling');await page.locator('#student-class').fill('1steam1');await page.locator('#student-number').fill('7');await page.locator('#start-password').fill('Charles');await page.locator('#start-form button').click();
    const restored=await page.evaluate(()=>window.AssessmentApp.getState());assert.equal(restored.attemptId,before.attemptId);assert.deepEqual(restored.answers,before.answers);assert.deepEqual(restored.exercises,before.exercises);
    assert.deepEqual(restored.boundaries,before.boundaries,'question 9 workspace/markings/result resume');
    assert.equal(restored.deadlineAt,before.deadlineAt,'resume keeps the original timer deadline');
    await page.evaluate(()=>{
      const create=window.AssessmentPDF.create;window.__pdfBuilds=0;window.__downloadActivations=[];
      window.AssessmentPDF.create=async(...args)=>{window.__pdfBuilds++;await new Promise(resolve=>setTimeout(resolve,5500));return create(...args);};
      document.addEventListener('click',event=>{if(event.target.matches('a[download]'))window.__downloadActivations.push(navigator.userActivation.isActive);},true);
    });
    await page.locator('#review-top').click();
    check(await page.locator('#export-pdf').isDisabled(),'download waits for PDF preparation');
    check(!(await page.evaluate(()=>window.AssessmentApp.getState().lastExport)),'preparation alone is not recorded as a download');
    await page.screenshot({path:path.join(output,'review.png'),fullPage:true});
    const downloadPromise=page.waitForEvent('download',{timeout:60000});await page.locator('#export-pdf').click();
    const download=await downloadPromise;await download.saveAs(path.join(output,'exam-sample.pdf'));
    assert.deepEqual(await page.evaluate(()=>window.__downloadActivations),[true],'first download click retains user activation despite slow PDF generation');
    assert.equal(await page.evaluate(()=>window.__pdfBuilds),1,'download uses the prepared PDF without rebuilding');
    const repeatDownloadPromise=page.waitForEvent('download');await page.locator('#export-pdf').click();await repeatDownloadPromise;
    assert.equal(await page.evaluate(()=>window.__pdfBuilds),1,'repeat download reuses the current prepared PDF');
    const legacyDownloadPromise=page.waitForEvent('download',{timeout:60000});
    await page.evaluate(()=>window.AssessmentPDF.export(window.AssessmentApp.config,window.AssessmentApp.getState()));
    const legacyDownload=await legacyDownloadPromise;
    assert.equal(legacyDownload.suggestedFilename(),download.suggestedFilename(),'cached legacy caller still exports and downloads the same assessment');
    await page.waitForFunction(()=>window.AssessmentApp.getState().lastExport!==null);
    check((await page.locator('#completion').textContent()).includes('nog niet ingediend'),'download not represented as upload');
    await context.route('https://school.example/toets-upload',route=>route.fulfill({contentType:'text/html',body:'<h1>Upload fixture</h1>'}));
    await page.evaluate(()=>{window.AssessmentApp.config.smartschoolUrl='https://school.example/toets-upload';});
    await page.locator('#review-top').click();
    const pagesBeforeUpload=context.pages().length;
    await page.locator('#smartschool-open').click();await page.waitForURL('https://school.example/toets-upload');
    assert.equal(context.pages().length,pagesBeforeUpload,'Smartschool navigates in the same window without a popup');
    await page.goto(address);await page.locator('#new-attempt').uncheck();await page.locator('#student-name').fill('Zoë Testleerling');await page.locator('#student-class').fill('1steam1');await page.locator('#student-number').fill('7');await page.locator('#start-password').fill('Charles');await page.locator('#start-form button').click();
    assert.equal(await page.evaluate(()=>window.AssessmentApp.getState().attemptId),before.attemptId,'answers persist after leaving for Smartschool');
    // Last edit invalidates export status and classifications.
    await page.locator('.nav-button[data-group="q4"]').click();await page.locator('#code-answer').fill(correct+'\n// Gewijzigd');
    const edited=await page.evaluate(()=>{window.AssessmentApp.flush();return window.AssessmentApp.getState();});check(!edited.lastExport,'edit invalidates exported status');check(edited.exercises['maze-1'].needsReview,'code edit asks marking review');check(edited.exercises['maze-1'].drafts.code.markings.length===0,'stale text ranges cleared');
    await page.locator('.nav-button[data-group="q9"]').click();await page.evaluate(()=>{const w=Blockly.getMainWorkspace(),b=w.newBlock('assessment_maze_turn_left');b.initSvg();b.render();});await page.waitForTimeout(150);check(await page.evaluate(()=>Object.keys(window.AssessmentApp.getState().boundaries.q9.markings).length===0),'changed boundary algorithm clears stale markings');
    await page.evaluate(()=>{window.__originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError');};window.AssessmentApp.flush();});
    check((await page.locator('#save-status').textContent()).includes('mislukt'),'storage failure visible');
    await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem;window.AssessmentApp.flush();});
    for(const viewport of [{width:1280,height:720},{width:768,height:1024},{width:390,height:844}]){await page.setViewportSize(viewport);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page-wide horizontal overflow');}
    const otherVersion=version==='B'?'C':'B',isolationPage=await context.newPage();isolationPage.on('pageerror',e=>errors.push(e.message));
    await isolationPage.goto(address.replace(entry,`test_maze_version_${otherVersion}.html`));await isolationPage.locator('#new-attempt').uncheck();await isolationPage.locator('#student-name').fill('Zoë Testleerling');await isolationPage.locator('#student-class').fill('1steam1');await isolationPage.locator('#student-number').fill('7');await isolationPage.locator('#start-password').fill('Charles');await isolationPage.locator('#start-form button').click();
    const isolated=await isolationPage.evaluate(()=>window.AssessmentApp.getState());assert.equal(isolated.version,otherVersion);assert.notEqual(isolated.attemptId,before.attemptId);assert.ok(isolated.answers.q1.every(answer=>answer===''));assert.equal(isolated.exercises['maze-1'].choice,null);await isolationPage.close();
    await context.close();
    check(errors.length===0,'browser errors: '+errors.join('\n'));
    check(externalRequests.length===0,'unexpected external dependencies: '+externalRequests.join('\n'));
    const fileContext=await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true});
    const filePage=await fileContext.newPage(),fileErrors=[];
    await filePage.clock.install({time:new Date('2026-10-07T10:00:00Z')});
    filePage.on('pageerror',e=>fileErrors.push(e.message));filePage.on('console',message=>{if(message.type()==='error')fileErrors.push(message.text());});
    await filePage.goto(pathToFileURL(path.join(root,entry)).href);
    await filePage.locator('#student-name').fill('Lokale Test');await filePage.locator('#student-class').fill('1steam1');await filePage.locator('#student-number').fill('9');await filePage.locator('#start-password').fill('Charles');await filePage.locator('#start-form button').click();
    await filePage.locator('.nav-button[data-group="q4"]').click();await filePage.locator('[data-branch="code"]').click();await filePage.locator('#code-answer').fill(correct);await filePage.locator('[data-run]').click();
    await filePage.waitForFunction(()=>window.AssessmentApp.getState().exercises['maze-1'].results.code?.status==='reached');
    await filePage.locator('[data-branch="blocks"]').click();
    await filePage.evaluate(()=>{const w=Blockly.getMainWorkspace(),b=w.newBlock('assessment_maze_move_forward');b.initSvg();b.render();});
    await filePage.locator('#review-top').click();
    const fileDownloadPromise=filePage.waitForEvent('download',{timeout:60000});await filePage.locator('#export-pdf').click();const fileDownload=await fileDownloadPromise;await fileDownload.saveAs(path.join(output,'exam-file-sample.pdf'));
    check(fileErrors.length===0,'direct-file errors: '+fileErrors.join('\n'));
    const legacyAttempt=await filePage.evaluate(()=>window.AssessmentApp.getState().attemptId);
    await filePage.addInitScript(({attempt,version})=>{const key=`blockly-assessment:maze-deel-1:${version}:${attempt}`,s=JSON.parse(localStorage.getItem(key));delete s.answers.q8;s.answers.q9=['Oud antwoord'];delete s.boundaries;for(const branch of ['blocks','code'])delete s.exercises['maze-4'].drafts[branch].explanation;localStorage.setItem(key,JSON.stringify(s));},{attempt:legacyAttempt,version});
    await filePage.reload();await filePage.locator('#new-attempt').uncheck();await filePage.locator('#student-name').fill('Lokale Test');await filePage.locator('#student-class').fill('1steam1');await filePage.locator('#student-number').fill('9');await filePage.locator('#start-password').fill('Charles');await filePage.locator('#start-form button').click();
    const migrated=await filePage.evaluate(()=>window.AssessmentApp.getState());assert.equal(migrated.attemptId,legacyAttempt);assert.deepEqual(migrated.answers.q8,['','','']);assert.deepEqual(migrated.answers.q9,['Oud antwoord']);assert.equal(migrated.boundaries.q9.workspace,null);assert.equal(migrated.exercises['maze-4'].drafts.code.explanation,'');assert.equal(migrated.lastExport,null);check(migrated.exercises['maze-1'].drafts.blocks.workspace.blocks.blocks.length>0,'older saved attempt keeps coding answer');
    await filePage.clock.fastForward(40*60*1000);check(await filePage.locator('#timer-warning').isVisible(),'five-minute warning appears');check((await filePage.locator('#timer-warning-message').textContent()).includes('upload'),'five-minute warning asks for upload');
    const warningPulse=await filePage.locator('#exam-timer').evaluate(el=>parseFloat(getComputedStyle(el).animationDuration));await filePage.screenshot({path:path.join(output,'timer-warning.png')});
    await filePage.locator('#dismiss-timer-warning').click();await filePage.clock.fastForward(4*60*1000);check(await filePage.locator('#timer-warning').isHidden(),'warning can be dismissed');const finalPulse=await filePage.locator('#exam-timer').evaluate(el=>parseFloat(getComputedStyle(el).animationDuration));check(finalPulse<warningPulse,'pulse gets faster near zero');
    await filePage.clock.fastForward(61*1000);assert.equal(await filePage.locator('#timer-value').textContent(),'00:00');check(await filePage.locator('#timer-warning').isVisible(),'expiry message appears even after dismissing five-minute warning');
    await filePage.locator('#timer-warning [data-review]').click();await filePage.waitForFunction(()=>!document.getElementById('export-pdf').disabled);check(await filePage.locator('#export-pdf').isEnabled(),'PDF export stays available at zero');await filePage.emulateMedia({reducedMotion:'reduce'});assert.equal(await filePage.locator('#exam-timer').evaluate(el=>getComputedStyle(el).animationName),'none');
    await fileContext.close();
    console.log('PASS: gate, question isolation, branches, bounded execution, markings, autosave/reload, PDF, export invalidation, responsive layout.');
    console.log('Verification artifacts: '+output);
  } finally {await browser.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>server.close());
