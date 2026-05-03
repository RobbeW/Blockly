# Blockly contentstructuur

Deze map is de start van een catalogusstructuur voor Blockly in de Klas.

De huidige app gebruikt nog grotendeels de bestaande ingebouwde levels in `platform.html` en `maze/generated.js`. Deze bestanden leggen alvast vast hoe de inhoud later losgekoppeld kan worden, zoals bij JS in de Klas en Project Delphi.

## Mappen

```text
content/catalog.json
content/maze/levels.json
content/turtle/levels.json
content/formularium/sections.json
```

## Doel

- Maze-levels beschrijven als leerlijn, niet alleen als grid.
- Maze-levels koppelen aan simple sequence / eenvoudige sequentie, limited iteration / begrensde herhaling, selection / selectie en conditional iteration / voorwaardelijke herhaling.
- Turtle-levels koppelen aan simple sequence / eenvoudige sequentie, limited iteration / begrensde herhaling, hoeken, coordinaten en patronen.
- Het formularium als inhoud beheren in plaats van als losse HTML.
- Later eenvoudiger nieuwe levels, feedbackregels en teacher tooling toevoegen.
