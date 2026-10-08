/* © 2026 Robbe Wulgaert · AI in de Klas · robbewulgaert.be.
 * Digital variation C of the Blockly Maze assessment. Based on syllabus pp. 1–32;
 * this is not a recovered historical paper permutation. Keep student config free
 * of model answers and solution programs. */
window.ASSESSMENT_CONFIG = {
  "id": "maze-deel-1",
  "version": "C",
  "schemaVersion": 1,
  "title": "Toets Blockly · Maze",
  "subtitle": "Sequentie, selectie en voorwaardelijke herhaling",
  "startPassword": "Charles",
  "smartschoolUrl": "https://sintlievenscollege.smartschool.be/",
  "smartschoolFallbackUrl": "",
  "teacher": "Robbe Wulgaert",
  "totalPoints": 25,
  "durationMinutes": 45,
  "source": "Digitale variatie C op basis van dezelfde leerstof (syllabus pp. 1–32); geen historische papieren permutatie.",
  "groups": [
    {
      "id": "q1",
      "title": "Vertaaloefening",
      "points": 3,
      "type": "short",
      "prompt": "Vul het programmeerconcept aan en vertaal de termen in de tabellen.",
      "parts": [
        {
          "title": "1a. Vul het programmeerconcept aan",
          "indices": [
            0
          ],
          "layout": "sentence"
        },
        {
          "title": "1b. Vertaal naar JavaScript",
          "indices": [
            1
          ],
          "givenLanguage": "Nederlands",
          "answerLanguage": "JavaScript"
        },
        {
          "title": "1c. Vertaal naar Nederlands",
          "indices": [
            2,
            3,
            4,
            5
          ],
          "givenLanguage": "JavaScript",
          "answerLanguage": "Nederlands"
        }
      ],
      "rows": [
        [
          "Programmeerconcept 1",
          "Bij ... is de volgorde waarin instructies worden uitgevoerd belangrijk. (programmeerconcept 1)"
        ],
        [
          "JavaScript",
          "Draai links"
        ],
        [
          "Nederlands",
          "isPathRight"
        ],
        [
          "Nederlands",
          "while"
        ],
        [
          "Nederlands",
          "else"
        ],
        [
          "Nederlands",
          "isPathLeft"
        ]
      ]
    },
    {
      "id": "q2",
      "title": "Debugging",
      "points": 3,
      "type": "correction",
      "prompt": "Schrijf de correcte versie van elk codefragment. Elk antwoord is 1 punt waard.",
      "rows": [
        [
          "Codefragment",
          "moveForwad();"
        ],
        [
          "Codefragment",
          "if isPathAhead() { turnLeft(); }"
        ],
        [
          "Codefragment",
          "while (notdone()) { if (isPathLeft) { turnleft(); } }"
        ]
      ]
    },
    {
      "id": "q3",
      "title": "Lees het algoritme",
      "points": 1,
      "type": "open",
      "asset": "assessment/assets/program-c.png",
      "prompt": "Schrijf in Nederlandse volzinnen wat het mannetje zal doen.",
      "rows": [
        [
          "Uitleg",
          "Jouw uitleg"
        ]
      ]
    },
    {
      "id": "q4",
      "title": "Programmeer de vier mazes",
      "points": 9,
      "type": "coding",
      "prompt": "Los elke maze op. Kies per oefening blokken of JavaScript. Volg de vereisten bij elke maze. Je leerkracht beoordeelt de werking, de gevraagde concepten en een duidelijke structuur. Schrijf JavaScript met correcte syntax en inspringingen."
    },
    {
      "id": "q5",
      "title": "Acties en voorwaarden",
      "points": 2,
      "type": "marking",
      "prompt": "Duid in jouw definitieve antwoorden uit vraag 4 de acties aan met GEEL en de voorwaarden met GROEN. Kies een onderdeel hieronder om het te markeren."
    },
    {
      "id": "q6",
      "title": "Leg uit in eigen woorden",
      "points": 3,
      "type": "open",
      "prompt": "Leg elk begrip uit met een eigen voorbeeld of toepassing.",
      "rows": [
        [
          "Begrip",
          "Leg uit wat een algoritme is. Beschrijf kort een stappenplan om een nieuw computerspel te starten."
        ],
        [
          "Begrip",
          "Leg uit wat syntax betekent. Geef een voorbeeld van hoe hoofdletters, haakjes of leestekens code geldig maken."
        ],
        [
          "Begrip",
          "Leg uit wat computationeel denken betekent. Geef een voorbeeld van hoe je de belangrijke informatie uit een probleem kiest."
        ]
      ]
    },
    {
      "id": "q7",
      "title": "Computationeel denken",
      "points": 1,
      "type": "ordering",
      "prompt": "Zet de stappen in de juiste volgorde. Gebruik de nummers 1 tot en met 5; 1 is de eerste stap.",
      "rows": [
        [
          "Stap",
          "Debuggen"
        ],
        [
          "Stap",
          "Abstraheren"
        ],
        [
          "Stap",
          "Decompositie"
        ],
        [
          "Stap",
          "Patroonherkenning"
        ],
        [
          "Stap",
          "Algoritme ontwikkelen"
        ]
      ]
    },
    {
      "id": "q8",
      "title": "Analyseer het programma",
      "points": 2,
      "type": "open",
      "prompt": "In een klein raster is S de start, G het doel en # een muur: ### / #SG / ###. Het mannetje kijkt naar boven (noord); het vak vóór hem is een muur. Het doel ligt één vrij vak rechts van hem. Analyseer dit programma zonder het uit te voeren.",
      "codeSample": "while (notDone()) {\n  moveForward();\n}",
      "rows": [
        [
          "Vraag",
          "Wat gebeurt er wanneer de computer dit programma uitvoert? Beschrijf het gedrag van het mannetje en leg uit welk probleem je vaststelt. (0,5 punt)"
        ],
        [
          "Vraag",
          "Is dit een syntaxfout of een fout in het algoritme? Leg uit waarom. (0,5 punt)"
        ],
        [
          "Vraag",
          "Verbeter het programma zodat het mannetje het doel bereikt en stopt. Schrijf JavaScript of beschrijf precies welke blokken je zou gebruiken. (1 punt)"
        ]
      ]
    },
    {
      "id": "q9",
      "title": "Binnen en buiten de lus",
      "points": 1,
      "type": "loop-boundary",
      "prompt": "Bouw met blokken een algoritme voor deze maze, gebaseerd op level 5. Gebruik een while-lus (herhaal zolang) en test je oplossing. Markeer daarna elk actieblok: wordt het één keer uitgevoerd buiten de lus, of herhaald in de lus?",
      "asset": "assessment/assets/loop-boundary-c.png",
      "assetAlt": "Pegman-maze met een aanloop, een bocht en een rechte gang naar het doel.",
      "referenceMaze": {
        "map": [
          "########",
          "##...###",
          "##.#####",
          "##.#####",
          "##.#####",
          "##.#####",
          "##.#####",
          "########"
        ],
        "start": {
          "x": 4,
          "y": 1,
          "dir": 3
        },
        "goal": {
          "x": 2,
          "y": 6
        }
      }
    }
  ],
  "exercises": [
    {
      "id": "maze-1",
      "title": "Maze 1",
      "points": 2,
      "requirements": [
        "Gebruik een while-lus (herhaal zolang) om het terugkerende patroon te herhalen."
      ],
      "asset": "assessment/assets/maze-c-1.png",
      "start": {
        "x": 6,
        "y": 1,
        "dir": 3
      },
      "goal": {
        "x": 2,
        "y": 5
      },
      "map": [
        "######.#",
        "#####..#",
        "####..##",
        "###..###",
        "##..####",
        "#..#####",
        "..######",
        ".#######"
      ]
    },
    {
      "id": "maze-2",
      "title": "Maze 2",
      "points": 2,
      "asset": "assessment/assets/maze-c-2.png",
      "start": {
        "x": 6,
        "y": 0,
        "dir": 3
      },
      "goal": {
        "x": 2,
        "y": 0
      },
      "map": [
        "##.#...#",
        "##.#.###",
        "##.#...#",
        "##..##.#",
        "###....#",
        "########",
        "########"
      ]
    },
    {
      "id": "maze-3",
      "title": "Maze 3",
      "points": 2,
      "requirements": [
        "Gebruik een while-lus (herhaal zolang) met een if/else (als/anders) om keuzes te maken op basis van een padvoorwaarde."
      ],
      "asset": "assessment/assets/maze-c-3.png",
      "start": {
        "x": 1,
        "y": 0,
        "dir": 3
      },
      "goal": {
        "x": 6,
        "y": 3
      },
      "map": [
        "..#.#.#",
        ".#.....",
        "..#.#.#",
        ".......",
        "####.##",
        "#.....#",
        "#######"
      ]
    },
    {
      "id": "maze-4",
      "title": "Maze 4",
      "points": 3,
      "explanationPrompt": "Waarom werkt jouw algoritme? Leg uit welk patroon je herkent, welke keuzes of herhalingen je gebruikt en waarom je oplossing bij het doel stopt.",
      "asset": "assessment/assets/maze-c-4.png",
      "start": {
        "x": 1,
        "y": 0,
        "dir": 3
      },
      "goal": {
        "x": 4,
        "y": 5
      },
      "map": [
        "..#.#.#",
        ".#.....",
        "..#.#.#",
        ".......",
        "####.##",
        "#.....#",
        "#######"
      ]
    }
  ]
};
