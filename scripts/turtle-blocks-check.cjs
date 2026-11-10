'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');

const root = path.resolve(__dirname, '..');
function configFor(version) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, `evaluations/chapter-2/versions/${version}/config.js`), 'utf8'), context);
  return context.window.ASSESSMENT_CONFIG;
}
async function currentConfigFor(version, delivery = 'assessment') {
  const context = { window: {}, crypto: webcrypto, TextEncoder };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'evaluations/chapter-2/turtle-answer-modes.js'), 'utf8'), context);
  return context.window.Chapter2AnswerModes.prepare(configFor(version), delivery);
}
const number = value => ({ type: 'math_number', fields: { NUM: value } });
const shadow = value => ({ shadow: number(value) });
const movement = (type, input, value) => ({ type: 'turtle_' + type, inputs: { [input]: shadow(value) } });
const forward = value => movement('forward', 'DISTANCE', value);
const turn = (direction, value) => movement(direction, 'ANGLE', value);
const pen = direction => ({ type: 'turtle_pen_' + direction });
const chain = (...blocks) => blocks.reduceRight((next, block) => next ? { ...block, next: { block: next } } : block, null);
const loop = (id, from, to, body, step = 1) => ({
  type: 'controls_for', fields: { VAR: { id } },
  inputs: { FROM: shadow(from), TO: shadow(to), BY: shadow(step), DO: { block: body } },
});
const state = (blocks, variables = []) => ({ blocks: { languageVersion: 0, blocks }, ...(variables.length ? { variables } : {}) });
const vars = (...names) => names.map(name => ({ id: name, name }));

function modelWorkspace(version, taskId, current = false) {
  if (taskId === 'q3b') {
    const side = { A: 20, B: 25, C: 30 }[version];
    const body = chain(loop('zijde', 0, 5, chain(forward(side), turn('right', 60))),
      pen('up'), forward(100), turn('right', 90), pen('down'));
    return state([loop('zeshoek', 0, 3, body)], vars('zijde', 'zeshoek'));
  }
  if (taskId === 'q3c') {
    const side = version === 'C' ? 32 : 45;
    const angle = version === 'C' ? 72 : 144;
    const figure = () => loop('zijde', 0, 4, chain(forward(side), turn('right', angle)));
    const distance = version === 'A' ? 100 : 120;
    const right = () => [pen('up'), turn('right', 90), forward(distance), turn('left', 90), pen('down')];
    const diagonal = [pen('up'), turn('left', 30), forward(120), turn('right', 30), pen('down')];
    return state([chain(figure(), ...right(), figure(), ...(version === 'A' ? right() : diagonal), figure())], vars('zijde'));
  }
  const side = current ? 50 : { A: 50, B: 60, C: 40 }[version];
  const direction = version === 'B' ? 'left' : 'right';
  const back = version === 'B' ? 'right' : 'left';
  const square = () => loop('zijde', 0, 3, chain(forward(side), turn(direction, 90)));
  return state([chain(square(), pen('up'), turn(direction, 90), forward(side * 1.5), turn(back, 90), pen('down'), square())], vars('zijde'));
}

function assertGeometry(actual, expected) {
  assert.equal(actual.length, expected.length);
  for (const [index, segment] of actual.entries()) {
    for (const axis of ['x1', 'y1', 'x2', 'y2']) {
      assert.ok(Math.abs(segment[axis] - expected[index][axis]) < 1e-7, `Segment ${index} ${axis}`);
    }
  }
}

async function main() {
  const Blockly = require('../assessment/vendor/blockly/blockly_compressed.js');
  require('../assessment/vendor/blockly/blocks_compressed.js');
  Blockly.setLocale(require('../assessment/vendor/blockly/nl.js'));
  global.Chapter2Turtle = require('../evaluations/chapter-2/turtle-engine.js');
  const adapter = require('../evaluations/chapter-2/turtle-blocks.js');
  adapter.install(Blockly);
  for (const version of 'ABC') {
    const configs = [configFor(version), await currentConfigFor(version)];
    for (const [index, config] of configs.entries()) for (const task of config.groups.find(group => group.id === 'q3').tasks) {
      const workspace = new Blockly.Workspace();
      const model = modelWorkspace(version, task.id, Boolean(index));
      assertGeometry(adapter.run(model).segments, task.figure.segments);
      // The headless Node Blockly build has no XML DOM for storing shadows.
      const explicitNumbers = JSON.parse(JSON.stringify(model), (_key, value) => value?.shadow ? { block: value.shadow } : value);
      Blockly.serialization.workspaces.load(explicitNumbers, workspace);
      const saved = Blockly.serialization.workspaces.save(workspace);
      const result = adapter.run(saved);
      assert.equal(result.status, 'ok', result.message);
      assertGeometry(result.segments, task.figure.segments);
      assertGeometry(Chapter2Turtle.run(adapter.inspect(saved).source).segments, task.figure.segments);
      assert.match(adapter.inspect(saved).lines.join('\n'), /tot en met/);
      workspace.dispose();
    }
  }
  const variable = { type: 'variables_get', fields: { VAR: { id: 'afstand' } } };
  const useVariable = { type: 'turtle_forward', inputs: { DISTANCE: { block: variable } } };
  const descending = adapter.run(state([loop('afstand', 6, 2, useVariable, 2)], vars('afstand')));
  assert.equal(descending.status, 'ok');
  assert.deepEqual(descending.actions.map(action => action.args[0]), [6, 4, 2]);

  const disconnected = adapter.inspect(state([forward(5), turn('right', 90)]));
  assert.equal(disconnected.status, 'invalid');
  assert.deepEqual(disconnected.lines, ['Reeks 1', 'ga vooruit 5', 'Reeks 2', 'draai rechts 90']);
  const unfinished = adapter.inspect(state([{ type: 'turtle_forward' }]));
  assert.equal(unfinished.status, 'invalid');
  assert.deepEqual(unfinished.lines, ['ga vooruit ?']);
  for (const invalid of [
    state([{ type: 'text_print' }]),
    state([{ ...forward(5), extraState: { unexpected: true } }]),
    state([loop('i', 0, 5, forward(10), 0)], vars('i')),
    state([loop('i', 0, 5, forward(10), -1)], vars('i')),
    state([loop('i', 0, 2, loop('i', 0, 3, forward(10)))], vars('i')),
    state([forward(1), { ...forward(2), id: 'constructor' }]),
    { ...state([forward(3)]), padding: 'x'.repeat(41000) },
    state([chain(...Array.from({ length: 68 }, () => forward(1)))]),
  ]) assert.equal(adapter.run(invalid).status, 'invalid');
  assert.equal(adapter.inspect(null).status, 'empty');
  assert.notEqual(adapter.run(state([loop('i', 0, 100000, pen('down'))], vars('i'))).status, 'ok');
  console.log('PASS Turtle blocks and JavaScript: legacy and current target figures, Blockly serialization, nesting, variables and invalid/limited evidence.');
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { configFor, currentConfigFor, modelWorkspace };
