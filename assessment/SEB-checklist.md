# Safe Exam Browser pilot checklist — Maze versie A

**Status: not yet verified on a school device.** Complete this checklist with the school's actual SEB version, deployment method, HTTPS host, and Smartschool tenant before using the assessment. Do not treat an unchecked item as tested.

## Before building the `.seb` configuration

- [ ] Confirm the exact HTTPS start URL for the hosted Maze assessment.
- [ ] Confirm the Smartschool assignment URL and school sign-in/SSO fallback URL. Both assessment fields should be HTTPS.
- [ ] Confirm which Smartschool login and SSO hostnames are actually used by this school and identity provider.
- [ ] Confirm the installed Safe Exam Browser version and platform on the student devices.
- [ ] Confirm the configured start password (`Charles` for version A) in `assessment/maze-version-a.js`.
- [ ] Set the SEB quit password only in the `.seb` configuration. Keep it out of the page, source files, and student instructions.
- [ ] Decide how students receive the approved `.seb` file and the quit password after submitting.

## SEB configuration to review

- [ ] Set the assessment's exact hosted HTTPS URL as the start URL.
- [ ] Hide or lock browser address/navigation controls as required by the school's exam policy.
- [ ] Permit downloads needed to save the generated assessment PDF. Verify the browser's download prompt or save location on the real student device.
- [ ] Permit the student to open Smartschool and upload the downloaded PDF. Allow only the exact assessment host and the Smartschool sign-in/SSO endpoints confirmed for this tenant.
- [ ] Review cross-domain navigation and new-window behavior. If a Smartschool button opens a new window or redirects to another domain, allow only the required, verified hostnames; keep the allowlist narrow.
- [ ] Permit the assessment's exact static app assets from its host: HTML, JavaScript, CSS, Blockly assets, images, fonts, and PDF library files.
- [ ] Verify that the SEB policy permits the Blob-backed Web Worker used by Maze execution. Student code runs in that worker and the main page stops it on timeout or Stop.
- [ ] Verify that PDF creation and font loading work inside the installed SEB version. In particular, check local font assets and the browser's download behavior.
- [ ] Check pop-up/new-window handling for the Smartschool open and fallback controls.
- [ ] Check that the chosen policy allows the required clipboard, keyboard, and accessibility behavior for the answer fields, code editor, and selection-based marking task.
- [ ] Configure the intended SEB exit/quit behavior and store the quit password only in the SEB configuration.

## Real-device pilot

- [ ] Launch the exact hosted HTTPS assessment from the final `.seb` configuration on a student device.
- [ ] Verify the start gate, Blockly load, maze execution, Stop behavior, and timeout behavior.
- [ ] Verify that `while (true) {}` stops without freezing the page or leaving the browser stuck.
- [ ] Verify draft persistence after navigating between questions and after closing/reopening the assessment in the same browser profile.
- [ ] Verify that a new attempt creates a separate attempt record and that the intended student identity resumes only its matching active record.
- [ ] Verify PDF creation, local download, readable fonts, and inclusion of the selected final branch only.
- [ ] Verify submission by signing in to the real Smartschool tenant, uploading the PDF to the correct assignment, and confirming the submitted file in Smartschool.
- [ ] Verify any required cross-domain redirect, SSO popup, download dialog, and return-to-SEB flow.
- [ ] Only after Smartschool confirms the upload, give the student the teacher-provided SEB quit password and have them exit SEB.
- [ ] Repeat the complete flow once on each device/operating-system combination used for the exam.
- [ ] Record the SEB version, device platform, hosted URL, Smartschool endpoints allowed, and pilot date for the approved setup.

The page can guide students through download, Smartschool submission, and SEB exit, but it cannot inspect Smartschool or confirm that a file was uploaded. The teacher must verify the submission in Smartschool and then provide the quit password manually. No `.seb` file is supplied by this project because the school URLs, quit password, SEB version, and platform-specific policy are not yet known.
