/* Chapter 2 student configuration. No answer key. */
window.ASSESSMENT_CONFIG = {
  "schemaVersion": 1,
  "id": "chapter-2",
  "chapter": 2,
  "version": "C",
  "revision": "20261021-turtle-v1",
  "title": "Toets Blockly · Turtle",
  "subtitle": "Begrensde herhaling · start, eindgrens en interval",
  "totalPoints": 25,
  "durationMinutes": 45,
  "teacher": "Robbe Wulgaert",
  "startPassword": "Charles",
  "smartschoolUrl": "https://sintlievenscollege.smartschool.be/",
  "sourceSha256": "be6e56a12a9c62ad06691033aaacf188bd8ea988c84d208f9010f2c9202887c2",
  "source": "Eindtoets Blockly 2026-2027.pdf",
  "initialHeading": 90,
  "parameters": {
    "start": 6,
    "end": 18,
    "long": 80,
    "short": 40,
    "side": 40,
    "jump": 80,
    "direction": "right",
    "color": "#ffcc00",
    "radius": 40,
    "distance": 16,
    "colors": [
      "#ff0000",
      "#0177a7"
    ]
  },
  "groups": [
    {
      "id": "q1",
      "title": "Schrijf een for-lus",
      "points": 2,
      "type": "code",
      "prompt": "Noteer een for-lus met startgetal 6, eindgrens 18 en interval 1. De eindgrens is niet inbegrepen. Laat de lusinhoud leeg; let op de haakjes en accolades.",
      "answerId": "q1"
    },
    {
      "id": "q2",
      "title": "Van blokken naar een tekening",
      "points": 3,
      "type": "drawing",
      "prompt": "Bekijk de drie algoritmes. Teken telkens het resultaat zonder het algoritme uit te voeren. De turtle start met de pen omlaag en kijkt omhoog. De startplaats op je blad is vrij. Verhoudingen, aantal figuren en penbewegingen tellen mee.",
      "traces": [
        {
          "id": "q2a",
          "label": "2a",
          "instructions": [
            {
              "repeat": 2,
              "body": [
                "vooruit 80 pixels",
                "draai rechts 90°",
                "vooruit 40 pixels",
                "draai rechts 90°"
              ]
            }
          ]
        },
        {
          "id": "q2b",
          "label": "2b",
          "instructions": [
            {
              "repeat": 5,
              "body": [
                "vooruit 80 pixels",
                "draai rechts 72°"
              ]
            }
          ]
        },
        {
          "id": "q2c",
          "label": "2c",
          "instructions": [
            {
              "repeat": 3,
              "body": [
                {
                  "repeat": 5,
                  "body": [
                    "vooruit 40 pixels",
                    "draai rechts 72°"
                  ]
                },
                "pen omhoog",
                "vooruit 80 pixels",
                "pen omlaag"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "q3",
      "title": "Van figuur naar JavaScript",
      "points": 5,
      "type": "turtle-code",
      "prompt": "Schrijf JavaScript voor beide figuren. Gebruik begrensde herhaling met een for-lus: kies start, eindgrens en interval zelf. Je turtle start omhoog. Je leerkracht beoordeelt de volledige werking, leesbaarheid en het gebruik van de geleerde concepten en parameters.",
      "tasks": [
        {
          "id": "q3a",
          "label": "3a · Vijfhoek en losse lijn",
          "points": 2.5,
          "asset": "../../assets/target-c-polygon.png",
          "alt": "Een regelmatige vijfhoek met daarboven een losse verticale lijn; geen verbindingslijn.",
          "prompt": "Kleur #ffcc00. Alle vijf zijden en de losse lijn zijn 40 pixels lang. De losse lijn begint 40 pixels boven het bovenste linker hoekpunt. De vijfhoek wordt naar rechts getekend."
        },
        {
          "id": "q3b",
          "label": "3b · Twee cirkels",
          "points": 2.5,
          "asset": "../../assets/target-c-circles.png",
          "alt": "Twee overlappende gevulde cirkels: de tweede ligt schuin naar rechts onder de eerste.",
          "prompt": "Straal 40 pixels; eerste kleur #ff0000, tweede kleur #0177a7. Afstand tussen de middelpunten: 16 pixels. De sprong gaat 20° schuin naar rechts omlaag ten opzichte van de horizontale lijn. Draai bij het vullen van elke cirkel telkens 1°. Gebruik de geleerde voorwaartse en achterwaartse bewegingen en for-lussen."
        }
      ]
    },
    {
      "id": "q4",
      "title": "Herhaling: vertaal de termen",
      "points": 3,
      "type": "terms",
      "prompt": "Vertaal elke term naar het programmeerconcept of de JavaScript-instructie uit de les. Dit is herhaling van hoofdstuk 1.",
      "terms": [
        "Anders",
        "Zolang",
        "Draai naar rechts",
        "In volgorde",
        "Draai naar links",
        "Als"
      ]
    },
    {
      "id": "q5",
      "title": "Vind zes fouten",
      "points": 2,
      "type": "debug",
      "prompt": "Zoek zes verschillende fouten. Selecteer precies het foutieve stukje code en markeer je selectie; leg kort uit wat je zou veranderen. Je mag met Shift + pijltjestoetsen selecteren. Een ontbrekende optionele puntkomma is geen fout.",
      "codeSample": "For (var teller = 0; teller < 3; teller+) {\n  penCoulor(#ffcc00);\n  for (var inner = 0; inner < 5; teller++) {\n    moveForward(40);\n    turnright(72);\n  }\n  penUp();\n  moveForward(80);\n  penDown();\n}"
    },
    {
      "id": "q6",
      "title": "Verbeter de code",
      "points": 3,
      "type": "correction",
      "prompt": "Debug de volgende codefragmenten.",
      "rows": [
        "moveForward(80 pixels)",
        "Turnright(144);",
        "for(var teller 0; teller > 6; teller+)"
      ]
    },
    {
      "id": "q7",
      "title": "Leg de begrippen uit",
      "points": 2,
      "type": "definitions",
      "prompt": "Leg elk begrip in je eigen woorden uit. Schrijf duidelijke, volledige zinnen.",
      "terms": [
        "Computationeel denken",
        "Algoritme"
      ]
    },
    {
      "id": "q8",
      "title": "Het stappenplan",
      "points": 5,
      "type": "ct-table",
      "prompt": "Noteer de volgorde (1 tot en met 5). Vul de twee ontbrekende namen en de vier ontbrekende beschrijvingen in. Volgorde: 1 punt; ontbrekende namen: samen 1 punt; ontbrekende uitleg: samen 3 punten.",
      "rows": [
        {
          "id": "abstract",
          "name": "Abstraheren",
          "description": "",
          "order": ""
        },
        {
          "id": "debug",
          "name": "",
          "description": "Het herkennen van fouten in ons algoritme en die fouten oplossen.",
          "order": ""
        },
        {
          "id": "algorithm",
          "name": "Algoritme ontwerpen",
          "description": "",
          "order": ""
        },
        {
          "id": "pattern",
          "name": "Patroonherkenning",
          "description": "",
          "order": ""
        },
        {
          "id": "decompose",
          "name": "",
          "description": "",
          "order": ""
        }
      ]
    }
  ],
  "configSha256": "4484cfc27c8b926d49381053d90686939188c7710baef8d38307f5cd050ff585"
};
