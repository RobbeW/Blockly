/* © 2026 Robbe Wulgaert · AI in de Klas · robbewulgaert.be.
 * Source: Toets Blockly Deel 1 - Maze - Permutatie B (2025-2026).
 * Version A is the digital adaptation, not a recovered paper permutation A.
 * Teacher configuration: change startPassword and Smartschool URLs before use.
 * The SEB quit password belongs ONLY in the .seb configuration.
 */
window.ASSESSMENT_CONFIG = {
  id: 'maze-deel-1', version: 'A', schemaVersion: 1,
  title: 'Toets Blockly · Maze', subtitle: 'Sequentie, selectie en voorwaardelijke herhaling',
  startPassword: 'Charles',
  smartschoolUrl: 'https://sintlievenscollege.smartschool.be/', smartschoolFallbackUrl: '',
  teacher: 'Robbe Wulgaert', totalPoints: 25,
  durationMinutes: 45,
  source: 'Toets Blockly Deel 1 - Maze - Permutatie B (2025-2026)',
  groups: [
    {id:'q1', title:'Vertaaloefening', points:3, type:'short', prompt:'Vul het programmeerconcept aan en vertaal de termen in de tabellen.', parts:[
      {title:'1a. Vul het programmeerconcept aan',indices:[0],layout:'sentence'},
      {title:'1b. Vertaal naar JavaScript',indices:[1],givenLanguage:'Nederlands',answerLanguage:'JavaScript'},
      {title:'1c. Vertaal naar Nederlands',indices:[2,3,4,5],givenLanguage:'JavaScript',answerLanguage:'Nederlands'}],rows:[
      ['Programmeerconcept 1','Code wordt in volgorde uitgevoerd of in ... (programmeerconcept 1).'],['JavaScript','Als'],
      ['Nederlands','isPathRight'],['Nederlands','else'],['Nederlands','while'],['Nederlands','isPathForward']]},
    {id:'q2', title:'Debugging', points:3, type:'correction', prompt:'Schrijf de correcte versie van elk codefragment. Elk antwoord is 1 punt waard.', rows:[
      ['Codefragment','moveForward()'],['Codefragment','if (pathRight) {turnRight()}'],['Codefragment','While notDone() {if (pathleft) {turnleft();}']]},
    {id:'q3', title:'Lees het algoritme', points:1, type:'open', asset:'assessment/assets/program.png', prompt:'Schrijf in Nederlandse volzinnen wat het mannetje zal doen.', rows:[['Uitleg','Jouw uitleg']]},
    {id:'q4', title:'Programmeer de vier mazes', points:9, type:'coding', prompt:'Los elke maze op. Kies per oefening blokken of JavaScript. Volg de vereisten bij elke maze. Je leerkracht beoordeelt de werking, de gevraagde concepten en een duidelijke structuur. Schrijf JavaScript met correcte syntax en inspringingen.'},
    {id:'q5', title:'Acties en voorwaarden', points:2, type:'marking', prompt:'Duid in jouw definitieve antwoorden uit vraag 4 de acties aan met GEEL en de voorwaarden met GROEN. Kies een onderdeel hieronder om het te markeren.'},
    {id:'q6', title:'Leg uit in eigen woorden', points:3, type:'open', prompt:'Leg de volgende begrippen uit in je eigen woorden.', rows:[['Begrip','Algoritme'],['Begrip','Syntax'],['Begrip','Computationeel denken']]},
    {id:'q7', title:'Computationeel denken', points:1, type:'ordering', prompt:'Zet de stappen in de juiste volgorde. Gebruik de nummers 1 tot en met 5; 1 is de eerste stap.', rows:[['Stap','Patroonherkenning'],['Stap','Debuggen'],['Stap','Abstraheren'],['Stap','Algoritme ontwikkelen'],['Stap','Decompositie']]},
    {id:'q8', title:'De oneindige lus', points:2, type:'open', prompt:'Het mannetje kijkt naar rechts en staat recht voor een muur. Het doel ligt één vak onder het mannetje; dat vak is vrij. Analyseer dit programma zonder het uit te voeren.', codeSample:'while (notDone()) {\n  moveForward();\n}', rows:[
      ['Vraag','Waarom blijft dit programma herhalen? Leg uit wat er met de voorwaarde gebeurt. (0,5 punt)'],
      ['Vraag','Is dit een syntaxfout of een fout in het algoritme? Leg uit waarom. (0,5 punt)'],
      ['Vraag','Verbeter het programma zodat het mannetje het doel bereikt en stopt. Schrijf JavaScript of beschrijf precies welke blokken je zou gebruiken. (1 punt)']]},
    {id:'q9', title:'Binnen en buiten de lus', points:1, type:'open', prompt:'Neem aan dat de while-lus in dit programma precies drie keer wordt uitgevoerd. Beantwoord beide vragen.', codeSample:'turnRight();\nwhile (notDone()) {\n  moveForward();\n  turnLeft();\n}\nmoveForward();', rows:[
      ['Vraag','Welke instructies worden één keer uitgevoerd en welke drie keer? Maak onderscheid tussen de twee moveForward()-regels. (0,5 punt)'],
      ['Vraag','Wat verandert er als je de laatste moveForward(); verplaatst naar het einde van het blok binnen de while-lus? Houd voor deze vergelijking drie herhalingen aan. (0,5 punt)']]}
  ],
  exercises: [
    {id:'maze-1', title:'Maze 1', points:2, requirements:['Gebruik een while-lus (herhaal zolang) om het terugkerende patroon te herhalen.'], asset:'assessment/assets/maze-1.png', start:{x:1,y:6,dir:1}, goal:{x:5,y:2}, map:[
      '#######.','######..','#####..#','####..##','###..###','##..####','#..#####','#.######']},
    {id:'maze-2', title:'Maze 2', points:2, asset:'assessment/assets/maze-2.png', start:{x:1,y:6,dir:1}, goal:{x:5,y:6}, map:[
      '########','########','#....###','#.##..##','#...#.##','###.#.##','#...#.##']},
    {id:'maze-3', title:'Maze 3', points:2, requirements:['Gebruik een while-lus (herhaal zolang) met een if/else (als/anders) om keuzes te maken op basis van een padvoorwaarde.'], asset:'assessment/assets/maze-3.png', start:{x:5,y:6,dir:1}, goal:{x:0,y:3}, map:[
      '#######','#.....#','##.####','.......','#.#.#..','.....#.','#.#.#..']},
    {id:'maze-4', title:'Maze 4', points:3, explanationPrompt:'Waarom werkt jouw algoritme? Leg uit welk patroon je herkent, welke keuzes of herhalingen je gebruikt en waarom je oplossing bij het doel stopt.', asset:'assessment/assets/maze-4.png', start:{x:5,y:6,dir:1}, goal:{x:2,y:1}, map:[
      '#######','#.....#','##.####','.......','#.#.#..','.....#.','#.#.#..']}
  ]
};
