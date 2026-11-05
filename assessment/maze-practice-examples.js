/* Fictional A/B worked examples informed by the four-class Maze C review. */
(function () {
  'use strict';

  const sample = (answer, score, feedback) => ({ answer, score, feedback });
  const fields = (labels, answers) => labels.map((label, i) => [label, answers[i]]);
  const lines = entries => entries.join('\n');

  function coding(config, mirrored) {
    const turnIn = mirrored ? 'turnRight();' : 'turnLeft();';
    const turnOut = mirrored ? 'turnLeft();' : 'turnRight();';
    const move = 'moveForward();';
    const makeCode = (code, working, readability, concepts, maxWorking, maxConcepts, comments) =>
      AssessmentPractice.scored(code, [
        ['Functioneel', working, maxWorking, comments[0]],
        ['Leesbaar', readability, 0.5, comments[1]],
        ['Programmeerconcepten', concepts, maxConcepts, comments[2]],
      ]);
    const maze1 = (code, working, readability, concepts, ...comments) =>
      makeCode(code, working, readability, concepts, 0.5, 2, comments);
    const maze2 = (code, working, readability, concepts, ...comments) =>
      makeCode(code, working, readability, concepts, 1.75, 0.75, comments);

    const staircase = condition => lines([
      `while (${condition}) {`, `  ${move}`, `  ${turnIn}`, `  ${move}`, `  ${turnOut}`, '}',
    ]);
    const route = Array.from('FFLFFLFFRFFRFFFRFLFRFFF', action => ({ F: move, L: turnIn, R: turnOut })[action]);
    const examples = [
      [
        maze1(staircase('notDone()'), 0.5, 0.5, 2,
          'Pegman volgt de trap en stopt op het doel.',
          'Elke opdracht staat op een eigen regel. Inspringing toont welke opdrachten herhalen.',
          'De while-lus herhaalt het hele patroon. notDone() controleert of Pegman klaar is.'),
        maze1(staircase('isPathAhead()'), 0, 0.5, 1,
          'De route stopt niet op het doel. Daar is nog een pad rechtdoor.',
          'De herhaalde stappen zijn gemakkelijk te volgen.',
          'Het patroon zit in een bruikbare lus. De conditie test de weg voor je in plaats van het doel.'),
        maze1(`${move} ${turnIn}`, 0, 0.25, 0,
          'Een stap en een draai brengen Pegman maar een klein deel van de weg.',
          'De acties zijn herkenbaar. Zet elke actie op een eigen regel.',
          'Het trapmotief wordt nergens herhaald met while.'),
      ],
      [
        maze2(lines(route), 1.75, 0.5, 0.75,
          'De reeks bereikt het doel en eindigt daar.',
          'De afzonderlijke stappen en bochten zijn eenvoudig te volgen.',
          'De reeks plant de volledige route. Voor deze maze mag je alle acties uitschrijven.'),
        maze2(lines(route.slice(0, -4)), 0, 0.5, 0.5,
          'Pegman stopt vóór het doel.',
          'Elke actie staat op een eigen regel.',
          'Bijna de hele route klopt. De laatste bocht en het laatste rechte stuk ontbreken.'),
        maze2(turnOut, 0, 0.5, 0,
          'Pegman verandert enkel van richting en bereikt het doel niet.',
          'Het commando is duidelijk opgeschreven.',
          'Eén draai vormt hier geen plan naar het doel.'),
      ],
      [
        maze1(lines(['while (notDone()) {', '  if (isPathAhead()) {', `    ${move}`, '  } else {', `    ${turnIn}`, '  }', '}']), 0.5, 0.5, 2,
          'Pegman draait bij een muur, bereikt het doel en stopt.',
          'Inspringing maakt zichtbaar welke acties bij if en else horen.',
          'While en de twee takken van if/else werken samen. De padvoorwaarde bepaalt de actie.'),
        maze1(lines(['while (notDone()) {', '  if (isPathAhead()) {', `    ${move}`, '  }', '}']), 0, 0.5, 1,
          'Bij de eerste muur wacht Pegman in de lus en geraakt het niet verder.',
          'De structuur van de lus en de keuze is duidelijk.',
          'Er is een lus met een padvoorwaarde. De else-tak met een draai ontbreekt.'),
        maze1(`while (notDone) { ${move} }`, 0, 0.25, 0,
          'Pegman rijdt tegen een muur en blijft proberen vooruit te gaan.',
          'De instructie is herkenbaar. Schrijf de inhoud van de lus op een eigen, ingesprongen regel.',
          'Zonder haakjes wordt notDone niet uitgevoerd. Er is ook geen keuze bij een muur.'),
      ],
    ];

    return config.exercises.map((exercise, i) => ({
      title: `Vraag 2 · ${exercise.title}`,
      prompt: exercise.requirements?.[0] || 'Programmeer de route naar het doel. Je mag een vaste reeks acties of een lus gebruiken.',
      image: { src: exercise.asset, alt: `${exercise.title} met startpunt en doel` },
      referenceLabel: 'Bekijk de maze',
      max: exercise.points,
      examples: examples[i],
    }));
  }

  window.AssessmentPracticeExamples = config => {
    const group = id => config.groups.find(entry => entry.id === id);
    const mirrored = config.version === 'B';
    const turns = mirrored ? 'rechts' : 'links';
    const translateLabels = group('q1').rows.map((row, i) => i === 0 ? 'Programmeerconcept 1' : row[1]);
    const translation = (answers, score, feedback) => sample(fields(translateLabels, answers), score, feedback);
    const orderLabels = group('q7').rows.map(row => row[1]);
    const order = values => orderLabels.map(label => values[label]);
    const steps = {
      Decompositie: 1, Patroonherkenning: 2, Abstraheren: 3, 'Algoritme ontwikkelen': 4, Debuggen: 5,
    };
    const definition = (answers, score, feedback) =>
      sample(fields(['Algoritme', 'Syntax met voorbeeld', 'Computationeel denken'], answers), score, feedback);
    const analysis = (answers, score, feedback) =>
      sample(fields(['Gedrag', 'Soort fout', 'Verbetering'], answers), score, feedback);

    return [
      {
        title: 'Vraag 1 · Vertaaloefening',
        prompt: 'Benoem programmeerconcept 1 en vertaal de termen uit de tabel.',
        max: 3,
        examples: [
          translation(mirrored
            ? ['Sequentie', 'turnRight()', 'Is er een pad vooruit?', 'Als', 'Zolang', 'Nog niet klaar?']
            : ['Sequentie', 'if', 'Is er een pad rechts?', 'Anders', 'Zolang', 'Is er een pad vooruit?'],
          3, 'Alle zes antwoorden kloppen. Een padvoorwaarde stelt een vraag waarop het antwoord ja of nee is.'),
          translation(mirrored
            ? ['Algoritme', 'turnRight()', 'Ga vooruit', 'Als', 'Zolang', 'Nog niet klaar?']
            : ['Algoritme', 'if', 'Draai rechts', 'Anders', 'Zolang', 'Is er een pad vooruit?'],
          2, 'Vier vertalingen kloppen. Het concept heet sequentie. Een pad checken is iets anders dan bewegen of draaien.'),
          translation(mirrored
            ? ['JavaScript', 'turnLeft()', 'Stap vooruit', 'Anders', 'Zolang', 'Start opnieuw']
            : ['JavaScript', 'else', 'Draai rechts', 'Als', 'Zolang', 'Stap vooruit'],
          0.5, 'Alleen zolang klopt. Zoek eerst uit of de term een actie, een vraag over het pad of een keuze uitdrukt.'),
        ],
      },
      ...coding(config, mirrored),
      {
        title: 'Vraag 3 · Acties en voorwaarden',
        prompt: 'Welke markeringen zou je zetten in dit voorbeeldprogramma?',
        reference: lines(['1  while (notDone()) {', '2    moveForward();', `3    turn${mirrored ? 'Right' : 'Left'}();`,
          '4    moveForward();', `5    turn${mirrored ? 'Left' : 'Right'}();`, '   }']),
        referenceLabel: 'Bekijk de vijf regels',
        max: 2,
        examples: [
          sample([['Geel · Acties', 'De opdrachten op regel 2, 3, 4 en 5'], ['Groen · Voorwaarden', 'Alleen notDone() op regel 1']],
            2, 'Vier acties en één voorwaarde zijn correct gemarkeerd. Het while-omhulsel krijgt geen kleur.'),
          sample([['Geel · Acties', 'Regel 2 en 4'], ['Groen · Voorwaarden', 'notDone() op regel 1']],
            1.25, 'Drie van de vijf markeringen kloppen. De twee draaicommando’s zijn ook acties.'),
          sample([['Geel · Acties', 'notDone() op regel 1'], ['Groen · Voorwaarden', `Draai ${turns} op regel 3`]],
            0, 'De kleuren zijn omgewisseld. Draaien is een actie. notDone() levert het antwoord op een vraag.'),
        ],
      },
      {
        title: 'Vraag 4 · Leg uit in eigen woorden',
        prompt: group('q6').prompt,
        max: 3,
        examples: [
          definition([
            'Een algoritme is een reeks duidelijke stappen in een bepaalde volgorde waarmee je een doel bereikt.',
            'Syntax zijn de schrijfregels van een programmeertaal. JavaScript maakt bijvoorbeeld onderscheid tussen turnLeft en turnleft.',
            'Je onderzoekt een probleem stap voor stap, bijvoorbeeld door het op te delen. Zo kan je een oplossing maken die iemand of een computer kan uitvoeren.',
          ], 3, 'Elke uitleg benoemt de kern. Het syntaxvoorbeeld laat een concrete schrijfregel zien.'),
          definition([
            'Een algoritme is een stappenplan.',
            'Syntax is hoe je code moet schrijven.',
            'Bij computationeel denken verdeel je een groot probleem in kleinere stukken.',
          ], 1.5, 'Je noemt een kernidee per begrip. Leg ook uit waarvoor de stappen dienen, geef een concreet syntaxvoorbeeld en vertel wat je met de kleinere stukken bereikt.'),
          definition([
            'Een algoritme is de naam van een programmeertaal.',
            'Syntax bepaalt hoe snel een computer draait.',
            'Je denkt zoals een computer.',
          ], 0, 'Maak elk begrip concreet. Denk aan een doel met uitvoerbare stappen, aan schrijfregels en aan een methode om problemen op te lossen.'),
        ],
      },
      {
        title: 'Vraag 5 · Computationeel denken',
        prompt: group('q7').prompt,
        max: 1,
        examples: [
          sample(fields(orderLabels, order(steps)), 1, 'Eerst deel je op en herken je patronen. Dan kies je de hoofdzaken, ontwerp je een stappenplan en verbeter je fouten.'),
          sample(fields(orderLabels, order({ ...steps, Debuggen: 4, 'Algoritme ontwikkelen': 5 })), 0.6,
            'De eerste drie stappen kloppen. Je moet eerst een algoritme hebben voordat je er fouten in kunt opsporen.'),
          sample(fields(orderLabels, order({ ...steps, Decompositie: 2, Patroonherkenning: 3, Abstraheren: 4, 'Algoritme ontwikkelen': 5, Debuggen: 1 })), 0,
            'Alle nummers zijn gebruikt, maar geen positie klopt. Begin bij het opdelen van het probleem en eindig met debuggen.'),
        ],
      },
      {
        title: 'Vraag 6 · Analyseer het programma',
        prompt: group('q8').prompt,
        reference: group('q8').codeSample,
        image: { src: group('q8').asset, alt: 'Pegman en het doel op een recht pad' },
        max: 2,
        examples: [
          analysis([
            'Pegman blijft op dezelfde plek linksom draaien. Daardoor bereikt het zijn doel nooit.',
            'Het is een fout in het algoritme. De code kan draaien, maar de opdracht brengt Pegman niet naar het doel.',
            'while (notDone()) {\n  moveForward();\n}',
          ], 2, 'Je verklaart zowel het gedrag als de foutsoort. De nieuwe actie brengt Pegman vooruit en de conditie zorgt dat het stopt.'),
          analysis([
            'Pegman bereikt het doel nooit.',
            'Het is een fout in het algoritme.',
            'Laat Pegman vooruitgaan in plaats van draaien.',
          ], 1, 'Je hebt de richting van de verbetering. Leg het draaien op de plaats uit, motiveer waarom de syntax geldig is en maak de stopvoorwaarde concreet.'),
          analysis([
            'Pegman stapt naar links.',
            'Het is een syntaxfout omdat de computer naar links draait.',
            'while (notDone()) {\n  turnRight();\n}',
          ], 0, 'Draaien verplaatst Pegman niet. Linksom en rechtsom blijven draaien leveren dezelfde logische fout op.'),
        ],
      },
    ];
  };
})();
