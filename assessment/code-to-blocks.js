/* Convert the assessment's restricted maze JavaScript subset to Blockly JSON. */
(function (root) {
  'use strict';

  const ACTION_BLOCKS = {
    moveForward: 'assessment_maze_move_forward',
    turnLeft: 'assessment_maze_turn_left',
    turnRight: 'assessment_maze_turn_right'
  };
  const CONDITION_BLOCKS = {
    isPathAhead: 'assessment_maze_path_ahead',
    isPathForward: 'assessment_maze_path_ahead',
    isPathLeft: 'assessment_maze_path_left',
    isPathRight: 'assessment_maze_path_right',
    notDone: 'assessment_maze_not_done'
  };
  const MAX_SOURCE_LENGTH = 100000;
  const MAX_TOKENS = 12000;
  const MAX_NESTING = 64;
  const MAX_STATEMENTS = 2000;

  class ParseError extends Error {
    constructor(message, token) {
      super(`${message} (regel ${token?.line || 1})`);
      this.name = 'SyntaxError';
      this.line = token?.line || 1;
    }
  }

  function tokenize(source) {
    if (typeof source !== 'string') throw new TypeError('De JavaScript-code moet tekst zijn.');
    if (source.length > MAX_SOURCE_LENGTH) throw new ParseError('De code is te lang om als blokken weer te geven', {line: 1});
    const tokens = [];
    let i = 0, line = 1;
    const add = (type, value, tokenLine) => {
      tokens.push({type, value, line: tokenLine});
      if (tokens.length > MAX_TOKENS) throw new ParseError('De code bevat te veel onderdelen om als blokken weer te geven', {line: tokenLine});
    };
    while (i < source.length) {
      const ch = source[i];
      if (/\s/.test(ch)) { if (ch === '\n') line++; i++; continue; }
      if (ch === '/' && source[i + 1] === '/') {
        i += 2; while (i < source.length && source[i] !== '\n') i++; continue;
      }
      if (ch === '/' && source[i + 1] === '*') {
        const startLine = line; i += 2; let closed = false;
        while (i < source.length) {
          if (source[i] === '*' && source[i + 1] === '/') { i += 2; closed = true; break; }
          if (source[i] === '\n') line++;
          i++;
        }
        if (!closed) throw new ParseError('Commentaar is niet afgesloten', {line: startLine});
        continue;
      }
      const tokenLine = line;
      if (/[A-Za-z_$]/.test(ch)) {
        let end = i + 1; while (end < source.length && /[A-Za-z0-9_$]/.test(source[end])) end++;
        add('identifier', source.slice(i, end), tokenLine); i = end; continue;
      }
      if ((ch === '&' && source[i + 1] === '&') || (ch === '|' && source[i + 1] === '|')) {
        add('operator', source.slice(i, i + 2), tokenLine); i += 2; continue;
      }
      if ('(){};!'.includes(ch)) { add(ch === '!' ? 'operator' : 'punctuation', ch, tokenLine); i++; continue; }
      throw new ParseError(`Teken '${ch}' wordt niet ondersteund`, {line: tokenLine});
    }
    add('eof', '', line);
    return tokens;
  }

  class Parser {
    constructor(tokens) { this.tokens = tokens; this.index = 0; this.statementCount = 0; }
    peek(value) { const token = this.tokens[this.index]; return value === undefined ? token : token.value === value; }
    take(value) {
      const token = this.peek();
      if (value !== undefined && token.value !== value) throw new ParseError(`'${value}' verwacht`, token);
      this.index++; return token;
    }
    enter(token) {
      this.depth = (this.depth || 0) + 1;
      if (this.depth > MAX_NESTING) throw new ParseError('De code is te diep genest om als blokken weer te geven', token);
    }
    leave() { this.depth--; }
    parse() {
      const statements = this.parseStatements(false);
      if (this.peek().type !== 'eof') throw new ParseError(`'${this.peek().value}' wordt hier niet verwacht`, this.peek());
      return statements;
    }
    parseStatements(inBlock) {
      const statements = [];
      while (this.peek().type !== 'eof' && !(inBlock && this.peek('}'))) {
        if (this.peek('}')) throw new ParseError("'}' heeft geen bijbehorende '{'", this.peek());
        statements.push(this.parseStatement());
        if (++this.statementCount > MAX_STATEMENTS) throw new ParseError('De code bevat te veel instructies om als blokken weer te geven', this.peek());
      }
      if (inBlock && this.peek().type === 'eof') throw new ParseError("'}' ontbreekt", this.peek());
      return statements;
    }
    parseBody() {
      if (!this.peek('{')) return [this.parseStatement()];
      this.take('{'); this.enter(this.tokens[this.index - 1]);
      const body = this.parseStatements(true); this.take('}'); this.leave();
      return body;
    }
    parseStatement() {
      const token = this.peek();
      if (token.value === 'while') {
        this.take(); this.enter(token); this.take('('); const condition = this.parseExpression(); this.take(')');
        const body = this.parseBody(); this.leave(); return {kind: 'while', condition, body};
      }
      if (token.value === 'if') {
        this.take(); this.enter(token); this.take('(');
        const branches = [{condition: this.parseExpression(), body: null}]; this.take(')'); branches[0].body = this.parseBody();
        let otherwise = null;
        while (this.peek('else')) {
          this.take();
          if (this.peek('if')) {
            const branchToken = this.take(); this.enter(branchToken); this.take('(');
            const condition = this.parseExpression(); this.take(')'); const body = this.parseBody(); this.leave();
            branches.push({condition, body});
          } else { otherwise = this.parseBody(); break; }
        }
        this.leave(); return {kind: 'if', branches, otherwise};
      }
      if (token.value === '{') return {kind: 'group', body: this.parseBody()};
      if (token.type !== 'identifier') throw new ParseError('Instructie wordt niet ondersteund', token);
      const name = this.take().value;
      if (!Object.prototype.hasOwnProperty.call(ACTION_BLOCKS, name)) {
        const known = Object.prototype.hasOwnProperty.call(CONDITION_BLOCKS, name) ? 'Een voorwaarde kan alleen in een if- of while-blok staan' : `Instructie '${name}' wordt niet ondersteund`;
        throw new ParseError(known, token);
      }
      this.take('('); const endToken=this.take(')');
      if (this.peek(';')) this.take(';');
      else {
        const next = this.peek();
        if (next.type !== 'eof' && next.value !== '}' && next.line === endToken.line) {
          throw new ParseError('Zet een puntkomma tussen instructies op dezelfde regel', next);
        }
      }
      return {kind: 'action', type: ACTION_BLOCKS[name]};
    }
    parseExpression() { this.enter(this.peek()); const value = this.parseOr(); this.leave(); return value; }
    parseOr() {
      let left = this.parseAnd();
      while (this.peek('||')) { const token = this.take(); left = {kind: 'logic', op: 'OR', left, right: this.parseAnd(), line: token.line}; }
      return left;
    }
    parseAnd() {
      let left = this.parseUnary();
      while (this.peek('&&')) { const token = this.take(); left = {kind: 'logic', op: 'AND', left, right: this.parseUnary(), line: token.line}; }
      return left;
    }
    parseUnary() {
      if (this.peek('!')) { const token = this.take(); this.enter(token); const value = this.parseUnary(); this.leave(); return {kind: 'not', value}; }
      if (this.peek('(')) { const token = this.take(); this.enter(token); const value = this.parseOr(); this.take(')'); this.leave(); return value; }
      const token = this.peek();
      if (token.value === 'true' || token.value === 'false') { this.take(); return {kind: 'boolean', value: token.value.toUpperCase()}; }
      if (token.type !== 'identifier' || !Object.prototype.hasOwnProperty.call(CONDITION_BLOCKS, token.value)) {
        throw new ParseError('Voorwaarde wordt niet ondersteund', token);
      }
      this.take(); this.take('('); this.take(')');
      return {kind: 'condition', type: CONDITION_BLOCKS[token.value]};
    }
  }

  function serialize(statements) {
    let nextId = 0;
    const id = () => `marking-code-${nextId++}`;
    function expression(node) {
      if (node.kind === 'boolean') return {type: 'logic_boolean', id: id(), fields: {BOOL: node.value}};
      if (node.kind === 'condition') return {type: node.type, id: id()};
      if (node.kind === 'not') return {type: 'logic_negate', id: id(), inputs: {BOOL: {block: expression(node.value)}}};
      if (node.kind === 'logic') return {type: 'logic_operation', id: id(), fields: {OP: node.op}, inputs: {A: {block: expression(node.left)}, B: {block: expression(node.right)}}};
      throw new Error('Interne fout: onbekende voorwaarde.');
    }
    function statement(node) {
      if (node.kind === 'action') return {type: node.type, id: id()};
      if (node.kind === 'while') {
        const inputs = {BOOL: {block: expression(node.condition)}}, body = statementChain(node.body);
        if (body) inputs.DO = body;
        return {type: 'controls_whileUntil', id: id(), fields: {MODE: 'WHILE'}, inputs};
      }
      if (node.kind === 'if') {
        const inputs = {};
        node.branches.forEach((branch, i) => {
          inputs[`IF${i}`] = {block: expression(branch.condition)};
          const body = statementChain(branch.body);
          if (body) inputs[`DO${i}`] = body;
        });
        if (node.otherwise) { const otherwise = statementChain(node.otherwise); if (otherwise) inputs.ELSE = otherwise; }
        const extraState = {};
        if (node.branches.length > 1) extraState.elseIfCount = node.branches.length - 1;
        if (node.otherwise) extraState.hasElse = true;
        const result = {type: 'controls_if', id: id(), inputs};
        if (node.branches.length > 1 || node.otherwise) result.extraState = extraState;
        return result;
      }
      throw new Error('Interne fout: onbekende instructie.');
    }
    function statementChain(nodes) {
      let first = null, tail = null;
      function append(node) {
        if (node.kind === 'group') { node.body.forEach(append); return; }
        const current = statement(node);
        if (!current) return;
        if (!first) first = current;
        else tail.next = {block: current};
        tail = current;
      }
      for (const node of nodes) append(node);
      return first ? {block: first} : undefined;
    }
    const first=statementChain(statements)?.block;
    const blocks=first?[{...first,x:32,y:32}]:[];
    return {blocks: {languageVersion: 0, blocks}};
  }

  function convert(source) {
    const tokens = tokenize(source);
    const ast = new Parser(tokens).parse();
    return serialize(ast);
  }

  root.AssessmentCodeBlocks = {convert};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.AssessmentCodeBlocks;
})(typeof window !== 'undefined' ? window : globalThis);
