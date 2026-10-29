# Blockly in de Klas

Auteur: Robbe Wulgaert · AI in de Klas · [robbewulgaert.be](https://www.robbewulgaert.be)  
© 2026 Robbe Wulgaert

Demo: [klik hier](https://robbew.github.io/Blockly/)

## Doel

Blockly in de Klas helpt leerlingen van ongeveer 10-13 jaar om stap-voor-stap van blokken naar echte code te groeien.

De app focust op:

- computationeel denken via Maze en Turtle;
- eerst redeneren met blokken, daarna dezelfde concepten herkennen in code;
- simple sequence / eenvoudige sequentie, selection / selectie, conditional iteration / voorwaardelijke herhaling en limited iteration / begrensde herhaling;
- zichtbare feedback via animatie, tekenresultaten en leergerichte meldingen;
- lokaal werken zonder accounts of installatie;
- PDF-export als bewijs van leren en basis voor feedback.

## Projectstructuur

```text
index.html              # productpagina
platform.html           # leeromgeving
content/catalog.json    # eerste aanzet voor losse contentstructuur
content/maze/levels.json
content/turtle/levels.json
content/formularium/sections.json
maze/generated.js       # bestaande Maze-levels
assets/                 # sprites, tiles en audio
common/                 # gedeelde Blockly-styling
evaluations/            # Turtle-toetsvarianten en gedeelde toetsbestanden
assessment/             # bestaande Maze-configuraties en gedeelde toetsruntime
```

## Evaluaties per hoofdstuk

Hoofdstuk 1 bevat drie Maze-toetsen op 20 punten: [A](test_maze_version_A.html), [B](test_maze_version_B.html) en [C](test_maze_version_C.html). Hun URL's en lokaal bewaarde antwoorden blijven behouden.

Hoofdstuk 2 bevat drie Turtle/for-toetsen op 23 punten met een limiet van 45 minuten: [A](evaluations/chapter-2/versions/A/index.html), [B](evaluations/chapter-2/versions/B/index.html) en [C](evaluations/chapter-2/versions/C/index.html).

## Publiceren

Gebruik uitsluitend de schone publicatiemap `output/github-upload/site/`. Die wordt opgebouwd met `node scripts/prepare-github-upload.cjs` en bevat de website en alle zes toetsen. De lokale werkmap bevat ook docentbestanden en persoonsgegevens en is geen uploadmap. Zie [PUBLICATION.md](PUBLICATION.md) voor de werkwijze.

## Leeromgeving

Open `platform.html` om de app zelf te gebruiken.

De leeromgeving bevat vier modi:

- Maze (Blokken)
- Maze (Code)
- Turtle (Blokken)
- Turtle (Code)

Maze bevat vaste levels en een random level. Turtle bevat tekenlevels met doelcontouren. De app bewaart voortgang lokaal in de browser.

## Formularium

Klik op het `?`-icoon rechtsonder voor het Blockly Formularium. Dat bevat:

- denkstrategieën voor Maze;
- Turtle-commando's;
- blok-naar-code voorbeelden;
- foutchecks voor leerlingen;
- export- en feedbackafspraken.

## PDF-export

De PDF-export bevat naam, klas, oefening, code of blokken-snapshot, Maze/Turtle-snapshot en een rubriek voor feedback.

## Licentie en copyright

© 2026 Robbe Wulgaert, AI in de Klas, robbewulgaert.be. Alle rechten voorbehouden.

Gebruik in eigen klas of eigen onderwijscontext is toegelaten mits duidelijke en expliciete naamsvermelding:

```text
Robbe Wulgaert, AI in de Klas, robbewulgaert.be
```

Gebaseerd op oefeningen uit het open-source Blockly project door Google.
