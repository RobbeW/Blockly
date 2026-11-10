#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../teacher.html', import.meta.url), 'utf8');
const helperSource = source.match(/function strokeSignature[\s\S]*?function finishActiveStroke/)[0].replace(/function finishActiveStroke[\s\S]*/, '');
const helpers = new Function(`${helperSource}; return {normalizeStrokes, mergeStrokes, mergeStrokeSnapshots};`)();
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
const baseStroke = { ...three[0], id: 'base' };
const remoteStroke = { ...one[0], id: 'remote' };
assert.deepEqual(helpers.mergeStrokeSnapshots([baseStroke], [], [baseStroke, remoteStroke]).map(item => item.id),
  ['remote'], 'clearing a known stroke must preserve new strokes from another tab');
for (const marker of [
  'finishActiveStroke();', 'loadedAnnotationPage !== currentPage', 'storeAnnotationAtomic',
  'annotationWriteDepth', 'if (annotationWriteDepth) return;'
]) assert.ok(source.includes(marker), `missing production guard: ${marker}`);

const classRecord = { id: 'class-a', name: 'Fictieve klas' };
const annotations = [{ classId: 'class-a', strokes: [legacy] }, { classId: 'class-b', strokes: [legacy] }];
const calls = [];
let downloaded;
const exportSource = source.slice(source.indexOf('function exportFilename'), source.indexOf('async function importBackup'));
const exported = await vm.runInNewContext(`${exportSource}\nexportActiveClass()`, {
  activeClass: classRecord,
  changingClass: false,
  saveButton: {},
  exportButton: {},
  importButton: {},
  async persistAnnotations() { calls.push('save annotations'); return true; },
  async persistCurrentClass() { calls.push('save class'); return true; },
  async storeGet(store, id) {
    assert.equal(store, 'classes');
    assert.equal(id, classRecord.id);
    return classRecord;
  },
  db: {
    transaction(store, mode) {
      assert.equal(store, 'annotations');
      assert.equal(mode, 'readonly');
      return { objectStore: () => ({
        index(field) {
          assert.equal(field, 'classId');
          return { getAll(id) {
            calls.push('read annotations');
            return annotations.filter(note => note.classId === id);
          } };
        }
      }) };
    }
  },
  requestResult: value => Promise.resolve(value),
  cloneValue: structuredClone,
  Blob,
  URL: { createObjectURL(blob) { downloaded = blob; return 'blob:fixture'; }, revokeObjectURL() {} },
  document: { createElement: () => ({ click() {}, remove() {} }), body: { append() {} } },
  window: { setTimeout(callback) { callback(); } },
  showToast() {},
  updateBackupButtons() {},
  console,
});
assert.equal(exported, true);
assert.deepEqual(calls, ['save annotations', 'save class', 'read annotations']);
const backup = JSON.parse(await downloaded.text());
assert.equal(backup.format, 'aik-teacher-boardbook');
assert.deepEqual(backup.classes, [classRecord]);
assert.deepEqual(backup.annotations, [annotations[0]], 'export includes the active class only');
console.log('teacher pen persistence check passed: stroke merge and active-class backup behavior verified');
