/* Blockly Turtle workspace and restricted interpreter adapter. */
(function (root) {
  'use strict';

  const moves = {
    turtle_forward: ['ga vooruit', 'DISTANCE', 'moveForward'],
    turtle_backward: ['ga achteruit', 'DISTANCE', 'moveBackward'],
    turtle_left: ['draai links', 'ANGLE', 'turnLeft'],
    turtle_right: ['draai rechts', 'ANGLE', 'turnRight'],
  };
  const pen = {
    turtle_pen_up: ['pen omhoog', 'penUp'],
    turtle_pen_down: ['pen omlaag', 'penDown'],
  };
  const limits = { bytes: 40000, blocks: 500, depth: 64, loops: 8 };
  const numberShadow = value => ({ shadow: { type: 'math_number', fields: { NUM: value } } });
  const toolbox = { kind: 'categoryToolbox', contents: [
    { kind: 'category', name: 'Turtle', categorystyle: 'logic_category', contents: [
      ...Object.entries(moves).map(([type, [, input]]) => ({
        kind: 'block', type, inputs: { [input]: numberShadow(input === 'ANGLE' ? 90 : 50) },
      })),
      ...Object.keys(pen).map(type => ({ kind: 'block', type })),
    ] },
    { kind: 'category', name: 'Lussen', categorystyle: 'loop_category', contents: [
      { kind: 'block', type: 'controls_for', inputs: { FROM: numberShadow(0), TO: numberShadow(3), BY: numberShadow(1) } },
      { kind: 'block', type: 'variables_get' },
    ] },
    { kind: 'category', name: 'Getallen', categorystyle: 'math_category', contents: [
      { kind: 'block', type: 'math_number', fields: { NUM: 50 } },
    ] },
  ] };

  let installed;
  function install(Blockly) {
    if (installed === Blockly) return;
    Blockly.defineBlocksWithJsonArray([
      ...Object.entries(moves).map(([type, [label, input]]) => ({
        type, message0: label + (input === 'ANGLE' ? ' %1 °' : ' %1'),
        args0: [{ type: 'input_value', name: input, check: 'Number' }],
        previousStatement: null, nextStatement: null, style: 'logic_blocks',
      })),
      ...Object.entries(pen).map(([type, [label]]) => ({
        type, message0: label, previousStatement: null, nextStatement: null, style: 'logic_blocks',
      })),
    ]);
    Blockly.Msg.CONTROLS_FOR_TITLE = 'tel met %1 van %2 tot en met %3 met stap %4';
    installed = Blockly;
  }

  const shape = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every(key => keys.includes(key));
  const identifier = value => typeof value === 'string' && value.length > 0 && value.length <= 120
    && !/[\x00-\x1f\x7f]/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
  const number = value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 100000;

  function validate(workspace) {
    if (workspace === null) return { roots: [], names: new Map() };
    const serialized = JSON.stringify(workspace);
    if (typeof serialized !== 'string' || new TextEncoder().encode(serialized).length > limits.bytes) {
      throw new Error('Het blokkenantwoord is te groot.');
    }
    if (!shape(workspace, ['blocks', 'variables']) || !shape(workspace.blocks, ['blocks', 'languageVersion'])
        || workspace.blocks.languageVersion !== 0 || !Array.isArray(workspace.blocks.blocks)) {
      throw new Error('Ongeldig Blockly-antwoord.');
    }
    const names = new Map();
    if (workspace.variables !== undefined && !Array.isArray(workspace.variables)) throw new Error('Ongeldige tellers.');
    for (const variable of workspace.variables ?? []) {
      if (!shape(variable, ['id', 'name', 'type']) || !identifier(variable.id) || !identifier(variable.name)
          || (variable.type !== undefined && variable.type !== '') || names.has(variable.id)) {
        throw new Error('Ongeldige tellers.');
      }
      names.set(variable.id, variable.name);
    }
    let count = 0;
    const blockIds = new Set();
    function check(block, depth, use) {
      if (++count > limits.blocks || depth > limits.depth) throw new Error('Te veel blokken of te diepe verbindingen.');
      if (!shape(block, ['type', 'id', 'x', 'y', 'fields', 'inputs', 'next', 'collapsed', 'disabledReasons', 'icons'])) {
        throw new Error('Ongeldig blok.');
      }
      if (block.id !== undefined) {
        if (!identifier(block.id) || blockIds.has(block.id)) throw new Error('Ongeldig of dubbel bloknummer.');
        blockIds.add(block.id);
      }
      for (const key of ['x', 'y']) {
        if (block[key] !== undefined && !number(block[key])) throw new Error('Ongeldige blokpositie.');
      }
      if (block.collapsed !== undefined && typeof block.collapsed !== 'boolean') throw new Error('Ongeldige blokweergave.');
      if (block.disabledReasons !== undefined && (!Array.isArray(block.disabledReasons)
          || !block.disabledReasons.every(reason => reason === 'MANUALLY_DISABLED' || reason === 'ORPHANED_BLOCK'))) {
        throw new Error('Ongeldige blokstatus.');
      }
      if (block.icons !== undefined) {
        const comment = block.icons?.comment;
        if (!shape(block.icons, ['comment']) || !shape(comment, ['text', 'pinned', 'height', 'width'])
            || typeof comment.text !== 'string' || typeof comment.pinned !== 'boolean'
            || !number(comment.width) || !number(comment.height) || comment.width <= 0 || comment.height <= 0) {
          throw new Error('Ongeldige opmerking bij een blok.');
        }
      }
      const { type } = block;
      const literal = type === 'math_number', variable = type === 'variables_get', loop = type === 'controls_for';
      const movement = Object.hasOwn(moves, type), penControl = Object.hasOwn(pen, type);
      const value = literal || variable;
      if ((!value && !loop && !movement && !penControl) || (use === 'value' && !value)
          || (use === 'statement' && value)) throw new Error('Niet-ondersteund of verkeerd verbonden blok.');
      if (literal && (!shape(block.fields, ['NUM']) || !number(block.fields.NUM))) throw new Error('Ongeldig getalblok.');
      if ((loop || variable) && (!shape(block.fields, ['VAR']) || !shape(block.fields.VAR, ['id'])
          || !names.has(block.fields.VAR.id))) throw new Error('Ongeldige teller in een blok.');
      if (!literal && !variable && !loop && block.fields !== undefined && !shape(block.fields, [])) throw new Error('Onverwachte blokvelden.');
      const inputs = loop ? ['FROM', 'TO', 'BY', 'DO'] : movement ? [moves[type][1]] : [];
      if (block.inputs !== undefined) {
        if (!shape(block.inputs, inputs)) throw new Error('Ongeldige blokinvoer.');
        for (const [name, connection] of Object.entries(block.inputs)) {
          if (!shape(connection, ['block', 'shadow']) || (!connection.block && !connection.shadow)
              || (connection.shadow && (name === 'DO' || connection.shadow.type !== 'math_number'))) {
            throw new Error('Ongeldige blokverbinding.');
          }
          if (connection.block) check(connection.block, depth + 1, name === 'DO' ? 'statement' : 'value');
          if (connection.shadow) check(connection.shadow, depth + 1, 'value');
        }
      }
      if (block.next !== undefined) {
        if (value || !shape(block.next, ['block']) || !block.next.block) throw new Error('Ongeldige volgende opdracht.');
        check(block.next.block, depth + 1, 'statement');
      }
    }
    for (const block of workspace.blocks.blocks) check(block, 1, 'root');
    return { roots: workspace.blocks.blocks, names };
  }

  function analyze(workspace) {
    const { roots, names } = validate(workspace);
    if (!roots.length) return { status: 'empty', lines: [], message: 'Werkruimte is leeg.' };
    const lines = [], source = [];
    let problem = roots.length > 1 ? 'Verbind de losse blokken tot één programma.' : '';
    let counter = 0;
    const warn = message => { problem ||= message; };
    function input(block, key, scope, allowVariable = false) {
      const part = block.inputs?.[key];
      const value = part?.block || part?.shadow;
      if (value?.type === 'math_number' && !value.disabledReasons?.length) return [String(value.fields.NUM), String(value.fields.NUM)];
      const id = value?.fields?.VAR?.id;
      if (allowVariable && scope.has(id) && !value.disabledReasons?.length) return [names.get(id), scope.get(id)];
      warn(allowVariable ? 'Vul een getal of actieve lusteller in.' : 'Vul start, eindgrens en stap in met getallen.');
      return ['?', '0'];
    }
    function program(first, scope, depth) {
      const indent = '  '.repeat(depth);
      for (let block = first; block; block = block.next?.block) {
        const { type } = block;
        if (block.disabledReasons?.length) {
          warn('Het programma bevat een uitgeschakeld blok.');
          lines.push(indent + '[Uitgeschakeld blok]');
        }
        if (Object.hasOwn(moves, type)) {
          const [label, key, command] = moves[type];
          const [visible, value] = input(block, key, scope, true);
          lines.push(indent + label + ' ' + visible);
          source.push(`${indent}${command}(${value});`);
        } else if (Object.hasOwn(pen, type)) {
          const [label, command] = pen[type];
          lines.push(indent + label);
          source.push(`${indent}${command}();`);
        } else if (type === 'controls_for') {
          const id = block.fields.VAR.id, name = names.get(id), generated = 'teller' + (++counter);
          const [from, start] = input(block, 'FROM', scope);
          const [to, end] = input(block, 'TO', scope);
          const [by, step] = input(block, 'BY', scope);
          lines.push(`${indent}tel met ${name} van ${from} tot en met ${to} met stap ${by}`);
          if (Number(step) <= 0) warn('Gebruik een positieve stapgrootte.');
          if (depth >= limits.loops) warn('Gebruik maximaal acht geneste lussen.');
          if (scope.has(id)) warn('Gebruik verschillende tellers voor geneste lussen.');
          const ascending = Number(start) <= Number(end);
          source.push(`${indent}for (var ${generated} = ${start}; ${generated} ${ascending ? '<=' : '>='} ${end}; ${generated} ${ascending ? '+=' : '-='} ${step}) {`);
          if (block.inputs?.DO?.block) program(block.inputs.DO.block, new Map(scope).set(id, generated), depth + 1);
          else warn('Plaats opdrachten in de for-lus.');
          source.push(indent + '}');
        } else {
          warn('Verbind losse waarden met een opdracht.');
          lines.push(indent + (type === 'math_number' ? String(block.fields.NUM) : names.get(block.fields.VAR.id)));
        }
        if (block.icons?.comment) lines.push(indent + 'Opmerking: ' + block.icons.comment.text);
      }
    }
    roots.forEach((block, index) => {
      if (roots.length > 1) lines.push(`Reeks ${index + 1}`);
      program(block, new Map(), 0);
    });
    return problem ? { status: 'invalid', message: problem, lines } : { status: 'ok', message: '', lines, source: source.join('\n') };
  }

  function inspect(workspace) {
    try { return analyze(workspace); }
    catch (error) { return { status: 'invalid', lines: [], message: error.message }; }
  }

  function run(workspace) {
    const result = inspect(workspace);
    if (result.status === 'ok') return root.Chapter2Turtle.run(result.source);
    return { status: result.status, message: result.message, segments: [], actions: [], loops: [],
      turtle: { x: 0, y: 0, heading: 90, pen: true, color: '#5200ff' } };
  }

  function mount(host, { workspace = null, readOnly = false, onChange } = {}) {
    validate(workspace);
    const Blockly = root.Blockly;
    install(Blockly);
    const editor = Blockly.inject(host, {
      readOnly, toolbox: readOnly ? undefined : toolbox, sounds: false, trashcan: !readOnly,
      media: '../../../../assessment/vendor/blockly/media/',
      move: { scrollbars: true, drag: true, wheel: true },
      zoom: { controls: true, startScale: 0.8, minScale: 0.45, maxScale: 1.5 },
      renderer: 'zelos', comments: false,
    });
    const snapshot = () => editor.getTopBlocks(true).length ? Blockly.serialization.workspaces.save(editor) : null;
    try {
      if (workspace) Blockly.serialization.workspaces.load(workspace, editor);
    } catch (error) {
      editor.dispose();
      throw error;
    }
    const listener = event => { if (!event.isUiEvent) onChange?.(snapshot()); };
    editor.addChangeListener(listener);
    const resize = new ResizeObserver(() => Blockly.svgResize(editor));
    resize.observe(host);
    return { snapshot, dispose() { resize.disconnect(); editor.removeChangeListener(listener); editor.dispose(); } };
  }

  const api = { install, mount, validate, inspect, run };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Chapter2Blocks = api;
})(globalThis);
