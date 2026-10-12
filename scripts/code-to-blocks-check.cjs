/* Safe, focused checks for the restricted JavaScript-to-Blockly converter. */
const assert = require('node:assert/strict');
const {convert} = require('../assessment/code-to-blocks.js');

function walk(workspace) {
  const found = [];
  function visit(block) {
    if (!block || typeof block !== 'object') return;
    found.push(block);
    for (const input of Object.values(block.inputs || {})) if (input.block) visit(input.block);
    if (block.next?.block) visit(block.next.block);
  }
  for (const block of workspace.blocks.blocks) visit(block);
  return found;
}
function count(workspace, type) { return walk(workspace).filter(block => block.type === type).length; }
function rejected(source, messagePart) {
  assert.throws(() => convert(source), error => error.name === 'SyntaxError' && error.message.includes(messagePart) && /regel \d+/.test(error.message), source);
}

const nested = convert(`// nested control flow
while (notDone()) {
  if (isPathForward() && (isPathLeft() || !isPathRight())) {
    moveForward()
    if (!false) turnLeft(); else turnRight()
  } else if (true) {
    while (isPathAhead()) moveForward()
  } else {
    turnRight()
  }
}`);
assert.equal(count(nested, 'controls_whileUntil'), 2);
assert.equal(count(nested, 'controls_if'), 2);
assert.equal(count(nested, 'logic_operation'), 2);
assert.equal(count(nested, 'logic_negate'), 2);
assert.equal(count(nested, 'logic_boolean'), 2);
assert.equal(count(nested, 'assessment_maze_move_forward'), 2);
assert.equal(count(nested, 'assessment_maze_turn_left'), 1);
assert.equal(count(nested, 'assessment_maze_turn_right'), 2);
assert.equal(count(nested, 'assessment_maze_path_ahead'), 2, 'Forward and Ahead aliases map to one block type');
const controlsIf = walk(nested).find(block => block.type === 'controls_if');
assert.deepEqual(controlsIf.extraState, {elseIfCount: 1, hasElse: true});
assert.equal(nested.blocks.languageVersion, 0);
assert.equal(new Set(walk(nested).map(block => block.id)).size, walk(nested).length, 'serialized block ids are unique');
assert.deepEqual(convert('moveForward();\nturnLeft()'), convert('moveForward();\nturnLeft()'), 'ids and coordinates are deterministic');
assert.deepEqual(convert('// only a comment\n/* and another */').blocks.blocks, []);
const sequence=convert('{ moveForward(); } turnLeft(); while (notDone()) { moveForward(); }');
assert.equal(sequence.blocks.blocks.length,1,'top-level statements remain one ordered program');
assert.equal(sequence.blocks.blocks[0].next.block.type,'assessment_maze_turn_left');
assert.equal(sequence.blocks.blocks[0].next.block.next.block.type,'controls_whileUntil');
assert.equal(convert('if (true) {}').blocks.blocks[0].inputs.DO, undefined, 'empty statements omit missing serialized inputs');

rejected('moveForward();\nrunAnything();', "Instructie 'runAnything' wordt niet ondersteund");
rejected('if (isPathLeft()) { moveForward();', "'}' ontbreekt");
rejected('moveForward(1);', "Teken '1' wordt niet ondersteund");
rejected('moveForward() turnLeft();', 'puntkomma tussen instructies');
rejected('moveForward(\n) turnLeft();', 'puntkomma tussen instructies');
rejected('if (true) moveForward() else turnLeft();', 'puntkomma tussen instructies');
rejected('for (;;) moveForward();', "Instructie 'for' wordt niet ondersteund");
rejected('const x = 1;', "Teken '=' wordt niet ondersteund");
rejected('if (isPathLeft() === true) turnLeft();', 'Teken');
rejected('/* never closed', 'Commentaar is niet afgesloten');
rejected('moveForward();\n}', "'}' heeft geen bijbehorende");
rejected('moveForward();\n'.repeat(2100), 'te veel instructies');
rejected('while (notDone()) '.repeat(70) + 'moveForward();' + '}'.repeat(70), 'te diep genest');

// The converter must parse text without executing any of it.
globalThis.__converterSideEffect = 0;
rejected('globalThis.__converterSideEffect = 1;', "Teken '.' wordt niet ondersteund");
assert.equal(globalThis.__converterSideEffect, 0);
delete globalThis.__converterSideEffect;

console.log('PASS: supported maze subset, serialized control/logic blocks, deterministic IDs, bounds, and safe rejection.');
