# Teacher notes: Maze versions A, B, and C

Versions B and C are digital variations of version A, based on the same syllabus material (pp. 1–32). They are not representations of historical paper permutations. Student configs keep the same nine group IDs, input types, timing, points, Maze requirements, grading ceilings, and Smartschool settings. Each version totals 25 points: **3 + 3 + 1 + 9 + 2 + 3 + 1 + 2 + 1**. The four coding exercises remain **2 + 2 + 2 + 3** points. Each variant is 45 minutes and uses the same configured start password, teacher, and Smartschool URL as A.

## Maze equivalence

All B mazes are exact horizontal reflections of A. For a map of width `w`, coordinates transform as `x' = w - 1 - x`, `y' = y`; directions transform with `[0, 3, 2, 1]` for north, east, south, west. All C mazes are exact 180-degree rotations of A: `x' = w - 1 - x`, `y' = h - 1 - y`, and `dir' = (dir + 2) mod 4`. These transformations preserve the maze paths and route difficulty. Asset filenames are `maze-b-1.png` through `maze-b-4.png` and `maze-c-1.png` through `maze-c-4.png`.

## Question variations

- **Q1:** Keeps the sequence concept and comparable translations of Blockly/JavaScript terms. The wording and terms change between versions.
- **Q2:** Keeps three one-point debugging fragments on function names/capitalization and conditional/loop syntax. No item treats an omitted semicolon by itself as a runtime error.
- **Q3:** Same prompt and one-point open response. The generated diagrams contain:
  - **A:** while `notDone`; if `isPathAhead`, move forward; else turn left then move forward; then if `isPathLeft`, turn right then move forward.
  - **B:** while `notDone`; if `isPathAhead`, move forward; else turn right then move forward; then if `isPathRight`, turn left then move forward.
  - **C:** while `notDone`; if `isPathAhead`, move forward; else turn right then move forward; then if `isPathLeft`, turn left then move forward.
- **Q4–Q5:** Same four coding requirements and the same action/condition marking task in each version.
- **Q6:** Asks for definitions of algorithm, syntax, and computational thinking, with small example changes.
- **Q7:** Uses the same five computation-thinking steps in a different row order.
- **Q8:** A shows the actual Pegman level 3 straight corridor with `while (notDone()) { turnLeft(); }`. Students explain the endless turning and the problem for the computer, distinguish an algorithm error from a syntax error and correct the program. B/C use `while (notDone()) { moveForward(); }` against a wall: B starts facing east with the goal one free tile north; C starts facing north with the goal one free tile east. All assess nontermination, error classification and correction, in three parts worth 0.5, 0.5 and 1 point.
- **Q9:** Students build and test a Blockly algorithm for level 5, then label action blocks as 1× (once, purple) or L (in the loop, orange). A uses the original level 5; B mirrors it horizontally; C rotates it 180 degrees, preserving the same route and setup/repetition skills. All versions offer the full 1 point with blocks: 0.5 algorithm + 0.5 classification. The chosen workspace and markings appear in the PDF. This concept question is separate from the Q4 blocks ceiling.

The student files `maze-version-a.js`, `maze-version-b.js`, and `maze-version-c.js` contain prompts, assets, maps, and scoring metadata; do not add model answers or solution programs to those configs.

## Verification

`scripts/assessment-variations-check.cjs` verifies point totals, required concepts, exact coordinate/direction transforms, equal shortest route lengths, unique entry scripts and image availability. `scripts/assessment-check.cjs` accepts `ASSESSMENT_VERSION=A/B/C`; all three pass execution in both branches, independent drafts and explanations, resume and storage isolation between versions, timer warnings, complete PDF export, direct-file use and a GitHub Pages-style subfolder with case-sensitive paths. B/C exported pages were rendered and inspected; given algorithm diagrams stay together on a page. These checks establish the intended content/route equivalence; they are not results from a classroom pilot.
