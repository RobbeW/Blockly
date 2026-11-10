/* Draft and submission contracts for the Turtle blocks practice revision. */
(function () {
  'use strict';

  const revision = '20261110-turtle-v6';
  const labels = { blocks: 'Blokken', code: 'JavaScript' };
  const ids = ['q3a', 'q3b'];
  const factors = { blocks: 0.5, code: 1 };
  const pilot = config => config.practice === 'blocks';
  const enabled = config => Boolean(config.answerModes);
  function requested(search, variant) {
    const query = new URLSearchParams(search);
    if (query.get('practice') === 'blocks') return 'practice';
    if (variant === 'C' && query.get('assessment') === 'blocks') return 'assessment';
    return null;
  }

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }

  async function prepare(base, delivery) {
    const groups = base.groups.map(group => group.id === 'q3' ? {
      ...group,
      title: 'Van figuur naar programma',
      prompt: 'Programmeer beide figuren met for-lussen. Kies per figuur blokken of JavaScript. Gebruik bij 3b één lus voor de zijden en één lus voor de zeshoeken. Voer je programma uit en vergelijk je tekening met het doel. De kleur van de lijnen telt niet mee.',
    } : group);
    const config = { ...base, groups, revision, answerModes: { q3a: ['blocks', 'code'], q3b: ['blocks', 'code'] } };
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

  window.Chapter2AnswerModes = { pilot, enabled, requested, prepare, loadEditor, labels, ids, blankDraft, validDraft, selected, run, maximum, ceiling };
})();
