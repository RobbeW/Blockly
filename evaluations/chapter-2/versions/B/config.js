window.ASSESSMENT_CONFIG = {
  "schemaVersion": 1,
  "id": "chapter-2",
  "chapter": 2,
  "version": "B",
  "revision": "20261029-turtle-v3",
  "title": "Toets Blockly · Turtle",
  "subtitle": "Begrensde herhaling · start, eindgrens en interval",
  "totalPoints": 23,
  "durationMinutes": 45,
  "teacher": "Robbe Wulgaert",
  "startPassword": "Charles",
  "smartschoolUrl": "https://sintlievenscollege.smartschool.be/",
  "sourceSha256": "be6e56a12a9c62ad06691033aaacf188bd8ea988c84d208f9010f2c9202887c2",
  "source": "Eindtoets Blockly 2026-2027.pdf",
  "initialHeading": 90,
  "parameters": {
    "start": 4,
    "end": 16,
    "long": 90,
    "short": 45,
    "side": 60,
    "jump": 90,
    "direction": "left",
    "color": "#007a66",
    "radius": 60,
    "distance": 24,
    "colors": [
      "#ff8800",
      "#8844ff"
    ],
    "gap": 30,
    "stairStart": 25,
    "stairEnd": 100,
    "stairStep": 25
  },
  "groups": [
    {
      "id": "q1",
      "title": "Schrijf een for-lus",
      "points": 2,
      "type": "code",
      "prompt": "Noteer een for-lus met startgetal 4, eindgrens 16 en interval 1. De eindgrens is niet inbegrepen. Laat de lusinhoud leeg; let op de haakjes en accolades.",
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
                "vooruit 90 pixels",
                "draai links 90°",
                "vooruit 45 pixels",
                "draai links 90°"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Een open figuur met twee loodrechte lijnstukken.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -45,
                    "y2": 90,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -44.99999999999999,
                  "y": 90,
                  "heading": 180,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Een gesloten vierkant met vier even lange zijden.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -90,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -90,
                    "y1": 90,
                    "x2": -90,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -90,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -1.4210854715202004e-14,
                  "y": 1.4210854715202004e-14,
                  "heading": 90,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "C",
              "alt": "Een gesloten rechthoek met twee lange en twee korte zijden.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -45,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 90,
                    "x2": -45,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -7.105427357601002e-15,
                  "y": 0,
                  "heading": 90,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Een open figuur met vier schuin aansluitende lijnstukken.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -38.971143,
                    "y2": 112.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -38.971143,
                    "y1": 112.5,
                    "x2": -116.91343,
                    "y2": 67.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -116.91343,
                    "y1": 67.5,
                    "x2": -116.91343,
                    "y2": 22.5,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -116.91342951089923,
                  "y": 22.5,
                  "heading": 330,
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
                "vooruit 90 pixels",
                "draai links 72°"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Een gesloten regelmatige vijfhoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -85.595086,
                    "y2": 117.811529,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -85.595086,
                    "y1": 117.811529,
                    "x2": -138.495759,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -138.495759,
                    "y1": 45,
                    "x2": -85.595086,
                    "y2": -27.811529,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -85.595086,
                    "y1": -27.811529,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -4.263256414560601e-14,
                  "y": -3.552713678800501e-15,
                  "heading": 90,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Een gesloten gelijkzijdige driehoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -77.942286,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -77.942286,
                    "y1": 45,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -2.842170943040401e-14,
                  "y": -4.973799150320701e-14,
                  "heading": 90,
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
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -77.942286,
                    "y2": 135,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -77.942286,
                    "y1": 135,
                    "x2": -155.884573,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -155.884573,
                    "y1": 90,
                    "x2": -155.884573,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -155.884573,
                    "y1": 0,
                    "x2": -77.942286,
                    "y2": -45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -77.942286,
                    "y1": -45,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -5.684341886080802e-14,
                  "y": -4.973799150320701e-14,
                  "heading": 90,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Vier zijden van een nog niet gesloten vijfhoek.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": -85.595086,
                    "y2": 117.811529,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -85.595086,
                    "y1": 117.811529,
                    "x2": -138.495759,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -138.495759,
                    "y1": 45,
                    "x2": -85.595086,
                    "y2": -27.811529,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -85.59508646656386,
                  "y": -27.81152949374527,
                  "heading": 18,
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
                    "vooruit 45 pixels",
                    "draai links 72°"
                  ]
                },
                "pen omhoog",
                "vooruit 90 pixels",
                "pen omlaag"
              ]
            }
          ],
          "countPrompt": "Hoeveel rechte lijnstukken worden in totaal met de pen omlaag getekend?",
          "options": [
            {
              "id": "A",
              "alt": "Twee losse vijfhoeken boven elkaar.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 45,
                    "x2": -42.797543,
                    "y2": 58.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 58.905765,
                    "x2": -69.24788,
                    "y2": 22.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 22.5,
                    "x2": -42.797543,
                    "y2": -13.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": -13.905765,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": 0,
                    "y2": 135,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 135,
                    "x2": -42.797543,
                    "y2": 148.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 148.905765,
                    "x2": -69.24788,
                    "y2": 112.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 112.5,
                    "x2": -42.797543,
                    "y2": 76.094235,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 76.094235,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -3.001622619184192e-14,
                  "y": 180,
                  "heading": 90,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "B",
              "alt": "Drie vijfhoeken boven elkaar met verbindingslijnen.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 45,
                    "x2": -42.797543,
                    "y2": 58.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 58.905765,
                    "x2": -69.24788,
                    "y2": 22.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 22.5,
                    "x2": -42.797543,
                    "y2": -13.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": -13.905765,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": 0,
                    "y2": 135,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 135,
                    "x2": -42.797543,
                    "y2": 148.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 148.905765,
                    "x2": -69.24788,
                    "y2": 112.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 112.5,
                    "x2": -42.797543,
                    "y2": 76.094235,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 76.094235,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": 0,
                    "y2": 180,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 180,
                    "x2": 0,
                    "y2": 225,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 225,
                    "x2": -42.797543,
                    "y2": 238.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 238.905765,
                    "x2": -69.24788,
                    "y2": 202.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 202.5,
                    "x2": -42.797543,
                    "y2": 166.094235,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 166.094235,
                    "x2": 0,
                    "y2": 180,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 180,
                    "x2": 0,
                    "y2": 270,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -4.4227080907043925e-14,
                  "y": 270,
                  "heading": 90,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "C",
              "alt": "Drie losse vijfhoeken boven elkaar, zonder verbindingslijnen.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 45,
                    "x2": -42.797543,
                    "y2": 58.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 58.905765,
                    "x2": -69.24788,
                    "y2": 22.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 22.5,
                    "x2": -42.797543,
                    "y2": -13.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": -13.905765,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": 0,
                    "y2": 135,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 135,
                    "x2": -42.797543,
                    "y2": 148.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 148.905765,
                    "x2": -69.24788,
                    "y2": 112.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 112.5,
                    "x2": -42.797543,
                    "y2": 76.094235,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 76.094235,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 180,
                    "x2": 0,
                    "y2": 225,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 225,
                    "x2": -42.797543,
                    "y2": 238.905765,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 238.905765,
                    "x2": -69.24788,
                    "y2": 202.5,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -69.24788,
                    "y1": 202.5,
                    "x2": -42.797543,
                    "y2": 166.094235,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -42.797543,
                    "y1": 166.094235,
                    "x2": 0,
                    "y2": 180,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -4.4227080907043925e-14,
                  "y": 270,
                  "heading": 90,
                  "pen": true,
                  "color": "#5200ff"
                }
              }
            },
            {
              "id": "D",
              "alt": "Drie losse vierkanten boven elkaar.",
              "figure": {
                "segments": [
                  {
                    "x1": 0,
                    "y1": 0,
                    "x2": 0,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 45,
                    "x2": -45,
                    "y2": 45,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 45,
                    "x2": -45,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 0,
                    "x2": 0,
                    "y2": 0,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 90,
                    "x2": 0,
                    "y2": 135,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 135,
                    "x2": -45,
                    "y2": 135,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 135,
                    "x2": -45,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 90,
                    "x2": 0,
                    "y2": 90,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 180,
                    "x2": 0,
                    "y2": 225,
                    "color": "#5200ff"
                  },
                  {
                    "x1": 0,
                    "y1": 225,
                    "x2": -45,
                    "y2": 225,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 225,
                    "x2": -45,
                    "y2": 180,
                    "color": "#5200ff"
                  },
                  {
                    "x1": -45,
                    "y1": 180,
                    "x2": 0,
                    "y2": 180,
                    "color": "#5200ff"
                  }
                ],
                "turtle": {
                  "x": -1.5945167614379123e-15,
                  "y": 270,
                  "heading": 90,
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
      "prompt": "Programmeer beide figuren met JavaScript en for-lussen. Start bij (0, 0) en volg de pijl omhoog. Kies passende startwaarden, eindgrenzen en intervallen. Voer je code uit en vergelijk jouw tekening met het doel. De preview geeft geen punten.",
      "tasks": [
        {
          "id": "q3a",
          "label": "3a · Twee losse vierkanten",
          "points": 2.5,
          "alt": "Twee losse vierkanten naar links, met een startpijl omhoog.",
          "prompt": "Teken twee vierkanten in kleur #007a66. Elke zijde is 60 pixels. De ruimte tussen de vierkanten is 30 pixels. Teken ze naar links van het startpunt. Er mag geen verbindingslijn zijn. Gebruik for-lussen voor de zijden en pen omhoog/omlaag om te verplaatsen.",
          "figure": {
            "segments": [
              {
                "x1": 0,
                "y1": 0,
                "x2": 0,
                "y2": 60,
                "color": "#007a66"
              },
              {
                "x1": 0,
                "y1": 60,
                "x2": -60,
                "y2": 60,
                "color": "#007a66"
              },
              {
                "x1": -60,
                "y1": 60,
                "x2": -60,
                "y2": 0,
                "color": "#007a66"
              },
              {
                "x1": -60,
                "y1": 0,
                "x2": 0,
                "y2": 0,
                "color": "#007a66"
              },
              {
                "x1": -90,
                "y1": 0,
                "x2": -90,
                "y2": 60,
                "color": "#007a66"
              },
              {
                "x1": -90,
                "y1": 60,
                "x2": -150,
                "y2": 60,
                "color": "#007a66"
              },
              {
                "x1": -150,
                "y1": 60,
                "x2": -150,
                "y2": 0,
                "color": "#007a66"
              },
              {
                "x1": -150,
                "y1": 0,
                "x2": -90,
                "y2": 0,
                "color": "#007a66"
              }
            ],
            "turtle": {
              "x": -180,
              "y": 3.9443530622730183e-14,
              "heading": 90,
              "pen": true,
              "color": "#007a66"
            }
          },
          "inspiration": "Blockly Turtle: vierkant en meerdere vormen"
        },
        {
          "id": "q3b",
          "label": "3b · Een groeiende trap",
          "points": 2.5,
          "alt": "Vier traptreden met steeds langere verticale en horizontale lijnstukken, naar links.",
          "prompt": "Teken in kleur #007a66 een trap van vier treden naar links. Elke trede gaat eerst omhoog en dan opzij. De twee lijnstukken van een trede zijn even lang: achtereenvolgens 25, 50, 75, 100 pixels. Gebruik één for-lus met een teller die begint op 25 en telkens met 25 stijgt. Gebruik de teller voor beide afstanden.",
          "figure": {
            "segments": [
              {
                "x1": 0,
                "y1": 0,
                "x2": 0,
                "y2": 25,
                "color": "#007a66"
              },
              {
                "x1": 0,
                "y1": 25,
                "x2": -25,
                "y2": 25,
                "color": "#007a66"
              },
              {
                "x1": -25,
                "y1": 25,
                "x2": -25,
                "y2": 75,
                "color": "#007a66"
              },
              {
                "x1": -25,
                "y1": 75,
                "x2": -75,
                "y2": 75,
                "color": "#007a66"
              },
              {
                "x1": -75,
                "y1": 75,
                "x2": -75,
                "y2": 150,
                "color": "#007a66"
              },
              {
                "x1": -75,
                "y1": 150,
                "x2": -150,
                "y2": 150,
                "color": "#007a66"
              },
              {
                "x1": -150,
                "y1": 150,
                "x2": -150,
                "y2": 250,
                "color": "#007a66"
              },
              {
                "x1": -150,
                "y1": 250,
                "x2": -250,
                "y2": 250,
                "color": "#007a66"
              }
            ],
            "turtle": {
              "x": -250,
              "y": 250,
              "heading": 90,
              "pen": true,
              "color": "#007a66"
            }
          },
          "inspiration": "Blockly Turtle: trap en parameters"
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
        "Draai naar links",
        "Als",
        "In volgorde",
        "Zolang",
        "Anders",
        "Draai naar rechts"
      ]
    },
    {
      "id": "q6",
      "title": "Verbeter de code",
      "points": 3,
      "type": "correction",
      "prompt": "Debug de volgende codefragmenten.",
      "rows": [
        "moveForward(90 pixels)",
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
      "title": "Het stappenplan",
      "points": 5,
      "type": "ct-table",
      "prompt": "Noteer de volgorde (1 tot en met 5). Vul de twee ontbrekende namen en de vier ontbrekende beschrijvingen in. Volgorde: 1 punt; ontbrekende namen: samen 1 punt; ontbrekende uitleg: samen 3 punten.",
      "rows": [
        {
          "id": "algorithm",
          "name": "Algoritme ontwerpen",
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
        }
      ]
    }
  ],
  "configSha256": "a22afce1591520a0d343eb455a22c1c4bb69cd6e0015dd9b28e0ce6df059a561"
};
