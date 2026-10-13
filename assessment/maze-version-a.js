/* © 2026 Robbe Wulgaert · AI in de Klas · robbewulgaert.be.
 * Source: Toets Blockly Deel 1 - Maze - Permutatie B (2025-2026).
 * Version A is the digital adaptation, not a recovered paper permutation A.
 * Teacher configuration: change startPassword and Smartschool URLs before use.
 * The SEB quit password belongs ONLY in the .seb configuration.
 */
window.ASSESSMENT_CONFIG = {
  "id": "maze-deel-1",
  "version": "A",
  "schemaVersion": 1,
  "revision": "20261013-coding-nine",
  "title": "Toets Blockly · Maze",
  "subtitle": "Sequentie, selectie en voorwaardelijke herhaling",
  "startPassword": "Charles",
  "smartschoolUrl": "https://sintlievenscollege.smartschool.be/",
  "smartschoolFallbackUrl": "",
  "teacher": "Robbe Wulgaert",
  "totalPoints": 20,
  "durationMinutes": 45,
  "source": "Toets Blockly Deel 1 - Maze - Permutatie B (2025-2026)",
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
          "Code wordt in volgorde uitgevoerd of in ... (programmeerconcept 1)."
        ],
        [
          "JavaScript",
          "Als"
        ],
        [
          "Nederlands",
          "isPathRight"
        ],
        [
          "Nederlands",
          "else"
        ],
        [
          "Nederlands",
          "while"
        ],
        [
          "Nederlands",
          "isPathForward"
        ]
      ]
    },
    {
      "id": "q4",
      "title": "Programmeer de drie mazes",
      "points": 9,
      "type": "coding",
      "prompt": "Los elke maze op. Kies per oefening blokken of JavaScript. Volg de vereisten bij elke maze. Je leerkracht beoordeelt de werking, de gevraagde concepten en een duidelijke structuur. Schrijf JavaScript met correcte syntax en inspringingen."
    },
    {
      "id": "q5",
      "title": "Acties en voorwaarden",
      "points": 2,
      "type": "marking",
      "prompt": "Duid in de blokken van één willekeurig toegewezen maze uit vraag 2 de acties aan met GEEL en de voorwaarden met GROEN. Je JavaScript-antwoord wordt hier automatisch als blokken getoond."
    },
    {
      "id": "q6",
      "title": "Leg uit in eigen woorden",
      "points": 3,
      "type": "open",
      "prompt": "Leg de volgende begrippen uit in je eigen woorden.",
      "rows": [
        [
          "Begrip",
          "Algoritme"
        ],
        [
          "Begrip",
          "Syntax"
        ],
        [
          "Begrip",
          "Computationeel denken"
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
          "Patroonherkenning"
        ],
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
          "Algoritme ontwikkelen"
        ],
        [
          "Stap",
          "Decompositie"
        ]
      ]
    },
    {
      "id": "q8",
      "title": "Analyseer het programma",
      "points": 2,
      "type": "open",
      "prompt": "Bekijk de Pegman-maze uit level 3 en het programma hieronder. Analyseer het programma zonder het uit te voeren.",
      "asset": "assessment/assets/infinite-loop-a.png",
      "assetAlt": "Pegman level 3: het mannetje kijkt naar rechts in een rechte gang; het doel ligt vijf vakken verder naar rechts.",
      "referenceMaze": {
        "start": {
          "x": 1,
          "y": 4,
          "dir": 1
        },
        "goal": {
          "x": 6,
          "y": 4
        },
        "map": [
          "########",
          "########",
          "########",
          "########",
          "#......#",
          "########",
          "########",
          "########"
        ]
      },
      "codeSample": "while (notDone()) {\n  turnLeft();\n}",
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
    }
  ],
  "exercises": [
    {
      "id": "maze-1",
      "title": "Maze 1",
      "points": 3,
      "requirements": [
        "Gebruik een while-lus (herhaal zolang) om het terugkerende patroon te herhalen."
      ],
      "asset": "assessment/assets/maze-1.png",
      "start": {
        "x": 1,
        "y": 6,
        "dir": 1
      },
      "goal": {
        "x": 5,
        "y": 2
      },
      "map": [
        "#######.",
        "######..",
        "#####..#",
        "####..##",
        "###..###",
        "##..####",
        "#..#####",
        "#.######"
      ]
    },
    {
      "id": "maze-2",
      "title": "Maze 2",
      "points": 3,
      "asset": "assessment/assets/maze-2.png",
      "start": {
        "x": 1,
        "y": 6,
        "dir": 1
      },
      "goal": {
        "x": 5,
        "y": 6
      },
      "map": [
        "########",
        "########",
        "#....###",
        "#.##..##",
        "#...#.##",
        "###.#.##",
        "#...#.##"
      ]
    },
    {
      "id": "maze-3",
      "title": "Maze 3",
      "points": 3,
      "requirements": [
        "Gebruik een while-lus (herhaal zolang) met een if/else (als/anders) om keuzes te maken op basis van een padvoorwaarde."
      ],
      "asset": "assessment/assets/maze-3.png",
      "start": {
        "x": 5,
        "y": 6,
        "dir": 1
      },
      "goal": {
        "x": 0,
        "y": 3
      },
      "map": [
        "#######",
        "#.....#",
        "##.####",
        ".......",
        "#.#.#..",
        ".....#.",
        "#.#.#.."
      ]
    }
  ]
};
