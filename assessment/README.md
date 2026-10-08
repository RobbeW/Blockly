# Blockly assessment: Maze versie A

## Wat is geïmplementeerd

Deze eerste digitale toetsversie is een aanpassing van **Toets Blockly Deel 1 – Maze – Permutatie B (2025–2026)**. Ze is versie **A** van de digitale afname; dit is geen reconstructie van een papieren Permutatie A.

De toets bevat 25 punten: vertalen (3), debugging (3), een algoritme lezen (1), vier Maze-oefeningen (2 + 2 + 2 + 3 = 9), acties en voorwaarden markeren (2), begrippen uitleggen (3), computationeel denken (1), een oneindige lus analyseren en verbeteren (2) en een level-5-algoritme bouwen en actieblokken als één keer/in de lus markeren (1). Per Maze kan de leerling blokken of JavaScript kiezen. Blokken leveren maximaal de helft van de punten van die oefening op; JavaScript kan het volledige aantal opleveren. Beide ontwerpen blijven apart bewaard, maar alleen de gekozen tak komt in de definitieve PDF. Maze 1 vereist een while-lus, Maze 3 een while met if/else. Maze 4 vraagt een uitleg binnen de oefenpunten. Werking, vereiste concepten, structuur en JavaScript-inspringingen worden door de leerkracht beoordeeld; de criteria staan in `SPEC.md`. De twee nieuwe inzichtvragen bieden volledige punten voor iedereen. DLC/FPS zijn niet opgenomen.

In de blokkenversie wordt alleen de Blockly-werkruimte opgeslagen. De door Blockly gegenereerde JavaScript blijft intern voor het uitvoeren van de Maze en wordt niet als studentantwoord getoond. De codeversie heeft een eigen JavaScript-veld en een worker-gebaseerde uitvoering. De antwoordtypen voor korte antwoorden, correcties, open antwoorden, volgorde en markeringen zijn in dezelfde toetsarchitectuur beschikbaar.

**Turtle-vragen zijn nog niet geïmplementeerd.** De toetsstructuur kan later andere antwoordtypen ondersteunen, maar de huidige release is de eerste Maze-toets. Turtle-vragen 33–37 horen bij toekomstig werk en vallen niet onder deze versie.

## Voorbereiden voor een klas

De toets heeft een countdown van 45 minuten vanaf het ontgrendelen. De resterende tijd wordt steeds roder en pulseert steeds sneller en sterker tijdens de laatste 15 minuten. Bij maximaal vijf minuten verschijnt een melding om af te ronden, de PDF te downloaden en te uploaden in Smartschool. Bij 00:00 verschijnt opnieuw een inlevermelding; antwoorden, PDF-export en de uploadlink blijven beschikbaar. Hervatten behoudt de oorspronkelijke deadline; een nieuwe poging begint opnieuw. De duur staat in `durationMinutes`. Bij een ingestelde voorkeur voor minder beweging wordt het pulseren uitgeschakeld. Open antwoorden en de uitleg bij Maze 4 tonen een taalzorgmarker voor hoofdletters, leestekens en volledige zinnen.

Pas vóór afname de configuratie in [`maze-version-a.js`](maze-version-a.js) aan:

- Het startwachtwoord voor versie A is `Charles`, ingesteld in `startPassword`.
- Vul `smartschoolUrl` in met de rechtstreekse HTTPS-link naar de inleveropdracht. Vul eventueel `smartschoolFallbackUrl` in met de HTTPS-aanmeldpagina van de school. Lege waarden laten de toets gewoon functioneren, maar tonen geen Smartschool-link.
- Controleer titel, toetsversie, puntentelling, Maze-kaarten en afbeeldingen voor de afname.

Het startwachtwoord is een eenvoudige startpoort in de pagina; behandel het als klasconfiguratie en niet als beveiligde toegang. **Het afsluitwachtwoord van Safe Exam Browser hoort alleen in het `.seb`-configuratiebestand.** Zet dat wachtwoord niet in HTML, JavaScript, README's of de Smartschool-URL. Er is hier geen `.seb`-bestand opgenomen: de echte school-URL's, het afsluitwachtwoord en de gebruikte SEB-installatie moeten eerst bekend zijn.

De browser bewaart antwoorden lokaal per toets-ID, versie en poging. De actieve poging wordt via een apart metadataveld aangewezen. Een nieuwe poging krijgt een eigen ID en laat de vorige opgeslagen poging op het toestel staan. Hervatten gebruikt de actieve opgeslagen poging wanneer naam, klas en klasnummer overeenkomen. Gebruik dus niet één gedeeld browserprofiel voor verschillende leerlingen zonder eerst de opgeslagen poging te beheren. Opslag wordt op hetzelfde toestel en dezelfde site-origin bijgehouden; er is geen centrale leerlingendatabase.

