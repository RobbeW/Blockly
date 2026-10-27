# Public website and local workspace

The Blockly working folder contains both public website sources and local teaching records. Upload only the generated public website.

From the project root:

```sh
node scripts/prepare-github-upload.cjs
node scripts/prepare-github-upload.cjs --check
```

Upload the **contents of `output/github-upload/site/`** into the root of `RobbeW/Blockly`. Keep the relative folders intact. The bundle contains the learning environment, teacher interface, linked public syllabus, Maze A/B/C and Turtle A/B/C. It is a complete website upload; the older chapter-2-only build command now prepares this same complete bundle.

The builder uses an explicit reviewed file list in `scripts/public-site-manifest.json`. New files need to be added to that list deliberately. It verifies hashes, local references, exported font/image data and exclusions. It refuses unexpected files or symlinks in the upload folder instead of silently publishing them. No network request, Git push or deployment is performed.

| Area | Publication policy |
|---|---|
| Public HTML, assessment runtime, diagrams, fonts, Blockly and PDF.js libraries | Included with their existing URLs and licenses |
| `syllabus/syllabus_blockly_in_de_klas.pdf` and page images | Public teaching material; included |
| Harness, agent settings, local policies and caches | Local only |
| Grading application, rubrics, original tests, submissions, feedback and teacher decisions | Local only; keep private backups |
| Unlinked course/exam working PDFs, working screenshots and brand notes | Retained locally and excluded from publication |
| Finder metadata, credentials, generated outputs and runtime environments | Excluded |

The browser teacher interface is public application code. Its class records are entered by the user and saved in that browser's local storage; those browser records are not bundled as website content.

`.gitignore` excludes local-only material from future Git additions. Files already tracked must also be removed from the Git index to stop including them in future commits. Ignoring or untracking a file does not erase earlier Git history or remove an existing deployed file until the cleanup commit is pushed and deployed. Do not upload the whole working folder through GitHub's web file picker: that picker does not apply your local `.gitignore`.

The sibling README and checksum manifest under `output/github-upload/` are local packaging records; upload only the contents of `site/`.
