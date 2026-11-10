'use strict';
// Run after prepare-github-upload.cjs with Playwright available on NODE_PATH.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const { modelWorkspace } = require('./turtle-blocks-check.cjs');

const root = path.resolve(__dirname, '../output/github-upload/site');
const out = path.resolve(process.env.TURTLE_CHECK_OUTPUT || 'tmp/turtle-blocks-phase1-check');
const prefix = '/Blockly/';
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (!url.pathname.startsWith(prefix)) return response.writeHead(404).end();
  const filename = path.resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)));
  if (!filename.startsWith(root + path.sep)) return response.writeHead(403).end();
  try {
    const bytes = await fs.readFile(filename);
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
    response.end(bytes);
  } catch (_) { response.writeHead(404).end(); }
});

async function unlock(page, resume = false) {
  await page.waitForFunction(() => window.Chapter2App);
  await page.locator('#student-name').fill('Fictieve Turtle leerling');
  await page.locator('#student-class').fill('1STEAM1');
  await page.locator('#student-number').fill('1');
  await page.locator('#start-password').fill(await page.evaluate(() => Chapter2App.config.startPassword));
  if (resume) await page.locator('#new-attempt').uncheck();
  await page.locator('#start-form button[type=submit]').click();
  await page.locator('#exam').waitFor();
}
const pick = (page, id, mode) => page.locator(`[name=mode-${id}][value=${mode}]`).check();
const question = (page, id) => page.locator(`.nav-button[data-go=${id}]`).click();
async function runDrawing(page, id) {
  await page.locator(`[data-run=${id}]`).click();
  await page.locator(`[data-finish-playback=${id}]`).click();
}
async function putBlocks(page, version, taskId) {
  const current = await page.evaluate(() => Chapter2App.config.revision.includes('-v7'));
  await page.evaluate(({taskId, state}) => {
    const workspace = Blockly.common.getAllWorkspaces().find(ws => !ws.isFlyout && ws.getInjectionDiv?.()?.closest('#blocks-' + taskId));
    if (!workspace) throw new Error('Workspace was not mounted');
    Blockly.serialization.workspaces.load(state, workspace);
  }, {taskId, state: modelWorkspace(version, taskId, current)});
  await page.waitForFunction(taskId => Chapter2App.getState().answers[taskId].blocks?.blocks?.blocks.length === 1, taskId);
}

async function checkPlayback(page, version) {
  for (const reducedMotion of version === 'A' ? ['no-preference', 'reduce'] : ['reduce']) {
    await page.emulateMedia({reducedMotion});
    const steps = await page.evaluate(async () => {
      const canvas = document.querySelector('#output-q3c');
      const status = document.querySelector('#result-q3c');
      document.querySelector('[data-run=q3c]').click();
      const initial = canvas.toDataURL();
      await new Promise(resolve => setTimeout(resolve, 120));
      const firstStepPending = canvas.toDataURL() === initial && status.dataset.status === 'running';
      await new Promise(resolve => setTimeout(resolve, 470));
      return {firstStepPending, firstStepDrawn: canvas.toDataURL() !== initial, status: status.dataset.status};
    });
    assert.deepEqual(steps, {firstStepPending:true, firstStepDrawn:true, status:'running'});
    if (version === 'A') await page.locator('#output-q3c').screenshot({path:path.join(out,`playback-${reducedMotion}.png`)});
    await page.locator('[data-finish-playback=q3c]').press('Enter');
    assert.match(await page.locator('#result-q3c').textContent(), /15 getekende lijnstukken/);
  }
}

async function formalFixtures(page, origin) {
  await page.goto(origin + prefix + 'evaluations/chapter-2/blocks-assessment.html');
  await page.getByRole('link', {name:'Open de toets met blokkenkeuze'}).click();
  await unlock(page);
  assert.equal(await page.evaluate(() => Chapter2App.config.revision), '20261110-turtle-v7');
  assert.equal(await page.locator('#gate p.callout').count(), 1);
  await question(page, 'q3');
  async function download(name) {
    await page.locator('#review-top').click();
    const event = page.waitForEvent('download');
    await page.locator('#export-pdf').click();
    await (await event).saveAs(path.join(out, 'formal-' + name + '.pdf'));
    assert.equal(await page.locator('#completion .smartschool-link').count(), 1);
    await question(page, 'q3');
  }
  await download('blank');
  const ids = ['q3a','q3b','q3c'];
  for (const id of ids) {
    await pick(page,id,'blocks');
    await putBlocks(page,'C',id);
    const code=await page.evaluate(task=>Chapter2Blocks.inspect(Chapter2App.getState().answers[task].blocks).source,id);
    await pick(page,id,'code');
    await page.locator('#'+id).fill(code);
  }
  for (let bits = 0; bits < 8; bits++) {
    const choices = ids.map((_, index) => (bits & (1 << index)) ? 'blocks' : 'code');
    for (const [index, id] of ids.entries()) await pick(page,id,choices[index]);
    await download(choices.join('-'));
  }
  console.log('PASS formal C: graded browser PDF for all eight mode combinations and an unanswered attempt.');
}