Blokken en JavaScript hebben afzonderlijke concepten. De gekozen tak is het definitieve antwoord; de andere tak blijft als oefenontwerp bestaan. Een wijziging aan het gekozen antwoord maakt de uitvoeringsbeoordeling ongeldig. Bestaande markeringen worden verwijderd wanneer het gemarkeerde antwoord verandert; de leerling moet ze dan opnieuw controleren. In blokken kunnen leerlingen zelf aanduiden welke blokken volgens hen acties of voorwaarden zijn. De markeringstool classificeert niet automatisch en geeft geen goed/fout-feedback.

## Lokale preview

Je kunt `test_maze_version_A.html` rechtstreeks openen voor een lokale preview, inclusief uitvoering en PDF-export. Lettertypen, toetsafbeeldingen en Pegman-afbeeldingen worden via `assessment/assets-bundle.js` geladen, zonder `file://`-fetches. Gebruik voor ontwikkeling bij voorkeur een HTTP-server, zodat browseropslag steeds aan dezelfde site-origin gekoppeld is.

Open PowerShell in de projecthoofdmap en start:

```powershell
py -m http.server 8000
```

Open daarna `http://127.0.0.1:8000/test_maze_version_A.html`. Stop de server met Ctrl+C. Voor een test met Smartschool moet de pagina via een HTTPS-host draaien; een lokale HTTP-preview is alleen voor ontwikkeling.

De assessmentpagina gebruikt lokaal vastgezette Blockly 13.3.0 (inclusief media), jsPDF 2.5.1 en Noto-lettertypen onder `assessment/vendor/`. Licenties zijn in die mappen opgenomen. Voeg voor deze pagina geen CDN-afhankelijkheid toe.

Voer na een wijziging aan de gebundelde lettertypen of afbeeldingen `node scripts/build-assessment-assets.cjs` uit om `assessment/assets-bundle.js` opnieuw te maken. Neem dit bestand mee bij publicatie.

## Een volgende versie maken

### Beschikbare variaties

Versies A, B en C zijn beschikbaar via `test_maze_version_A.html`, `test_maze_version_B.html` en `test_maze_version_C.html`. Elke pagina laadt uitsluitend haar eigen configuratie, met dezelfde gedeelde interface, 25 punten, 45 minuten, het wachtwoord `Charles`, Smartschool-link, taalzorg en blokken/JavaScript-plafonds. Opgeslagen pogingen en PDF-bestandsnamen bevatten de toetsversie. De browsercontrole bevestigt dat dezelfde leerling in een andere versie geen antwoorden uit de eerste versie hervat.

B gebruikt horizontaal gespiegelde mazes; C gebruikt mazes die 180 graden gedraaid zijn. Startpositie, kijkrichting en doel worden mee getransformeerd. De afbeeldingen komen rechtstreeks uit dezelfde runtime als de interactieve mazes. Vertaaloefeningen, debugging, het te lezen blokkenalgoritme, begripsvragen, de volgorde van denkstappen en de twee lusvragen variëren. Zie `VARIATIONS.md` voor de vergelijking voor leerkrachten.

Controleer alle configuraties met `node scripts/assessment-variations-check.cjs`. Kies voor de browsercontrole `$env:ASSESSMENT_VERSION = 'B'` of `'C'` en voer `node scripts/assessment-check.cjs` uit; zonder deze variabele wordt A getest. QA-bestanden verschijnen per versie in `tmp/assessment-check/A`, `B` of `C`.

Na aanpassing van de kaarten of de opgegeven blokkenalgoritmes kun je hun native afbeeldingen opnieuw renderen met `node scripts/build-assessment-variations.cjs` (Playwright/Chrome vereist). Voer vervolgens `node scripts/build-assessment-assets.cjs` uit voor de bundel. Publiceer ook de twee nieuwe HTML-bestanden; alle drie zijn onder een GitHub Pages-repositorypad getest.

