#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../teacher.html', import.meta.url), 'utf8');
const helperSource = source.match(/function strokeSignature[\s\S]*?function finishActiveStroke/)[0].replace(/function finishActiveStroke[\s\S]*/, '');
const helpers = new Function(`${helperSource}; return {normalizeStrokes, mergeStrokes};`)();
const stroke = (points) => ({ tool: 'pen', color: '#000', width: 3, points });
const legacy = stroke([{ x: 0, y: 0, p: .5 }]);
const first = helpers.normalizeStrokes([legacy, legacy]);
const second = helpers.normalizeStrokes([legacy, legacy]);
assert.deepEqual(first.map((item) => item.id), second.map((item) => item.id), 'legacy IDs must be deterministic across tabs');
const legacyMerged = helpers.mergeStrokes([legacy, stroke([{ x: 9, y: 9 }])], [first[0], { ...stroke([{ x: 8, y: 8 }]), id: 'new-stale' }]);
assert.equal(legacyMerged.filter((item) => JSON.stringify(item.points) === JSON.stringify(legacy.points)).length, 1, 'raw legacy and normalized legacy stroke must merge once');
assert.equal(legacyMerged.length, 3, 'raw/normalized conflict merge must retain unique strokes from both tabs');
const three = [stroke([{ x: 1 }]), stroke([{ x: 2 }]), stroke([{ x: 3 }])];
const one = [stroke([{ x: 4 }])];
const merged = helpers.mergeStrokes(three.map((item, i) => ({ ...item, id: `a${i}` })), [{ ...one[0], id: 'b0' }]);
assert.equal(merged.length, 4, 'stale 3+1 writers must retain four strokes');
assert.deepEqual(helpers.mergeStrokes(three, []), helpers.normalizeStrokes(three), 'non-conflict replacement can preserve an ordinary snapshot');
assert.deepEqual(helpers.mergeStrokes([], []), [], 'clear snapshot remains empty when there is no conflict');
for (const marker of [
  'finishActiveStroke();', 'loadedAnnotationPage !== currentPage', 'storeAnnotationAtomic',
  "format: 'aik-teacher-boardbook'", "annotations: await storeGetAll('annotations')",
  'annotationWriteDepth', 'else currentStrokes = mergeStrokes(next.strokes, currentStrokes)',
  'if (annotationWriteDepth) return;'
]) assert.ok(source.includes(marker), `missing production guard: ${marker}`);
console.log('teacher pen persistence check passed: production helpers semantic; active/load/write-gate/export checks structural');
