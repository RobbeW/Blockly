window.ASSESSMENT_CONFIG = {
  "schemaVersion": 1,
  "id": "chapter-2",
  "chapter": 2,
  "version": "C",
  "revision": "20261105-turtle-v5",
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
    "start": 6,
    "end": 18,
    "long": 80,
    "short": 40,
    "side": 40,
    "jump": 80,
    "direction": "right",
    "color": "#5200ff",
    "radius": 40,
    "distance": 16,
    "colors": [
      "#ff0000",
      "#0177a7"
    ],
    "gap": 20,
    "stairStart": 15,
    "stairEnd": 60,
    "stairStep": 15
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
                "vooruit 80 pixels",
                "draai rechts 90°",
                "vooruit 40 pixels",
                "draai rechts 90°"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Een gesloten vierkant met vier even lange zijden.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 80,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 80,
                    "y1": 80,
                    "x2": 80,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 80,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 0,
                  "y": -9.797174393178826e-15,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Een open figuur met vier schuin aansluitende lijnstukken.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 34.641016,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 34.641016,
                    "y1": 100,
                    "x2": 103.923048,
                    "y2": 60,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 103.923048,
                    "y1": 60,
                    "x2": 103.923048,
                    "y2": 20,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 103.92304845413265,
                  "y": 20.000000000000007,
                  "heading": -150,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "C",
              "alt": "Een open figuur met twee loodrechte lijnstukken.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 40,
                    "y2": 80,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 40.00000000000001,
                  "y": 80,
                  "heading": 0,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Een gesloten rechthoek met twee lange en twee korte zijden.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 40,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 80,
                    "x2": 40,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 1.4210854715202004e-14,
                  "y": -4.898587196589413e-15,
                  "heading": -270,
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
                "vooruit 80 pixels",
                "draai rechts 72°"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Een gesloten regelmatige zeshoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 69.282032,
                    "y2": 120,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 69.282032,
                    "y1": 120,
                    "x2": 138.564065,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 138.564065,
                    "y1": 80,
                    "x2": 138.564065,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 138.564065,
                    "y1": 0,
                    "x2": 69.282032,
                    "y2": -40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 69.282032,
                    "y1": -40,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 1.4210854715202004e-14,
                  "y": 1.4210854715202004e-14,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Een gesloten regelmatige vijfhoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 76.084521,
                    "y2": 104.72136,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.084521,
                    "y1": 104.72136,
                    "x2": 123.107341,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 123.107341,
                    "y1": 40,
                    "x2": 76.084521,
                    "y2": -24.72136,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.084521,
                    "y1": -24.72136,
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
              "id": "C",
              "alt": "Vier zijden van een nog niet gesloten vijfhoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 76.084521,
                    "y2": 104.72136,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 76.084521,
                    "y1": 104.72136,
                    "x2": 123.107341,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 123.107341,
                    "y1": 40,
                    "x2": 76.084521,
                    "y2": -24.72136,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": 76.08452130361229,
                  "y": -24.721359549995796,
                  "heading": -198,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Een gesloten gelijkzijdige driehoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 69.282032,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 69.282032,
                    "y1": 40,
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
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Drie vijfhoeken boven elkaar met verbindingslijnen.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 40,
                    "x2": 38.042261,
                    "y2": 52.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 52.36068,
                    "x2": 61.553671,
                    "y2": 20,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 20,
                    "x2": 38.042261,
                    "y2": -12.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": -12.36068,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 0,
                    "y2": 120,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 120,
                    "x2": 38.042261,
                    "y2": 132.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 132.36068,
                    "x2": 61.553671,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 100,
                    "x2": 38.042261,
                    "y2": 67.63932,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 67.63932,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 0,
                    "y2": 160,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 160,
                    "x2": 0,
                    "y2": 200,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 200,
                    "x2": 38.042261,
                    "y2": 212.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 212.36068,
                    "x2": 61.553671,
                    "y2": 180,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 180,
                    "x2": 38.042261,
                    "y2": 147.63932,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 147.63932,
                    "x2": 0,
                    "y2": 160,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 160,
                    "x2": 0,
                    "y2": 240,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -3.601204366257124e-14,
                  "y": 240.00000000000009,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Drie losse vierkanten boven elkaar.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 40,
                    "x2": 40,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 40,
                    "x2": 40,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 0,
                    "y2": 120,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 120,
                    "x2": 40,
                    "y2": 120,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 120,
                    "x2": 40,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 80,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 160,
                    "x2": 0,
                    "y2": 200,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 200,
                    "x2": 40,
                    "y2": 200,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 200,
                    "x2": 40,
                    "y2": 160,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 40,
                    "y1": 160,
                    "x2": 0,
                    "y2": 160,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -5.732832573537425e-14,
                  "y": 240,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "C",
              "alt": "Twee losse vijfhoeken boven elkaar.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 40,
                    "x2": 38.042261,
                    "y2": 52.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 52.36068,
                    "x2": 61.553671,
                    "y2": 20,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 20,
                    "x2": 38.042261,
                    "y2": -12.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": -12.36068,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 0,
                    "y2": 120,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 120,
                    "x2": 38.042261,
                    "y2": 132.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 132.36068,
                    "x2": 61.553671,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 100,
                    "x2": 38.042261,
                    "y2": 67.63932,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 67.63932,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -2.180118894736924e-14,
                  "y": 160.00000000000006,
                  "heading": -270,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Drie losse vijfhoeken boven elkaar, zonder verbindingslijnen.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 40,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 40,
                    "x2": 38.042261,
                    "y2": 52.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 52.36068,
                    "x2": 61.553671,
                    "y2": 20,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 20,
                    "x2": 38.042261,
                    "y2": -12.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": -12.36068,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 80,
                    "x2": 0,
                    "y2": 120,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 120,
                    "x2": 38.042261,
                    "y2": 132.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 132.36068,
                    "x2": 61.553671,
                    "y2": 100,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 100,
                    "x2": 38.042261,
                    "y2": 67.63932,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 67.63932,
                    "x2": 0,
                    "y2": 80,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 160,
                    "x2": 0,
                    "y2": 200,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 200,
                    "x2": 38.042261,
                    "y2": 212.36068,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 212.36068,
                    "x2": 61.553671,
                    "y2": 180,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 61.553671,
                    "y1": 180,
                    "x2": 38.042261,
                    "y2": 147.63932,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 38.042261,
                    "y1": 147.63932,
                    "x2": 0,
                    "y2": 160,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -3.601204366257124e-14,
                  "y": 240.00000000000009,
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
      "prompt": "Programmeer beide figuren met JavaScript en for-lussen. Gebruik bij 3b één lus voor de zijden en één lus voor de zeshoeken. Voer je code uit en vergelijk je tekening met het doel. De kleur van de lijnen telt niet mee.",
      "tasks": [
        {
          "id": "q3a",
          "label": "3a · Twee losse vierkanten",
          "points": 2.5,
          "alt": "Twee losse vierkanten naar rechts, met een startpijl omhoog.",
          "prompt": [
            "Teken twee losse vierkanten.",
            "Elke zijde is 40 pixels.",
            "Laat 20 pixels vrij tussen de vierkanten.",
            "Teken de vierkanten naar rechts van het startpunt.",
            "Gebruik een for-lus voor de zijden.",
            "Verplaats met de pen omhoog, zonder verbindingslijn."
          ],
          "figure": {
            "segments": [
              {
                "x1": 0,
                "y1": 0,
                "x2": 0,
                "y2": 40,
                "color": "#000000"
              },
              {
                "x1": 0,
                "y1": 40,
                "x2": 40,
                "y2": 40,
                "color": "#000000"
              },
              {
                "x1": 40,
                "y1": 40,
                "x2": 40,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 40,
                "y1": 0,
                "x2": 0,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 60,
                "y1": 0,
                "x2": 60,
                "y2": 40,
                "color": "#000000"
              },
              {
                "x1": 60,
                "y1": 40,
                "x2": 100,
                "y2": 40,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 40,
                "x2": 100,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 0,
                "x2": 60,
                "y2": 0,
                "color": "#000000"
              }
            ],
            "turtle": {
              "x": 120,
              "y": -1.2004014554190414e-14,
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
          "prompt": [
            "Teken vier losse regelmatige zeshoeken in een rooster van twee bij twee.",
            "Elke zijde is 30 pixels.",
            "Begin linksonder bij (0, 0).",
            "De startpunten liggen 100 pixels uit elkaar.",
            "Draai na elke zijde 60 graden naar rechts."
          ],
          "figure": {
            "segments": [
              {
                "x1": 0,
                "y1": 0,
                "x2": 0,
                "y2": 30,
                "color": "#000000"
              },
              {
                "x1": 0,
                "y1": 30,
                "x2": 25.980762114,
                "y2": 45,
                "color": "#000000"
              },
              {
                "x1": 25.980762114,
                "y1": 45,
                "x2": 51.961524227,
                "y2": 30,
                "color": "#000000"
              },
              {
                "x1": 51.961524227,
                "y1": 30,
                "x2": 51.961524227,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 51.961524227,
                "y1": 0,
                "x2": 25.980762114,
                "y2": -15,
                "color": "#000000"
              },
              {
                "x1": 25.980762114,
                "y1": -15,
                "x2": 0,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 0,
                "y1": 100,
                "x2": 30,
                "y2": 100,
                "color": "#000000"
              },
              {
                "x1": 30,
                "y1": 100,
                "x2": 45,
                "y2": 74.019237886,
                "color": "#000000"
              },
              {
                "x1": 45,
                "y1": 74.019237886,
                "x2": 30,
                "y2": 48.038475773,
                "color": "#000000"
              },
              {
                "x1": 30,
                "y1": 48.038475773,
                "x2": 0,
                "y2": 48.038475773,
                "color": "#000000"
              },
              {
                "x1": 0,
                "y1": 48.038475773,
                "x2": -15,
                "y2": 74.019237886,
                "color": "#000000"
              },
              {
                "x1": -15,
                "y1": 74.019237886,
                "x2": 0,
                "y2": 100,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 100,
                "x2": 100,
                "y2": 70,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 70,
                "x2": 74.019237886,
                "y2": 55,
                "color": "#000000"
              },
              {
                "x1": 74.019237886,
                "y1": 55,
                "x2": 48.038475773,
                "y2": 70,
                "color": "#000000"
              },
              {
                "x1": 48.038475773,
                "y1": 70,
                "x2": 48.038475773,
                "y2": 100,
                "color": "#000000"
              },
              {
                "x1": 48.038475773,
                "y1": 100,
                "x2": 74.019237886,
                "y2": 115,
                "color": "#000000"
              },
              {
                "x1": 74.019237886,
                "y1": 115,
                "x2": 100,
                "y2": 100,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 0,
                "x2": 70,
                "y2": 0,
                "color": "#000000"
              },
              {
                "x1": 70,
                "y1": 0,
                "x2": 55,
                "y2": 25.980762114,
                "color": "#000000"
              },
              {
                "x1": 55,
                "y1": 25.980762114,
                "x2": 70,
                "y2": 51.961524227,
                "color": "#000000"
              },
              {
                "x1": 70,
                "y1": 51.961524227,
                "x2": 100,
                "y2": 51.961524227,
                "color": "#000000"
              },
              {
                "x1": 100,
                "y1": 51.961524227,
                "x2": 115,
                "y2": 25.980762114,
                "color": "#000000"
              },
              {
                "x1": 115,
                "y1": 25.980762114,
                "x2": 100,
                "y2": 0,
                "color": "#000000"
              }
            ],
            "turtle": {
              "x": 0,
              "y": 0,
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
        "Anders",
        "Zolang",
        "Draai naar rechts",
        "In volgorde (programmeerconcept 1)",
        "Draai naar links",
        "Als"
      ]
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
      "title": "De stappen van het computationeel denken",
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
  "configSha256": "9d593e0dd9f642879368daf68e75e258ed7e9aaf6fc6b496d2cf9459fe637f19"
};
