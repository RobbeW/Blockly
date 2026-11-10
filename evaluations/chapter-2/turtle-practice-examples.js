/* Fictional A/B worked examples. © 2026 Robbe Wulgaert · AI in de Klas. */
(function () {
  'use strict';

  const sample = (answer, score, feedback) => ({ answer, score, feedback });
  const fields = (labels, values) => labels.map((label, i) => [label, values[i]]);
  const lines = entries => entries.join('\n');
  const blockLines = (items, depth = 0) => items.flatMap(item => {
    const indent = '  '.repeat(depth);
    return typeof item === 'string' ? [indent + item] : [
      `${indent}herhaal ${item.repeat} keer`, ...blockLines(item.body, depth + 1),
    ];
  });

  function traceExamples(group, mirrored) {
    const figures = mirrored ? [['C', 'C', 'B'], ['A', 'A', 'D'], ['C', 'C', 'B']]
      : [['B', 'B', 'C'], ['D', 'D', 'B'], ['A', 'A', 'D']];
    const counts = [[4, 2, 2], [5, 10, 4], [15, 18, 18]];
    const feedback = [
      [
        'De rechthoek sluit. In elke herhaling teken je twee zijden, dus in totaal vier.',
        'De figuur klopt. Elke herhaling bevat twee vooruitopdrachten met de pen omlaag.',
        'De twee afstanden verschillen, dus het wordt geen vierkant. Tel twee zijden per herhaling.',
      ],
      [
        'Vijf herhalingen geven vijf lijnstukken. De draai van 72° per hoek sluit de vijfhoek.',
        'De vijfhoek klopt. Een draai verandert de richting en tekent geen extra lijnstuk.',
        'De lus herhaalt vijf keer. Na vier zijden is de vijfhoek nog niet gesloten.',
      ],
      [
        'Er zijn drie vijfhoeken met vijf zijden per figuur. De verplaatsingen met de pen omhoog tekenen niets.',
        'De losse vijfhoeken kloppen. Tel de drie verplaatsingen met de pen omhoog niet mee.',
        'Tijdens de verplaatsingen staat de pen omhoog. Daarom zie je geen verbindingslijnen en tel je er 15.',
      ],
    ];
    return group.traces.map((trace, index) => ({
      groupId: group.id,
      title: `Vraag 2${'abc'[index]} · Lees de blokken`,
      prompt: 'Kies de figuur die bij de blokken hoort en tel de lijnstukken die de pen tekent.',
      reference: lines(blockLines(trace.instructions)),
      referenceLabel: 'Bekijk de blokken',
      max: 1,
      examples: figures[index].map((id, level) => {
        const option = trace.options.find(entry => entry.id === id);
        return {
          ...sample([['Figuur uit de toets', `Optie ${id}`], ['Aantal lijnstukken', counts[index][level]]],
            [1, 0.5, 0][level], feedback[index][level]),
          figure: option.figure,
          figureLabel: option.alt,
        };
      }),
    }));
  }

  function coding(group, mirrored, blocksPilot) {
    const turn = mirrored ? 'turnLeft' : 'turnRight';
    const back = mirrored ? 'turnRight' : 'turnLeft';
    const side = mirrored ? 60 : 50;
    const gap = mirrored ? 90 : 75;
    const hexSide = mirrored ? 25 : 20;
    const square = penUp => lines([
      'for (var vierkant = 0; vierkant < 2; vierkant++) {',
      '  for (var zijde = 0; zijde < 4; zijde++) {',
      `    moveForward(${side});`, `    ${turn}(90);`, '  }',
      ...(penUp ? ['  penUp();'] : []),
      `  ${turn}(90);`, `  moveForward(${gap});`, `  ${back}(90);`,
      ...(penUp ? ['  penDown();'] : []),
      '}',
    ]);
    const hexagons = distance => lines([
      'for (var teller2 = 0; teller2 < 4; teller2++) {',
      '  for (var teller = 0; teller < 6; teller++) {',
      `    moveForward(${hexSide});`, '    turnRight(60);', '  }',
      '  penUp();', `  moveForward(${distance});`, '  turnRight(90);', '  penDown();', '}',
    ]);
    const makeCode = (answer, scores, mathsLabel, comments) => AssessmentPractice.scored(answer, [
      ['Functioneel', scores[0], 0.5, comments[0]],
      ['Leesbaar', scores[1], 0.5, comments[1]],
      ['Programmeerconcepten', scores[2], 1, comments[2]],
      [mathsLabel, scores[3], 0.5, comments[3]],
    ]);
    const squareCode = (code, scores, ...comments) => makeCode(code, scores, 'Wiskundeconcepten', comments);
    const hexCode = (code, scores, ...comments) => makeCode(code, scores, 'Wiskundeconcepten en verplaatsing', comments);

    const examples = [
      [
        squareCode(square(true), [0.5, 0.5, 1, 0.5],
          'De uitvoer toont twee losse vierkanten op de juiste afstand.',
          'De tellers benoemen wat herhaalt. Inspringing scheidt de twee lussen.',
          'De binnenste lus tekent vier zijden. Pen omhoog en omlaag maken de verplaatsing onzichtbaar.',
          `Elke zijde is ${side} pixels en elke draai is 90°.`),
        squareCode(square(false), [0, 0.5, 0.5, 0.5],
          'Beide vierkanten verschijnen, maar er staan ook extra lijnen.',
          'De lussen en de verplaatsing zijn goed te onderscheiden.',
          'De for-lus tekent de zijden. Zet de pen omhoog tijdens het verplaatsen en omlaag vóór het tekenen.',
          'De lengtes en rechte hoeken van de vierkanten kloppen.'),
        squareCode(`moveForward(${side}); ${turn}(60); moveForward(${side});`, [0, 0.25, 0, 0],
          'De turtle tekent twee zijden van één onvolledige figuur.',
          'De commando’s zijn herkenbaar. Zet elke opdracht op een eigen regel.',
          'Gebruik een for-lus voor vier zijden. Gebruik de penstand om zonder lijn te verplaatsen.',
          'Een vierkant heeft rechte hoeken. Draai 90° na elke zijde.'),
      ],
      [
        hexCode(hexagons(100), [0.5, 0.5, 1, 0.5],
          'De vier zeshoeken staan los van elkaar in het gevraagde rooster.',
          'Door de inspringing zie je meteen welke opdrachten bij de binnenste lus horen.',
          'De binnenste lus tekent zes zijden. De buitenste lus herhaalt de figuur vier keer.',
          'Draai 60° na elke zijde. Spring met de pen omhoog 100 pixels vooruit en draai dan 90° naar de volgende richting.'),
        hexCode(hexagons(80), [0, 0.5, 1, 0],
          'De code maakt vier zeshoeken. Hun startpunten liggen te dicht bij elkaar.',
          'De lusstructuur is duidelijk en consequent ingesprongen.',
          'De lussen voor de zijden en voor de zeshoeken zijn bruikbaar.',
          'De hoeken en zijden kloppen. Voor de plaatsing is 100 pixels nodig tussen de startpunten.'),
        hexCode(`moveForward(${hexSide}); turnRight(90); moveForward(${hexSide});`, [0, 0.25, 0, 0],
          'De uitvoer bevat maar twee lijnstukken.',
          'Je herkent de opdrachten. Eén opdracht per regel is makkelijker te lezen.',
          'Herhaal de zes zijden met for en gebruik een extra lus voor de zeshoeken.',
          'Draai na elke zijde 60°. Verplaats met de pen omhoog tussen de startpunten.'),
      ],
    ];

    const codeItems = group.tasks.map((task, i) => ({
      groupId: group.id,
      title: `Vraag ${task.label}`,
      prompt: task.prompt,
      figure: task.figure,
      figureLabel: task.alt,
      labelSide: task.id === 'q3b' ? 'left' : 'auto',
      referenceLabel: 'Bekijk de doelfiguur',
      max: task.points,
      examples: examples[i],
    }));
    if (!blocksPilot) return codeItems;

    const moves = {
      moveForward: 'ga vooruit', turnRight: 'draai rechts', turnLeft: 'draai links',
      penUp: 'pen omhoog', penDown: 'pen omlaag',
    };
    function asBlocks(answer) {
      return answer.replace(/; +(?=\w+\()/g, ';\n').split('\n').flatMap(line => {
        const loop = line.match(/^(\s*)for \(var (\w+) = 0; \w+ < (\d+); \w+\+\+\) \{$/);
        if (loop) return [`${loop[1]}tel met ${loop[2]} van 0 tot en met ${Number(loop[3]) - 1} met stap 1`];
        const call = line.match(/^(\s*)(\w+)\((\d*)\);$/);
        if (call) return [`${call[1]}${moves[call[2]]}${call[3] ? ' ' + call[3] : ''}`];
        return [];
      }).join('\n');
    }
    return codeItems.flatMap((item, i) => {
      const taskId = group.tasks[i].id;
      const blocks = item.examples.map((example, level) => AssessmentPractice.scored(asBlocks(example.answer),
        example.criteria.map(([name, earned, max, comment]) => [name, earned / 2, max / 2,
          name === 'Leesbaar'
            ? level < 2 ? 'De blokken zijn verbonden en de nesting maakt de lussen herkenbaar.' : 'Verbind de opdrachten in één overzichtelijke reeks.'
            : comment.replaceAll('De code', 'De blokken')])));
      return [
        { ...item, taskId, answerMode: 'code', title: item.title + ' · JavaScript' },
        { ...item, taskId, answerMode: 'blocks', title: item.title + ' · Blokken', max: item.max / 2, examples: blocks },
      ];
    });
  }

  function thinkingSteps(group) {
    const order = { decompose: 1, pattern: 2, abstract: 3, algorithm: 4, debug: 5 };
    const name = { debug: 'Debuggen', decompose: 'Decompositie' };
    const explanation = {
      decompose: 'Een groot probleem in kleinere delen splitsen.',
      pattern: 'Zoeken naar overeenkomsten of herhaling.',
      abstract: 'De hoofdzaken kiezen en details weglaten.',
      algorithm: 'Uitvoerbare stappen in een passende volgorde zetten.',
    };
    const table = (orders, names, explanations) => group.rows.map((row, i) => [
      `Rij ${i + 1} · ${row.name || (row.id === 'debug' ? 'Uitleg gegeven' : 'Naam en uitleg ontbreken')}`,
      [`Volgorde ${orders[row.id]}`, !row.name && names[row.id], !row.description && explanations[row.id]]
        .filter(Boolean).join('\n'),
    ]);
    return {
      groupId: group.id,
      title: 'Vraag 7 · De stappen van het computationeel denken',
      prompt: group.prompt,
      reference: lines(group.rows.map((row, i) =>
        `Rij ${i + 1} · ${row.name || 'naam ontbreekt'} · ${row.description || 'uitleg ontbreekt'}`)),
      referenceLabel: 'Bekijk de gegevens in de tabel',
      max: 5,
      examples: [
        sample(table(order, name, explanation), 5, 'Alle posities, ontbrekende namen en beschrijvingen kloppen.'),
        sample(table({ ...order, algorithm: 5, debug: 4 }, { ...name, decompose: 'Patroonherkenning' }, {
          ...explanation, algorithm: 'Code mooier maken.', abstract: 'Alle details bewaren.',
        }), 2.6, 'Drie posities, één ontbrekende naam en twee beschrijvingen kloppen. Opdelen heet decompositie. Bij abstraheren laat je details weg. Ontwerp het algoritme vóór je het debugt.'),
        sample(table({ decompose: 2, pattern: 3, abstract: 4, algorithm: 5, debug: 1 },
          { debug: 'Sequentie', decompose: 'Debuggen' }, {
            decompose: 'Code openen.', pattern: 'Een kleur kiezen.', abstract: 'Elk detail opschrijven.',
            algorithm: 'De eerste fout zoeken.',
          }), 0, 'De namen en beschrijvingen verwisselen de begrippen. Begin bij opdelen. Fouten opsporen en verbeteren hoort bij de laatste stap.'),
      ],
    };
  }

  window.AssessmentPracticeExamples = config => {
    const group = id => config.groups.find(entry => entry.id === id);
    const mirrored = config.version === 'B';
    const start = mirrored ? 4 : 5;
    const end = mirrored ? 16 : 17;
    const distance = mirrored ? 90 : 100;
    const correction = group('q6');
    const correctionLabels = ['Vooruitgaan', 'Rechts draaien', 'For-lus'];
    const terms = group('q4').terms;
    const translated = map => terms.map(term => [term, map[term.split(' (')[0]]]);
    const translations = {
      'In volgorde': 'Sequentie', Als: 'if', Anders: 'else', Zolang: 'while',
      'Draai naar links': 'turnLeft()', 'Draai naar rechts': 'turnRight()',
    };

    return [
      {
        groupId: 'q1',
        title: 'Vraag 1 · Schrijf een for-lus',
        prompt: group('q1').prompt,
        max: 2,
        examples: [
          sample(`for (var teller = ${start}; teller < ${end}; teller++) {}`, 2,
            'De teller start juist, stopt vóór de eindgrens en gaat telkens één omhoog. De lege lus is geldig.'),
          sample(`for (var teller = ${start}; teller <= ${end}; teller++) {}`, 1.5,
            'De start, stap en schrijfwijze kloppen. Met <= loopt de teller ook op de eindgrens. Gebruik < om die waarde uit te sluiten.'),
          sample(`for (var teller = 0; teller < ${end + 2}; teller += 2) {}`, 0.5,
            `De lus is geldig geschreven. Gebruik ${start} als startgetal, ${end} als exclusieve eindgrens en teller++ voor een stap van 1.`),
        ],
      },
      ...traceExamples(group('q2'), mirrored),
      ...coding(group('q3'), mirrored, config.practice === 'blocks'),
      {
        groupId: 'q4',
        title: 'Vraag 4 · Herhaling van termen',
        prompt: group('q4').prompt,
        max: 3,
        examples: [
          sample(translated(translations), 3, 'Alle vertalingen kloppen. De twee draaiopdrachten gebruiken een hoofdletter midden in de naam.'),
          sample(translated({ ...translations, 'In volgorde': 'Algoritme', Anders: 'if' }), 2,
            'Vier termen kloppen. Instructies in volgorde uitvoeren heet sequentie. Voor de alternatieve tak gebruik je else.'),
          sample(translated({ 'In volgorde': 'JavaScript', Als: 'else', Anders: 'if', Zolang: 'while',
            'Draai naar links': 'turnRight()', 'Draai naar rechts': 'turnLeft()' }), 0.5,
          'Alleen while klopt. Onderscheid de twee takken van een keuze en controleer de richting in elke draaiopdracht.'),
        ],
      },
      {
        groupId: 'q6',
        title: 'Vraag 5 · Verbeter de code',
        prompt: correction.prompt,
        reference: lines(correction.rows),
        referenceLabel: 'Bekijk de te verbeteren code',
        max: 3,
        examples: [
          sample(fields(correctionLabels, [`moveForward(${distance});`, 'turnRight(144);', 'for (var teller = 0; teller < 6; teller++)']),
            3, 'Geef de afstand als getal en schrijf turnRight met een hoofdletter R. Met = 0 start de teller op nul. Met < 6 en teller++ telt de lus van 0 tot en met 5, dus zes keer.'),
          sample(fields(correctionLabels, [`moveForward(${distance});`, 'turnRight(144);', 'for (var teller = 0; teller < 5; teller++)']),
            2, 'De twee Turtle-opdrachten kloppen. Met < 5 loopt de teller van 0 tot en met 4. Gebruik < 6 voor zes herhalingen.'),
          sample(fields(correctionLabels, [`moveForward(${distance} pixels);`, 'turnright(144);', 'for (var teller 0; teller > 5; teller+)']),
            0, 'Laat pixels weg uit het argument en schrijf turnRight met een hoofdletter R. Start met var teller = 0, controleer teller < 6 en verhoog met teller++.'),
        ],
      },
      {
        groupId: 'q7',
        title: 'Vraag 6 · Leg de begrippen uit',
        prompt: group('q7').prompt,
        max: 2,
        examples: [
          sample(fields(group('q7').terms, [
            'Je onderzoekt een probleem op een vaste manier. Je deelt het op, zoekt patronen en maakt en test zo een uitvoerbare oplossing.',
            'Een algoritme is een reeks duidelijke stappen in een bepaalde volgorde om een probleem op te lossen.',
          ]), 2, 'Beide definities leggen uit wat je doet en welk doel dat heeft.'),
          sample(fields(group('q7').terms, [
            'Dat is denken zoals een computer.',
            'Een algoritme is een lijst van stappen die je in volgorde uitvoert om een doel te bereiken.',
          ]), 1, 'Het algoritme is goed uitgelegd. Maak computationeel denken concreet met bijvoorbeeld opdelen, patronen zoeken of testen.'),
          sample(fields(group('q7').terms, ['Dat is kunnen typen.', 'Een algoritme is een programmeertaal.']), 0,
            'Typen helpt om code in te voeren. Leg uit hoe je een probleem aanpakt en hoe uitvoerbare stappen tot een oplossing leiden.'),
        ],
      },
      thinkingSteps(group('q8')),
    ];
  };
})();
