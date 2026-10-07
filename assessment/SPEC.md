# Maze assessment specification

Digital version A adapts the supplied paper **Permutatie B**, with its figures and question content. It does not claim to recover the original paper version A. Student language is Dutch. The assessment remains out of **25 points**.

| ID | Content | Component | Points |
| --- | --- | --- | ---: |
| q1 | Complete the concept sentence; translate to JavaScript and Dutch | Three parts, retaining translation tables | 3 |
| q2 | Correct three faulty fragments; preserve the given errors | Code correction table | 3 |
| q3 | Explain the pictured Blockly program in Dutch sentences | Reference image + open answer | 1 |
| q4 | Four executable Maze exercises; required concepts, structure and explanation | Independent blocks/code branches | 2 + 2 + 2 + 3 |
| q5 | Mark actions yellow and conditions green in final q4 answers | Text ranges or individual block labels | 2 |
| q6 | Algorithm, syntax, computational thinking | Three open answers | 3 |
| q7 | Order the five computational-thinking steps | Number selectors | 1 |
| q8 | Explain an infinite loop, distinguish syntax from algorithm errors, correct it | Supplied code + three open answers | 2 |
| q9 | Predict execution inside/outside a loop and the effect of moving an instruction | Supplied code + two open answers | 1 |

## Coding rules

- Both branches execute on the same fixed maze. Students can run, stop, reset the maze, and revise their answer.
- Both branches retain the platform's Pegman, yellow paths and red goal marker. Each exercise button shows whether its selected answer is empty, untested, unfinished or has reached the goal. The next-question button lists unfinished exercises and offers to return to them or continue with partial answers. These indicators do not award credit.
- A blocks submission has a ceiling of `exercise.points * 0.5`; JavaScript has a ceiling of `exercise.points`. The four blocks ceilings are **1, 1, 1, 1.5**.
- Students can switch branches. Both drafts persist independently, but the chosen branch is the final submission. The PDF omits the other draft and never includes generated JavaScript from a blocks answer.
- Marking and execution do not automatically award credit. A teacher assigns partial credit within the displayed ceiling. Do not halve a score again after marking directly out of that ceiling.
- All-blocks choices yield a theoretical maximum of **20.5/25**, including the other questions. The total examination denominator remains 25.
- Maze 1 requires a while loop; Maze 3 requires while with if/else and a path condition, for either branch. Requirements are assessed by the teacher; reaching the goal alone does not demonstrate them.
- Maze 4 includes a short explanation within its three points. Explanations persist independently per branch and only the selected branch is exported. Missing explanation is flagged in completion indicators.
- No model solution, generated-code panel, hint system, practice progress, or unrelated level navigation is included.
- `isPathForward()` and `isPathAhead()` are aliases so the source paper and platform vocabulary both work. Other commands: `moveForward()`, `turnLeft()`, `turnRight()`, `isPathLeft()`, `isPathRight()`, `notDone()`.
- Runtime direction numbering is north/east/south/west = 0/1/2/3. Maze 1 begins (1,6), goal (5,2); Maze 2 begins (1,6), goal (5,6); Maze 3 begins (5,6), goal (0,3); Maze 4 begins (5,6), goal (2,1). Starts face east. Original source figures remain available for comparison.
- Student execution occurs in a disposable worker, with API-step and elapsed-time limits. Stop/navigation dispose its work. This keeps accidental infinite loops off the main page.

## Marking and persistence

### Teacher criteria

For JavaScript, assess directly within these totals: Maze 1 — functionality 1, required repetition 0.5, syntax/structure 0.5; Maze 2 — functionality 1.5, syntax/structure 0.5; Maze 3 — functionality 1, required selection/repetition 0.5, syntax/structure 0.5; Maze 4 — functionality 1.5, explanation 1, syntax/structure 0.5. Structure includes one instruction per line and indentation matching loops/choices. For blocks, each criterion has half that allocation and structure means a clear connected block arrangement; assign points directly within the displayed ceiling, without halving again. Q8 allocates 0.5 for explaining nontermination, 0.5 for identifying/justifying the error type and 1 for a precise correction in either JS or described blocks. Q9 allocates 0.5 per prediction. Q8/Q9 have full credit available to all students. DLC/FPS are excluded.

Older saved version-A attempts retain their existing answers and gain empty fields for the added questions and explanations when resumed.

Students may apply either classification to any block/text range; the interface does not reveal correctness. Markings have textual labels as well as colour. Changed answers invalidate old execution results and clear affected markings for review. A changed final branch requests marking review.

The storage namespace includes exam ID, version, attempt ID, and question/exercise IDs. Saving flushes before navigation, export, page hiding, and page exit. Reload requires the start password again, then matching identity resumes the active attempt. A new attempt preserves the previous record. Storage failures remain visible; in-memory answers can still be exported.

## Hand-in

The 45-minute countdown begins at unlock and stores an absolute deadline per attempt. Resume retains it, including for older attempts using their original start timestamp; a new attempt starts a new countdown. The chip progressively changes from brand purple to red and pulses increasingly in the final 15 minutes. A dismissible alert at five minutes asks students to finish, export and upload; another alert appears at zero. Expiry does not lock answers or prevent export/upload. Reduced-motion preferences disable the pulse. Open-answer fields and the Maze 4 explanation include a taalzorg reminder; open-question PDF sections also carry it. Regression checks advance the browser clock through the warning and expiry and verify deadline preservation on resume.

Identity + start password → answers → review → complete PDF download → Smartschool upload and confirmation → quit SEB with the teacher-provided password.

The start gate is static as agreed. The quit password is managed by SEB and must not be embedded in this page. Smartschool URLs are teacher configuration. PDF generation is reported separately from submission, which this static page cannot verify. Export captures a fixed answer snapshot and temporarily disables navigation while generating it.

Fonts and exam/Pegman images are also shipped in a generated JavaScript asset bundle. This avoids blocked local-file font fetches and keeps canvas/PDF images exportable when previewing via `file://`. SVG evidence removes external document references. The hosted HTTPS URL remains the classroom/SEB deployment route.

## Delivery status

The first Maze release implements tasks 1–30 and 32. Automated browser checks cover drafts, reload, a connected Blockly loop, JavaScript timeout, marking, long-answer PDF generation, storage failure, the configurable upload shortcut (using a fixture), and responsive layouts. PDF pages were rendered and inspected.

Task 31 requires the school's actual SEB installation, final host and Smartschool login/upload destination. Use `SEB-checklist.md`; this real-device pilot has not been performed. Tasks 33–37 are the later Turtle extension, dependent on the first-release pilot, and are not represented as completed.
