/* Draft and submission contracts for the Turtle blocks revisions. */
(function () {
  'use strict';

  const revision = '20261110-turtle-v7';
  const previousRevision = '20261110-turtle-v6';
  const labels = { blocks: 'Blokken', code: 'JavaScript' };
  const factors = { blocks: 0.5, code: 1 };
  const pilot = config => config.practice === 'blocks';
  const enabled = config => Boolean(config.answerModes);
  function requested(search, variant) {
    const query = new URLSearchParams(search);
    if (query.get('legacy') === 'v5') return null;
    if (query.get('practice') === 'blocks') return 'practice';
    if (variant === 'C') return 'assessment';
    if (variant === 'A' || variant === 'B') return 'practice';
    return null;
  }

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }

  function squareTask(task) {
    const scale = 50 / Math.abs(task.figure.segments[0].y2);
    return { ...task, prompt: ['Teken twee losse vierkanten.', 'Elke zijde is 50 pixels.'],
      figure: { segments: task.figure.segments.map(({x1, y1, x2, y2, color}) => ({
        x1: x1 * scale || 0, y1: y1 * scale || 0, x2: x2 * scale || 0, y2: y2 * scale || 0, color,
      })) },
    };
  }

  function thirdTask(version) {
    const line = version === 'A';
    const pentagon = version === 'C';
    const shape = pentagon ? 'vijfhoeken' : 'sterren';
    const arrangement = line ? 'op een rij' : 'in een driehoek';
    const side = pentagon ? 32 : 45;
    const spacing = line ? 100 : 120;
    const turn = pentagon ? 72 : 144;
    const origins = line ? [[0, 0], [spacing, 0], [2 * spacing, 0]] : [[0, 0], [spacing, 0], [spacing / 2, spacing * Math.sqrt(3) / 2]];
    const round = value => +value.toFixed(8) || 0;
    const segments = origins.flatMap(([startX, startY]) => {
      let x = startX;
      let y = startY;
      return Array.from({ length: 5 }, (_, index) => {
        const angle = (90 - index * turn) * Math.PI / 180;
        const nextX = index === 4 ? startX : x + Math.cos(angle) * side;
        const nextY = index === 4 ? startY : y + Math.sin(angle) * side;
        const segment = { x1: round(x), y1: round(y), x2: round(nextX), y2: round(nextY), color: '#000000' };
        x = nextX;
        y = nextY;
        return segment;
      });
    });
    return {
      id: 'q3c', label: `3c · Drie ${shape} ${arrangement}`, points: 2.5,
      alt: `Drie ${shape} ${arrangement}, met de startpijl linksonder.`,
      prompt: [
        `Teken drie losse ${shape} ${arrangement}.`,
        `Elk lijnstuk is ${side} pixels.`,
        line ? `Laat ${spacing} pixels tussen de startpunten.` : `De startpunten vormen een gelijkzijdige driehoek met zijden van ${spacing} pixels.`,
        'Gebruik for-lussen en verplaats met de pen omhoog.',
      ],
      figure: { segments }, inspiration: 'Blockly Turtle · sterren en vijfhoeken',
    };
  }

  async function prepare(base, delivery, previous = false) {
    const groups = base.groups.map(group => {
      if (group.id === 'q2' && !previous) return {
        ...group, prompt: group.prompt.replace('met de pen omlaag worden getekend', 'worden getekend'),
        traces: group.traces.map(trace => ({ ...trace, countPrompt: trace.countPrompt.replace(' met de pen omlaag', '') })),
      };
      if (group.id !== 'q3') return group;
      if (previous) return {
        ...group,
        title: 'Van figuur naar programma',
        prompt: 'Programmeer beide figuren met for-lussen. Kies per figuur blokken of JavaScript. Gebruik bij 3b één lus voor de zijden en één lus voor de zeshoeken. Voer je programma uit en vergelijk je tekening met het doel. De kleur van de lijnen telt niet mee.',
      };
      return { ...group, title: 'Van figuur naar programma', prompt: '', points: group.points + 2.5,
        tasks: [squareTask(group.tasks[0]), group.tasks[1], thirdTask(base.version)] };
    });
    const tasks = groups.find(group => group.id === 'q3').tasks;
    const answerModes = Object.fromEntries(tasks.map(task => [task.id, ['blocks', 'code']]));
    const config = { ...base, groups, totalPoints: base.totalPoints + (previous ? 0 : 2.5),
      revision: previous ? previousRevision : revision, answerModes };
    if (!previous) config.subtitle = '';
    if (delivery === 'practice') {
      config.revision += '-practice';
      config.practice = 'blocks';
    }
    const content = Object.fromEntries(Object.entries(config).filter(([key]) =>
      !['configSha256', 'startPassword', 'smartschoolUrl', 'teacher'].includes(key)));
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(canonical(content))));
    config.configSha256 = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    return config;
  }

  async function loadEditor() {
    const base = '../../../../assessment/vendor/blockly/';
    const load = src => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('De blokkeneditor kon niet worden geladen.'));
      document.head.append(script);
    });
    await load(base + 'blockly_compressed.js');
    await load(base + 'blocks_compressed.js');
    await load(base + 'nl.js');
    await load('../../turtle-blocks.js?v=20261110-blocks');
  }

  const blankDraft = () => ({ mode: null, code: '', blocks: null });
  function validDraft(draft) {
    return draft && (draft.mode === null || Object.hasOwn(labels, draft.mode)) && typeof draft.code === 'string'
      && (draft.blocks === null || typeof draft.blocks === 'object' && !Array.isArray(draft.blocks));
  }

  function selected(taskId, draft) {
    const { mode } = draft;
    if (mode === 'code') return { taskId, mode, blank: !draft.code.trim(), code: draft.code };
    if (mode === 'blocks') {
      const blank = Chapter2Blocks.inspect(draft.blocks).status === 'empty';
      return { taskId, mode, blank, workspace: { format: 'blockly-json-v1', state: draft.blocks } };
    }
    return { taskId, mode: null, blank: true };
  }

  function run(answer) {
    if (answer.blank) return null;
    if (answer.mode === 'blocks') return Chapter2Blocks.run(answer.workspace.state);
    return Chapter2Turtle.run(answer.code);
  }

  const maximum = (task, mode) => task.points * (factors[mode] ?? 1);
  function ceiling(config, answers) {
    const tasks = config.groups.find(group => group.id === 'q3').tasks;
    return config.totalPoints - tasks.reduce((loss, task) => loss + task.points - maximum(task, answers[task.id].mode), 0);
  }

  window.Chapter2AnswerModes = { pilot, enabled, requested, prepare, loadEditor, labels, blankDraft, validDraft, selected, run, maximum, ceiling };
})();
