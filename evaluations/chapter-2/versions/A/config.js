window.ASSESSMENT_CONFIG = {
  "schemaVersion": 1,
  "id": "chapter-2",
  "chapter": 2,
  "version": "A",
  "revision": "20261105-turtle-v4",
  "title": "Toets Blockly · Turtle",
  "subtitle": "Begrensde herhaling · start, eindgrens en interval",
  "totalPoints": 23,
  "durationMinutes": 40,
  "teacher": "Robbe Wulgaert",
  "startPassword": "Charles",
  "smartschoolUrl": "https://sintlievenscollege.smartschool.be/",
  "sourceSha256": "be6e56a12a9c62ad06691033aaacf188bd8ea988c84d208f9010f2c9202887c2",
  "source": "Eindtoets Blockly 2026-2027.pdf",
  "initialHeading": 90,
  "parameters": {
    "start": 5,
    "end": 17,
    "long": 100,
    "short": 50,
    "side": 50,
    "jump": 100,
    "direction": "right",
    "color": "#c2410c",
    "radius": 50,
    "distance": 20,
    "colors": [
      "#ff0000",
      "#0177a7"
    ],
    "gap": 25,
    "stairStart": 20,
    "stairEnd": 80,
    "stairStep": 20
  },
  "groups": [
    {
      "id": "q1",
      "title": "Schrijf een for-lus",
      "points": 2,
      "type": "code",
      "prompt": "Noteer een for-lus met startgetal 5, eindgrens 17 en interval 1. De eindgrens is niet inbegrepen. Laat de lusinhoud leeg; let op de haakjes en accolades.",
      "answerId": "q1"
    },
    {
      "id": "q2",
      "title": "Lees de blokken en kies de figuur",
      "points": 3,
      "type": "trace-choice",
      "prompt": "Lees elk algoritme zonder het uit te voeren. Kies de passende figuur en tel hoeveel rechte lijnstukken met de pen omlaag worden getekend. Het paarse punt is Start (0, 0); de pijl wijst omhoog. Je hoeft niet zelf te tekenen.",
      "traces": [
        {
          "id": "q2a",
          "label": "2a",
          "instructions": [
            {
              "repeat": 2,
              "body": [
                "vooruit 100 pixels",
                "draai rechts 90°",
                "vooruit 50 pixels",
                "draai rechts 90°"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Een open figuur met vier schuin aansluitende lijnstukken.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 43.30127,
                    "y2": 125,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 43.30127,
                    "y1": 125,
                    "x2": 129.903811,
                    "y2": 75,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 129.903811,
                    "y1": 75,
                    "x2": 129.903811,
                    "y2": 25,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 129.90381056766583,
                  "y": 25,
                  "heading": -150,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Een gesloten rechthoek met twee lange en twee korte zijden.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 50,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 100,
                    "x2": 50,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 1.4210854715202004e-14,
                  "y": -6.123233995736766e-15,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "C",
              "alt": "Een gesloten vierkant met vier even lange zijden.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 100,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 100,
                    "y1": 100,
                    "x2": 100,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 100,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 0,
                  "y": -1.2246467991473532e-14,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Een open figuur met twee loodrechte lijnstukken.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 50,
                    "y2": 100,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 50.00000000000001,
                  "y": 100,
                  "heading": 0,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
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
                "vooruit 100 pixels",
                "draai rechts 72°"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Een gesloten gelijkzijdige driehoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 86.60254,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 86.60254,
                    "y1": 50,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 0,
                  "y": 1.4210854715202004e-14,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Vier zijden van een nog niet gesloten vijfhoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 95.105652,
                    "y2": 130.901699,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 95.105652,
                    "y1": 130.901699,
                    "x2": 153.884177,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 153.884177,
                    "y1": 50,
                    "x2": 95.105652,
                    "y2": -30.901699,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 95.10565162951536,
                  "y": -30.901699437494756,
                  "heading": -198,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "C",
              "alt": "Een gesloten regelmatige zeshoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 86.60254,
                    "y2": 150,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 86.60254,
                    "y1": 150,
                    "x2": 173.205081,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 173.205081,
                    "y1": 100,
                    "x2": 173.205081,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 173.205081,
                    "y1": 0,
                    "x2": 86.60254,
                    "y2": -50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 86.60254,
                    "y1": -50,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 1.4210854715202004e-14,
                  "y": 2.1316282072803006e-14,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Een gesloten regelmatige vijfhoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 95.105652,
                    "y2": 130.901699,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 95.105652,
                    "y1": 130.901699,
                    "x2": 153.884177,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 153.884177,
                    "y1": 50,
                    "x2": 95.105652,
                    "y2": -30.901699,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 95.105652,
                    "y1": -30.901699,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 1.4210854715202004e-14,
                  "y": 1.7763568394002505e-14,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
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
                    "vooruit 50 pixels",
                    "draai rechts 72°"
                  ]
                },
                "pen omhoog",
                "vooruit 100 pixels",
                "pen omlaag"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Drie losse vijfhoeken boven elkaar, zonder verbindingslijnen.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 50,
                    "x2": 47.552826,
                    "y2": 65.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 65.45085,
                    "x2": 76.942088,
                    "y2": 25,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 25,
                    "x2": 47.552826,
                    "y2": -15.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": -15.45085,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 0,
                    "y2": 150,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 150,
                    "x2": 47.552826,
                    "y2": 165.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 165.45085,
                    "x2": 76.942088,
                    "y2": 125,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 125,
                    "x2": 47.552826,
                    "y2": 84.54915,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 84.54915,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 200,
                    "x2": 0,
                    "y2": 250,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 250,
                    "x2": 47.552826,
                    "y2": 265.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 265.45085,
                    "x2": 76.942088,
                    "y2": 225,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 225,
                    "x2": 47.552826,
                    "y2": 184.54915,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 184.54915,
                    "x2": 0,
                    "y2": 200,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -3.96859840600133e-14,
                  "y": 300,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Twee losse vijfhoeken boven elkaar.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 50,
                    "x2": 47.552826,
                    "y2": 65.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 65.45085,
                    "x2": 76.942088,
                    "y2": 25,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 25,
                    "x2": 47.552826,
                    "y2": -15.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": -15.45085,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 0,
                    "y2": 150,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 150,
                    "x2": 47.552826,
                    "y2": 165.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 165.45085,
                    "x2": 76.942088,
                    "y2": 125,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 125,
                    "x2": 47.552826,
                    "y2": 84.54915,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 84.54915,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -2.54751293448113e-14,
                  "y": 200,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "C",
              "alt": "Drie losse vierkanten boven elkaar.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 50,
                    "x2": 50,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 50,
                    "x2": 50,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 0,
                    "y2": 150,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 150,
                    "x2": 50,
                    "y2": 150,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 150,
                    "x2": 50,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 100,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 200,
                    "x2": 0,
                    "y2": 250,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 250,
                    "x2": 50,
                    "y2": 250,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 250,
                    "x2": 50,
                    "y2": 200,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 50,
                    "y1": 200,
                    "x2": 0,
                    "y2": 200,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -7.521312084801831e-14,
                  "y": 300,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Drie vijfhoeken boven elkaar met verbindingslijnen.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 50,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 50,
                    "x2": 47.552826,
                    "y2": 65.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 65.45085,
                    "x2": 76.942088,
                    "y2": 25,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 25,
                    "x2": 47.552826,
                    "y2": -15.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": -15.45085,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 0,
                    "y2": 150,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 150,
                    "x2": 47.552826,
                    "y2": 165.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 165.45085,
                    "x2": 76.942088,
                    "y2": 125,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 125,
                    "x2": 47.552826,
                    "y2": 84.54915,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 84.54915,
                    "x2": 0,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 100,
                    "x2": 0,
                    "y2": 200,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 200,
                    "x2": 0,
                    "y2": 250,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 250,
                    "x2": 47.552826,
                    "y2": 265.45085,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 265.45085,
                    "x2": 76.942088,
                    "y2": 225,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.942088,
                    "y1": 225,
                    "x2": 47.552826,
                    "y2": 184.54915,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 47.552826,
                    "y1": 184.54915,
                    "x2": 0,
                    "y2": 200,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 200,
                    "x2": 0,
                    "y2": 300,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -3.96859840600133e-14,
                  "y": 300,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
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
      "prompt": "Programmeer beide figuren met JavaScript en for-lussen. Start bij (0, 0) en volg de pijl omhoog. Kies passende startwaarden, eindgrenzen en intervallen. Voer je code uit en vergelijk jouw tekening met het doel. De preview geeft geen punten. De kleur van de lijnen telt niet mee.",
      "tasks": [
        {
          "id": "q3a",
          "label": "3a · Twee losse vierkanten",
          "points": 2.5,
          "alt": "Twee losse vierkanten naar rechts, met een startpijl omhoog.",
          "prompt": "Teken twee vierkanten. Elke zijde is 50 pixels. De ruimte tussen de vierkanten is 25 pixels. Teken ze naar rechts van het startpunt. Er mag geen verbindingslijn zijn. Gebruik for-lussen voor de zijden en pen omhoog/omlaag om te verplaatsen.",
          "figure": {
            "segments": [
              {
                "x1": 0,
                "y1": 0,
                "x2": 0,
                "y2": 50,
                "color": "#000000"
              },
              {
                "x1": 0,
                "y1": 50,
                "x2": 50,
                "y2": 50,
                "color": "#000000"
              },
              {
                "x1": 50,
                "y1": 50,
                "x2": 50,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 50,
                "y1": 0,
                "x2": 0,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 75,
                "y1": 0,
                "x2": 75,
                "y2": 50,
                "color": "#000000"
              },
              {
                "x1": 75,
                "y1": 50,
                "x2": 125,
                "y2": 50,
                "color": "#000000"
              },
              {
                "x1": 125,
                "y1": 50,
                "x2": 125,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 125,
                "y1": 0,
                "x2": 75,
                "y2": 0,
                "color": "#000000"
              }
            ],
            "turtle": {
              "x": 150,
              "y": -1.3228661353337769e-14,
              "heading": 90,
              "pen": true,
              "color": "#000000"
            }
          },
          "inspiration": "Blockly Turtle: vierkant en meerdere vormen"
        },
        {
          "id": "q3b",
          "label": "3b · Vier zeshoeken",
          "points": 2.5,
          "alt": "Vier losse regelmatige zeshoeken in een rooster van twee bij twee, met een startpijl omhoog.",
          "prompt": "Teken vier losse regelmatige zeshoeken in een rooster van twee bij twee. Elke zijde is 20 pixels. Begin linksonder bij (0, 0), met de pijl omhoog. De startpunten liggen 100 pixels uit elkaar: twee naast elkaar en twee daarboven. Draai na elke zijde 60 graden naar rechts. Verplaats met de pen omhoog, zonder verbindingslijnen. Gebruik een for-lus voor de zes zijden en minstens één extra for-lus om zeshoeken te herhalen.",
          "figure": {
            "segments": [
              {
                "x1": 0,
                "y1": 0,
                "x2": 1.2246467991473533e-15,
                "y2": 20,
                "color": "#000000"
              },
              {
                "x1": 1.2246467991473533e-15,
                "y1": 20,
                "x2": 17.320508075688775,
                "y2": 30,
                "color": "#000000"
              },
              {
                "x1": 17.320508075688775,
                "y1": 30,
                "x2": 34.64101615137755,
                "y2": 20,
                "color": "#000000"
              },
              {
                "x1": 34.64101615137755,
                "y1": 20,
                "x2": 34.64101615137755,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 34.64101615137755,
                "y1": 0,
                "x2": 17.320508075688775,
                "y2": -9.999999999999998,
                "color": "#000000"
              },
              {
                "x1": 17.320508075688775,
                "y1": -9.999999999999998,
                "x2": 3.552713678800501e-15,
                "y2": 3.552713678800501e-15,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 3.552713678800501e-15,
                "x2": 100,
                "y2": 20.000000000000004,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 20.000000000000004,
                "x2": 117.32050807568878,
                "y2": 30,
                "color": "#000000"
              },
              {
                "x1": 117.32050807568878,
                "y1": 30,
                "x2": 134.64101615137756,
                "y2": 20,
                "color": "#000000"
              },
              {
                "x1": 134.64101615137756,
                "y1": 20,
                "x2": 134.64101615137756,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 134.64101615137756,
                "y1": 0,
                "x2": 117.32050807568878,
                "y2": -9.999999999999998,
                "color": "#000000"
              },
              {
                "x1": 117.32050807568878,
                "y1": -9.999999999999998,
                "x2": 100,
                "y2": 3.552713678800501e-15,
                "color": "#000000"
              },
              {
                "x1": 6.123233995736766e-15,
                "y1": 100.00000000000003,
                "x2": 7.34788079488412e-15,
                "y2": 120.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 7.34788079488412e-15,
                "y1": 120.00000000000003,
                "x2": 17.32050807568878,
                "y2": 130.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 17.32050807568878,
                "y1": 130.00000000000003,
                "x2": 34.641016151377556,
                "y2": 120.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 34.641016151377556,
                "y1": 120.00000000000003,
                "x2": 34.641016151377556,
                "y2": 100.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 34.641016151377556,
                "y1": 100.00000000000003,
                "x2": 17.32050807568878,
                "y2": 90.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 17.32050807568878,
                "y1": 90.00000000000003,
                "x2": 1.0658141036401503e-14,
                "y2": 100.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 100.00000000000001,
                "y1": 100.00000000000003,
                "x2": 100.00000000000001,
                "y2": 120.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 100.00000000000001,
                "y1": 120.00000000000003,
                "x2": 117.32050807568879,
                "y2": 130.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 117.32050807568879,
                "y1": 130.00000000000003,
                "x2": 134.64101615137756,
                "y2": 120.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 134.64101615137756,
                "y1": 120.00000000000003,
                "x2": 134.64101615137756,
                "y2": 100.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 134.64101615137756,
                "y1": 100.00000000000003,
                "x2": 117.32050807568878,
                "y2": 90.00000000000003,
                "color": "#000000"
              },
              {
                "x1": 117.32050807568878,
                "y1": 90.00000000000003,
                "x2": 100,
                "y2": 100.00000000000003,
                "color": "#000000"
              }
            ],
            "turtle": {
              "x": 6.123233995736766e-15,
              "y": 200.00000000000006,
              "heading": 90,
              "pen": true,
              "color": "#000000"
            }
          },
          "inspiration": "Blockly Turtle: zeshoeken en herhaling"
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
        "In volgorde (programmeerconcept 1)",
        "Als",
        "Anders",
        "Draai naar links",
        "Draai naar rechts",
        "Zolang"
      ]
    },
    {
      "id": "q6",
      "title": "Verbeter de code",
      "points": 3,
      "type": "correction",
      "prompt": "Debug de volgende codefragmenten.",
      "rows": [
        "moveForward(100 pixels)",
        "Turnright(144);",
        "for(var teller 0; teller > 5; teller+)"
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
      "title": "De stappen van het computationeel denken",
      "points": 5,
      "type": "ct-table",
      "prompt": "Noteer de volgorde (1 tot en met 5). Vul de twee ontbrekende namen en de vier ontbrekende beschrijvingen in. Volgorde: 1 punt; ontbrekende namen: samen 1 punt; ontbrekende uitleg: samen 3 punten.",
      "rows": [
        {
          "id": "pattern",
          "name": "Patroonherkenning",
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
          "id": "abstract",
          "name": "Abstraheren",
          "description": "",
          "order": ""
        },
        {
          "id": "decompose",
          "name": "",
          "description": "",
          "order": ""
        },
        {
          "id": "algorithm",
          "name": "Algoritme ontwerpen",
          "description": "",
          "order": ""
        }
      ]
    }
  ],
  "configSha256": "fa69728396b4f862f478d6f6132d6a2faeb61642d3bdee168e0b4119fcdf7cf8"
};
