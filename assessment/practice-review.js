/* Worked-example comparison for practice versions. © 2026 Robbe Wulgaert · AI in de Klas. */
(function () {
  'use strict';

  const esc = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
  const points = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 2 });
  const scoreText = (earned, max) => `${points.format(earned)} / ${points.format(max)}`;
  const reviewButton = '<button type="button" id="practice-examples">Vergelijk voorbeeldantwoorden</button>';

  function shuffle(examples) {
    const order = [...examples];
    for (let index = order.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [order[index], order[other]] = [order[other], order[index]];
    }
    return order;
  }

  function create(config) {
    if (!['A', 'B'].includes(config.version)) return;
    const items = window.AssessmentPracticeExamples?.(config);
    if (!items?.length) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'practice-dialog';
    dialog.setAttribute('aria-labelledby', 'practice-title');
    document.body.append(dialog);
    let stages, index, offeredAttempt, returnFocus, onContinue;

    function figure(label, className) {
      return `<canvas class="${className}" width="400" height="230" role="img" aria-label="${esc(label)}"></canvas>`;
    }

    function render() {
      const { item, examples, selection } = stages[index];
      const revealed = selection !== undefined;
      const last = index === stages.length - 1;
      const nextLabel = onContinue
        ? (last ? 'Verder →' : 'Volgend voorbeeld →')
        : (last ? 'Afronden' : 'Volgende →');
      const best = Math.max(...examples.map(example => example.score));
      const guide = revealed
        ? (examples[selection].score === best
          ? 'Je koos het voorbeeld met de hoogste score. Bekijk waarom het meer punten krijgt.'
          : 'Een ander voorbeeld scoort hoger. Vergelijk de punten en lees de feedback.')
        : 'Welk antwoord zou volgens jou de hoogste score krijgen?';
      const prompt = Array.isArray(item.prompt)
        ? `<ul>${item.prompt.map(line => `<li>${esc(line)}</li>`).join('')}</ul>`
        : `<p>${esc(item.prompt)}</p>`;
      const reference = revealed || item.reference || item.image || item.figure ? `<details class="practice-reference"><summary>${revealed ? 'Bekijk de opgave' : esc(item.referenceLabel || 'Bekijk het gegeven voorbeeld')}</summary>
        ${revealed ? prompt : ''}
        ${item.image ? `<img src="${esc(item.image.src)}" alt="${esc(item.image.alt)}">` : ''}
        ${item.figure ? figure(item.figureLabel, 'practice-target') : ''}
        ${item.reference ? `<pre>${esc(item.reference)}</pre>` : ''}
      </details>` : '';

      dialog.innerHTML = `
        <header class="practice-header">
          <span class="eyebrow">VOORBEELDANTWOORDEN · ${index + 1} VAN ${stages.length}</span>
          <h2 id="practice-title" tabindex="-1">${esc(item.title)}</h2>
          <p id="practice-guide" tabindex="-1">${guide}</p>
        </header>
        <div class="practice-body">
          ${revealed ? '' : prompt}
          ${reference}
          <div class="practice-cards">
            ${examples.map((example, position) => {
              const label = String.fromCharCode(65 + position);
              const selected = selection === position;
              const high = revealed && example.score === best;
              return `<article class="practice-card${high ? ' practice-best' : ''}" aria-labelledby="practice-card-${label}">
                <h3 id="practice-card-${label}">Voorbeeld ${label}</h3>
                ${revealed ? `<p class="practice-score"><strong>${scoreText(example.score, item.max)} punten</strong>
                  ${high ? '<span>Hoogste score</span>' : ''}
                  ${selected ? '<span>Jouw keuze</span>' : ''}</p>` : ''}
                ${typeof example.answer === 'string'
                  ? `<pre>${esc(example.answer)}</pre>`
                  : `<dl class="practice-answers">${example.answer.map(([question, answer]) =>
                    `<div><dt>${esc(question)}</dt><dd>${esc(answer)}</dd></div>`).join('')}</dl>`}
                ${example.figure ? figure(example.figureLabel, 'practice-option') : ''}
                ${revealed
                  ? `<div class="practice-feedback">
                      ${example.feedback ? `<p>${esc(example.feedback)}</p>` : ''}
                      ${example.criteria ? `<dl>${example.criteria.map(([name, earned, max, comment]) =>
                        `<div><dt>${esc(name)} · ${scoreText(earned, max)}</dt><dd>${esc(comment)}</dd></div>`).join('')}</dl>` : ''}
                    </div>`
                  : `<button type="button" data-choose="${position}">Kies voorbeeld ${label}</button>`}
              </article>`;
            }).join('')}
          </div>
        </div>
        <footer class="practice-footer">
          <button type="button" data-practice-close>${onContinue ? 'Terug naar de vraag' : 'Naar overzicht'}</button>
          ${revealed
            ? `<button type="button" class="primary" data-practice-next>${nextLabel}</button>`
            : onContinue ? '<button type="button" data-practice-skip>Overslaan →</button>' : ''}
        </footer>`;

      if (item.figure) Chapter2Turtle.draw(dialog.querySelector('.practice-target'), item.figure, { cursor: false, labelSide: item.labelSide });
      const canvases = dialog.querySelectorAll('.practice-option');
      examples.filter(example => example.figure).forEach((example, i) => {
        Chapter2Turtle.draw(canvases[i], example.figure, { cursor: false });
      });
    }

    dialog.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-practice-close')) {
        dialog.close();
      } else if (button.hasAttribute('data-practice-skip') ||
          (button.hasAttribute('data-practice-next') && index === stages.length - 1)) {
        dialog.close();
        onContinue?.();
      } else if (button.hasAttribute('data-practice-next')) {
        index++;
        render();
        dialog.querySelector('#practice-title').focus();
      } else if (button.dataset.choose !== undefined) {
        stages[index].selection = Number(button.dataset.choose);
        render();
        dialog.querySelector('#practice-guide').focus();
      }
    });
    dialog.addEventListener('close', () => {
      if (!dialog.open && returnFocus?.isConnected) returnFocus.focus();
    });

    function open({ groupId, trigger = document.getElementById('practice-examples'), proceed } = {}) {
      if (dialog.open) return true;
      const selected = groupId ? items.filter(item => item.groupId === groupId) : items;
      if (!selected.length) return false;
      returnFocus = trigger;
      onContinue = proceed;
      stages = selected.map(item => ({ item, examples: shuffle(item.examples) }));
      index = 0;
      render();
      dialog.showModal();
      dialog.querySelector('#practice-title').focus();
      return true;
    }

    return {
      reviewButton,
      open,
      close: () => dialog.close(),
      offer(attemptId) {
        if (offeredAttempt === attemptId) return;
        offeredAttempt = attemptId;
        open();
      },
    };
  }

  function scored(answer, criteria) {
    return { answer, criteria, score: criteria.reduce((total, [, earned]) => total + earned, 0) };
  }

  window.AssessmentPractice = { create, scored };
})();