async function main() {
  await fs.mkdir(out, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  try {
    for (const [index, version] of Array.from('ABC').entries()) {
      const width = version === 'B' ? 390 : 1366;
      const context = await browser.newContext({ viewport: {width,height:900}, reducedMotion: 'reduce', acceptDownloads: true });
      const failures = [];
      await context.route('http*/**', route => {
        if (new URL(route.request().url()).origin === origin) return route.continue();
        failures.push(route.request().url());
        return route.abort();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      page.on('pageerror', error => failures.push(error.message));
      page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
      const entry = `evaluations/chapter-2/versions/${version}/index.html`;
      const student = origin + prefix + entry;
      const legacy = student + '?legacy=v5';
      await page.goto(legacy);
      await page.locator('#new-attempt').check();
      await unlock(page);
      const legacyId = await page.evaluate(() => Chapter2App.getState().attemptId);
      await page.locator('#q1').fill('for (var i = 0; i < 4; i++) {}');
      await question(page,'q3');
      assert.equal(await page.locator('[data-answer-mode]').count(), 0);
      await page.locator('#q3a').fill('moveForward(20);');
      await question(page,'q1');
      const v6 = student + '?legacy=v6' + (version === 'C' ? '&practice=blocks' : '');
      await page.goto(v6);
      await page.locator('#new-attempt').check();
      await unlock(page);
      const v6Id = await page.evaluate(() => Chapter2App.getState().attemptId);
      assert.equal(await page.evaluate(() => Chapter2App.config.totalPoints), 23);
      await page.locator('#q1').fill('for (var i = 0; i < 6; i++) {}');
      await page.evaluate(() => Chapter2App.flush());
      await page.goto(origin + prefix + 'evaluations/chapter-2/blocks-practice.html');
      await page.getByRole('link',{name:'Oefenversie '+version}).click();
      await unlock(page);
      if (version !== 'C') assert.equal(page.url(), student);
      assert.match(await page.title(), /Oefenversie/);
      assert.equal(await page.evaluate(() => Chapter2App.config.practice), 'blocks');
      assert.equal(await page.locator('#gate p.callout').count(), 0);
      assert.doesNotMatch(await page.locator('#gate').textContent(), /Begrensde herhaling · start/);
      assert.notEqual(await page.evaluate(() => Chapter2App.getState().attemptId), legacyId);
      await question(page,'q2');
      assert.match(await page.locator('.instructions').textContent(), /tel hoeveel rechte lijnstukken worden getekend\./);
      assert.doesNotMatch(await page.locator('.trace-count').first().textContent(), /met de pen omlaag/);
      for (const group of ['q4','q6','q7']) {
        await question(page,group);
        const gaps = await page.locator('.turtle-field').evaluateAll(fields => fields.map(field => {
          const label=field.querySelector('label'),input=field.querySelector('textarea');
          return [input.id === label.htmlFor, input.getBoundingClientRect().top - label.getBoundingClientRect().bottom];
        }));
        assert.ok(gaps.length && gaps.every(([paired,gap]) => paired && gap >= 0 && gap <= 6));
      }
      await page.locator('.turtle-fields').screenshot({path:path.join(out,`labels-${version}.png`)});
      await question(page,'q3');
      assert.match(await page.locator('h1:visible').textContent(), /Van figuur naar programma/);
      assert.equal(await page.locator('.instructions').count(), 0);
      assert.equal(await page.locator('[data-answer-mode]').count(), 6);
      assert.deepEqual(await page.locator('.turtle-task').first().locator('li').allTextContents(), ['Teken twee losse vierkanten.', 'Elke zijde is 50 pixels.']);
      const titles = {A:/Drie sterren op een rij/,B:/Drie sterren in een driehoek/,C:/Drie vijfhoeken in een driehoek/};
      assert.match(await page.locator('.turtle-task').last().locator('h2').textContent(), titles[version]);
      await page.locator('[name=mode-q3a][value=blocks]').focus();
      await page.keyboard.press('Space');
      assert.equal(await page.locator('[name=mode-q3a][value=blocks]').isChecked(), true);
      assert.equal(await page.locator('[name=mode-q3a][value=blocks]').evaluate(el => document.activeElement === el), true);
      if (index === 0) {
        const host = page.locator('#blocks-q3a');
        await host.locator('.blocklyToolboxCategory').filter({hasText:'Turtle'}).click();
        const flyout = host.locator('.blocklyFlyout .blocklyDraggable').first();
        const block = await flyout.boundingBox();
        const area = await host.boundingBox();
        assert.ok(block && area);
        await page.mouse.move(block.x + block.width / 2, block.y + block.height / 2);
        await page.mouse.down();
        await page.mouse.move(area.x + area.width - 120, area.y + 85, {steps:12});
        await page.mouse.up();
        await page.waitForFunction(() => Chapter2App.getState().answers.q3a.blocks?.blocks.blocks.length > 0);
      }
      await putBlocks(page,version,'q3a');
      await runDrawing(page,'q3a');
      assert.match(await page.locator('#result-q3a').textContent(), /8 getekende lijnstukken/);
      await page.evaluate(() => {
        const ws = Blockly.common.getAllWorkspaces().find(ws => !ws.isFlyout && ws.getInjectionDiv?.()?.closest('#blocks-q3a'));
        const distance = ws.getAllBlocks(false).find(block => block.type === 'turtle_forward').getInputTargetBlock('DISTANCE');
        distance.setFieldValue(42, 'NUM');
      });
      await page.waitForFunction(() => document.querySelector('#result-q3a').dataset.status === 'stale');
      await putBlocks(page,version,'q3a');
      await pick(page,'q3a','code');
      await page.locator('#q3a').fill('moveForward(999); // DRAFT_ONLY');
      await pick(page,'q3a','blocks');
      assert.ok(await page.locator('#blocks-q3a .blocklySvg').isVisible());
      await runDrawing(page,'q3a');
      assert.match(await page.locator('#result-q3a').textContent(), /8 getekende lijnstukken/);
      await pick(page,'q3b','code');
      const side = {A:20,B:25,C:30}[version];
      const code = `for (var figuur = 0; figuur < 4; figuur++) {\n  for (var zijde = 0; zijde < 6; zijde++) { moveForward(${side}); turnRight(60); }\n  penUp(); moveForward(100); turnRight(90); penDown();\n}`;
      await page.locator('#q3b').fill(code);
      await runDrawing(page,'q3b');
      assert.match(await page.locator('#result-q3b').textContent(), /24 getekende lijnstukken/);
      await pick(page,'q3c','blocks');
      await putBlocks(page,version,'q3c');
      await checkPlayback(page,version);
      await page.locator('#target-q3c').screenshot({path:path.join(out,`q3c-${version}.png`)});
      await page.evaluate(() => Chapter2App.flush());
      if (version === 'C') await page.reload();
      else await page.goto(student + '?practice=blocks');
      await unlock(page,true);
      await question(page,'q3');
      assert.equal(await page.locator('#q3b').inputValue(), code);
      assert.match(await page.locator('#result-q3a').textContent(), /8 getekende lijnstukken/);
      assert.match(await page.locator('#result-q3b').textContent(), /24 getekende lijnstukken/);
      assert.match(await page.locator('#result-q3c').textContent(), /15 getekende lijnstukken/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('.turtle-task').first().screenshot({path:path.join(out,`q3a-${version}.png`)});
      if (version !== 'C') {
        await page.locator('[data-next=q4]').click();
        const dialog = page.getByRole('dialog');
        assert.match(await dialog.locator('#practice-title').textContent(), /Blokken/);
        await dialog.locator('[data-choose]').first().click();
        assert.match(await dialog.textContent(), /1,25 punten/);
        await dialog.locator('[data-practice-next]').click();
        assert.match(await dialog.locator('#practice-title').textContent(), /JavaScript/);
        await dialog.locator('[data-choose]').first().click();
        await dialog.locator('[data-practice-next]').click();
        assert.match(await dialog.locator('#practice-title').textContent(), /3c.*Blokken/);
        await page.keyboard.press('Escape');
      }
      await page.locator('#review-top').click();
      assert.match(await page.locator('.turtle-choice-summary').textContent(), /23 \/ 25,5/);
      for (const item of await page.locator('.turtle-choice-summary li').allTextContents()) {
        assert.match(item, /Blokken max\. 1,25 · JavaScript max\. 2,5/);
      }
      const downloaded = page.waitForEvent('download');
      await page.locator('#export-pdf').click();
      await (await downloaded).saveAs(path.join(out,`mixed-${version}.pdf`));
      assert.equal(await page.locator('#completion .smartschool-link').count(), 0);
      const mixed = await page.evaluate(async () => (await Chapter2App.exportPDF()).payload);
      assert.equal(mixed.schemaVersion, 2);
      assert.equal(mixed.practice, 'blocks');
      assert.match(mixed.configSha256, /^[0-9a-f]{64}$/);
      assert.equal(mixed.answers.q3a.mode, 'blocks');
      assert.equal(mixed.answers.q3a.workspace.format, 'blockly-json-v1');
      assert.equal(mixed.answers.q3a.execution.status, 'ok');
      assert.equal(mixed.answers.q3b.mode, 'code');
      assert.equal(mixed.answers.q3b.code, code);
      assert.equal(mixed.answers.q3c.mode, 'blocks');
      assert.equal(mixed.answers.q3c.execution.status, 'ok');
      assert.equal(JSON.stringify(mixed).includes('DRAFT_ONLY'), false);
      assert.equal('workspace' in mixed.answers.q3b, false);
      assert.ok(mixed.evidence['q3a-mode'] && mixed.evidence.q3a);
      await question(page,'q3');
      await pick(page,'q3b','blocks');
      assert.equal(await page.evaluate(async () => (await Chapter2App.exportPDF()).payload.answers.q3b.blank), true);
      await putBlocks(page,version,'q3b');
      await runDrawing(page,'q3b');
      assert.match(await page.locator('#result-q3b').textContent(), /24 getekende lijnstukken/);
      await page.locator('#review-top').click();
      assert.match(await page.locator('.turtle-choice-summary').textContent(), /21,75 \/ 25,5/);
      const bothDownload = page.waitForEvent('download');
      await page.locator('#export-pdf').click();
      await (await bothDownload).saveAs(path.join(out,`blocks-${version}.pdf`));
      await question(page,'q3');
      await page.evaluate(() => { Chapter2App.getState().expiresAt=Date.now()-1; Chapter2App.updateTimer(); });
      await question(page,'q3');
      assert.equal(await page.locator('[name=mode-q3a][value=blocks]').isDisabled(), true);
      assert.equal(await page.locator('#blocks-q3a .blocklyToolboxDiv').count(), 0);
      await page.goto(student + '?practice=blocks');
      await page.waitForFunction(() => window.Chapter2App);
      await page.locator('#legacy-v6-link').click();
      await unlock(page,true);
      assert.equal(await page.evaluate(() => Chapter2App.getState().attemptId), v6Id);
      assert.equal(await page.locator('#q1').inputValue(), 'for (var i = 0; i < 6; i++) {}');
      await page.goto(student);
      {
        const link = page.getByRole('link', {name:'Hervat een oudere JavaScript-poging (v5)'});
        await page.waitForFunction(() => window.Chapter2App);
        await link.focus();
        await page.locator('.gate-card').screenshot({path:path.join(out,`start-${version}.png`)});
        await Promise.all([page.waitForURL(legacy), page.keyboard.press('Enter')]);
        await page.waitForFunction(() => window.Chapter2App);
        assert.equal(await page.locator('#new-attempt').isChecked(), false);
      }
      await unlock(page,true);
      assert.equal(await page.evaluate(() => Chapter2App.getState().attemptId), legacyId);
      assert.equal(await page.locator('#q1').inputValue(), 'for (var i = 0; i < 4; i++) {}');
      const old = await page.evaluate(async () => {
        const {payload,blob} = await Chapter2App.exportPDF();
        window.legacyFixtureUrl = URL.createObjectURL(blob);
        return payload;
      });
      assert.equal(old.schemaVersion, 1);
      assert.equal(old.revision, '20261105-turtle-v5');
      assert.equal(old.answers.q3a, 'moveForward(20);');
      assert.equal(await page.evaluate(() => typeof Blockly), 'undefined');
      if (version === 'C') {
        const legacyDownload = page.waitForEvent('download');
        await page.evaluate(() => {
          const link = document.createElement('a');link.href=legacyFixtureUrl;link.download='legacy-C.pdf';link.click();
        });
        await (await legacyDownload).saveAs(path.join(out,'legacy-C.pdf'));
        await formalFixtures(page, origin);
      }
      await page.goto(pathToFileURL(path.join(root,entry)).href+(version === 'C' ? '?practice=blocks' : ''));
      await unlock(page);
      await question(page,'q3');
      await pick(page,'q3a','blocks');
      await putBlocks(page,version,'q3a');
      await runDrawing(page,'q3a');
      assert.match(await page.locator('#result-q3a').textContent(), /8 getekende lijnstukken/);
      assert.deepEqual(failures, []);
      console.log(`PASS Turtle ${version}: current/legacy routes, label spacing, Q3c preview and PDF, draft recovery and timer lock (${width}px).`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}
main().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
