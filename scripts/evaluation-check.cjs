/* Check development inventory bindings. Does not certify unbuilt exams or run grading. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function resolve(relative, directory = false) {
  assert.equal(typeof relative, 'string', 'Expected a repository-relative path');
  assert.ok(relative && !path.isAbsolute(relative), `Invalid path: ${relative}`);
  const absolute = path.resolve(root, relative);
  assert.ok(absolute.startsWith(root + path.sep), `Path escapes repository: ${relative}`);
  const real = fs.realpathSync(absolute);
  assert.ok(real.startsWith(root + path.sep), `Symlink escapes repository: ${relative}`);
  assert.ok(directory ? fs.statSync(real).isDirectory() : fs.statSync(real).isFile(), relative);
  return real;
}
const readJson = relative => JSON.parse(fs.readFileSync(resolve(relative), 'utf8'));
const catalog = readJson('evaluations/catalog.json');
assert.equal(catalog.schemaVersion, 1);
assert.ok(Array.isArray(catalog.chapters) && catalog.chapters.length > 0);
assert.equal(new Set(catalog.chapters).size, catalog.chapters.length, 'Duplicate manifest');
const ids = new Set(), chapters = new Set(), entries = new Set(), rubrics = new Set();
const favicon = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/<link\b[^>]*rel="icon"[^>]*>/)?.[0];
assert.ok(favicon, 'Main site favicon missing');
const iconHref = favicon.match(/href="([^"]+)"/)?.[1];
assert.ok(iconHref, 'Main site favicon href missing');
const iconPath = resolve(iconHref.split('?')[0]);
const iconBytes = fs.readFileSync(iconPath);
assert.equal(iconBytes.subarray(1, 4).toString(), 'PNG');
assert.equal(iconBytes.readUInt32BE(16), 64);
assert.equal(iconBytes.readUInt32BE(20), 64);

for (const manifest of catalog.chapters) {
  const chapter = readJson(manifest);
  assert.equal(chapter.schemaVersion, 1);
  assert.ok(Number.isInteger(chapter.chapter) && chapter.chapter > 0);
  assert.ok(!chapters.has(chapter.chapter), 'Duplicate chapter');
  chapters.add(chapter.chapter);
  assert.ok(typeof chapter.examId === 'string' && chapter.examId.length > 0);
  assert.ok(!ids.has(chapter.examId), 'Exam IDs must isolate saved answers');
  ids.add(chapter.examId);
  assert.ok(['available', 'awaiting-source', 'in-development'].includes(chapter.status));
  assert.deepEqual(chapter.variants.map(v => v.version).sort(), ['A', 'B', 'C']);
  if (chapter.sourceDirectory) resolve(chapter.sourceDirectory, true);
  if (chapter.sourcePdf != null) resolve(chapter.sourcePdf);
  if (chapter.status === 'awaiting-source') {
    assert.equal(chapter.sourcePdf, null);
    assert.equal(chapter.totalPoints, null, 'Do not invent point totals before source review');
    assert.equal(chapter.durationMinutes, null, 'Do not invent duration before source review');
  }
  for (const variant of chapter.variants) {
    assert.ok(['available', 'awaiting-source', 'in-development'].includes(variant.status));
    if (chapter.status === 'awaiting-source') assert.equal(variant.status, 'awaiting-source');
    if (variant.directory) resolve(variant.directory, true);
    let config;
    if (variant.status === 'available') {
      const entryPath = resolve(variant.entry);
      assert.ok(!entries.has(entryPath), 'Variants must have separate entry pages');
      entries.add(entryPath);
      const context = {window: {}};
      vm.runInNewContext(fs.readFileSync(resolve(variant.config), 'utf8'), context, {timeout: 1000});
      config = context.window.ASSESSMENT_CONFIG;
      assert.equal(config.id, chapter.examId);
      assert.equal(config.version, variant.version);
      const html = fs.readFileSync(entryPath, 'utf8');
      const icon = html.match(/<link\b[^>]*rel="icon"[^>]*>/)?.[0] || '';
      const href = icon.match(/href="([^"]+)"/)?.[1];
      assert.ok(href, 'Assessment favicon missing');
      assert.equal(path.resolve(path.dirname(entryPath), href.split('?')[0]), iconPath);
      assert.equal(href.split('?')[1], iconHref.split('?')[1], 'Use the site favicon cache version');
      assert.ok(icon.includes('type="image/png"') && icon.includes('sizes="64x64"'));
    } else {
      assert.equal(variant.entry, null, 'Pending track must not expose a runnable exam');
      assert.equal(variant.config, null);
    }
    const grading = variant.grading;
    assert.ok(['available', 'not-implemented', 'not-requested', 'awaiting-source', 'in-development'].includes(grading.status));
    if (grading.directory) resolve(grading.directory, true);
    if (grading.status === 'available') {
      assert.ok(config, 'Grading requires an available exam');
      const rubricPath = resolve(grading.rubric);
      assert.ok(!rubrics.has(rubricPath), 'Do not reuse another variant rubric');
      rubrics.add(rubricPath);
      const rubric = readJson(grading.rubric);
      assert.equal(rubric.id, grading.rubricId);
      assert.equal(rubric.version, variant.version);
      assert.equal(rubric.exam_revision, config.revision);
      assert.equal(rubric.total, config.totalPoints);
      if (chapter.chapter === 1 && variant.version !== 'C') {
        assert.equal(rubric.examId, chapter.examId);
        assert.equal(rubric.configSha256, require('node:crypto').createHash('sha256')
          .update(fs.readFileSync(resolve(variant.config))).digest('hex'),
          'Maze A/B keys must match the exact variant configuration');
      }
      assert.ok(Math.abs(rubric.criteria.reduce((sum, criterion) => sum + criterion.max, 0) - rubric.total) < 1e-8);
      if (grading.scoringPolicy) resolve(grading.scoringPolicy);
    } else {
      assert.equal(grading.rubric, null, 'Pending grading must not reuse the chapter-1 C key');
    }
  }
  console.log(`PASS chapter ${chapter.chapter}: ${chapter.status}; A/B/C bindings and grading status consistent.`);
}
console.log('PASS inventory integrity, distinct exam IDs, favicon and grading bindings. Unimplemented grading tracks have no rubric binding.');