1. Kopieer `test_maze_version_A.html` naar bijvoorbeeld `test_maze_version_B.html` in de projecthoofdmap.
2. Kopieer `assessment/maze-version-a.js` naar `assessment/maze-version-b.js`.
3. Vervang in de nieuwe HTML uitsluitend de configuratiescriptverwijzing door `assessment/maze-version-b.js`. De CSS, runtime, antwoordcomponenten en PDF-export blijven gedeeld.
4. Wijzig `version`, titel, startwachtwoord, Smartschool-links, prompts, punten en Maze-kaarten in de nieuwe configuratie. Gebruik een andere `id` voor een andere toets; een nieuwe `version` voor een nieuwe versie van dezelfde toets. Daardoor blijven de opgeslagen pogingen gescheiden.
5. Houd in dit Maze-template de groeps-ID's `q1` tot `q9` en de indeling `q4` = coding, `q5` = marking en `q7` = ordering aan. De vier oefeningen krijgen elk een unieke ID; kaarten moeten rechthoekig zijn, met `#` voor muren en `.` voor paden. Richting: 0 = noord, 1 = oost, 2 = zuid, 3 = west.
6. Controleer de puntentelling, afbeeldingen, uitvoering en een volledige PDF voor de nieuwe versie. Het template is nog geen algemene examenbouwer voor willekeurige vraagstructuren.

Een voorbeeld van één oefening in de gekopieerde configuratie:

```js
{id:'maze-1', title:'Maze 1', points:2, asset:'assessment/assets/maze-1.png',
 start:{x:1,y:1,dir:1}, goal:{x:3,y:1}, map:['#####','#...#','#####']}
```

Dit is alleen de leerlinggerichte toetsconfiguratie; er staat bewust geen modelantwoord of oplossingsprogramma in. Houd de rest van de configuratie vrij van modelantwoorden. Een exam entry laadt alleen zijn configuratie, gedeelde runtime en exam-specifieke pagina-assets.

## Automatische controle

Met Node.js en Playwright beschikbaar:

```powershell
$env:ASSESSMENT_BROWSER = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node scripts/assessment-check.cjs
```

Stel indien nodig `NODE_PATH` in op de map met Playwright. De controle start zelf een tijdelijke lokale server en sluit de testbrowser daarna. Ze controleert de startpoort, onafhankelijke ontwerpen, een Blockly-lus, begrensde JavaScript-uitvoering, markeringen, herstel na herladen, opslagfouten, de vertaaldelen, Maze-statussen en de controle bij verdergaan. PDF-export wordt zowel via HTTP als rechtstreeks via `file://` gecontroleerd, inclusief consolefouten. De Smartschool-link gebruikt een nagebootste bestemming. Browserbeelden en voorbeeld-PDF's verschijnen per versie onder `tmp/assessment-check/`. Dit vervangt niet de echte SEB/Smartschool-pilot.

## Publiceren

### GitHub Pages-demo

Publiceer de projecthoofdmap als Pages-bron. Houd `test_maze_version_A.html`, `favicon.png`, `.nojekyll` en de volledige map `assessment/` op hun huidige plaats. De stylesheet, scripts, Blockly-media en afbeeldingen gebruiken relatieve paden, zodat de toets ook onder een repositorypad werkt, bijvoorbeeld `https://<account>.github.io/<repository>/test_maze_version_A.html`. `.nojekyll` laat Pages de bestanden rechtstreeks als statische bestanden serveren. Er is geen buildstap of CDN nodig voor deze toets; `assessment/assets-bundle.js` is al gegenereerd en moet mee gepubliceerd worden. Als je een andere publicatiemap kiest, kopieer dan dezelfde bestanden en mapstructuur samen naar die map.

De browsercontrole kan een repositorypad nabootsen, inclusief hoofdlettergevoelige bestandsnamen en controles op ontbrekende resources:

```powershell
$env:ASSESSMENT_BASE_PATH = '/Blockly-main/'
node scripts/assessment-check.cjs
```

Deze controle verifieert de lokale Pages-compatibele mapstructuur; de live GitHub Pages-publicatie is niet vanuit deze taak uitgevoerd.

Dit is een statische pagina. Host de benodigde HTML-, JavaScript-, CSS-, afbeelding-, font- en vendorbestanden op de gekozen webhost en configureer de uiteindelijke HTTPS Smartschool-links. Deze instructies publiceren niets en maken geen SEB-configuratiebestand aan. Test de exacte gehoste URL en de echte browserinstellingen voordat leerlingen de toets gebruiken.

Voor deze toets zijn `test_maze_version_A.html`, `favicon.png` en de runtime/configuratie/CSS/afbeeldingen/vendorbestanden in `assessment/` nodig. Publiceer geen testfixtures of lokale QA-output uit `scripts/` of `tmp/` als toetsmateriaal. De bestaande `platform.html` en `teacher.html` zijn niet gewijzigd. Zie `SPEC.md` voor de vastgelegde inhoud en opleverstatus en `SEB-checklist.md` voor de nog uit te voeren schoolpilot.
