# Project Status

This is the single authoritative current project-status tracker. Functional scope is recorded in [requirements](docs/requirements.md); update this file when verified project status changes.

## Project phase

- **Phase 0 — Planning:** COMPLETE
- **Phase 1 — Foundation:** COMPLETE
- **Phase 2A — Goods Donation:** COMPLETE
- **Phase 2B — Cash Donation:** IMPLEMENTATION AND RUNTIME ACCEPTANCE COMPLETE — CHECKPOINT PENDING

## Git state

- **Branch:** `main`
- **Phase 2A feature checkpoint:** `7a06f983cc9abe302c1ca32262d738a3f1c6d9b7` (`feat: complete Goods Donation phase 2A`), pushed to `origin/main`.
- **GitHub:** Private repository `wariza818189/ces-portal`; remote `origin` is configured.
- **Working tree:** Phase 2B application changes and acceptance documentation are staged for checkpoint review; the Phase 2B commit has not been created.

## Current feature status

- Phase 2A Goods Donation implementation and runtime acceptance are complete. Runtime classification was **PASS WITH NOTES**. Its feature checkpoint is committed and pushed.
- Phase 2B Cash Donation implementation and runtime acceptance are complete, classified **PASS WITH NOTES**. One controlled Cash acceptance row is retained locally; no duplicate was created. Its checkpoint commit remains pending.
- Dashboard and Inventory are confirmed requirements but remain placeholders without database-backed records.
- Volunteer Signup and the read-only Volunteer Submissions view are confirmed requirements but remain placeholders; the QR poster workflow and external API integration are not implemented.
- Authentication is not implemented.

## Phase 2A complete

- Runtime acceptance classification: **PASS WITH NOTES**.
- Actual integrated browser rendering confirmed the Goods UI is usable and Cash is disabled. No relevant runtime or console errors were observed.
- Missing required values, quantity `0`, `1.234`, and `100000000`, and a future received date were rejected. Invalid attempts created no rows.
- A narrow correction retained category and unit after server validation failure. Browser verification after the correction confirmed retention of category, quantity, unit, received date, and expiry date.
- Practical keyboard and accessibility checks passed; this was not a full WCAG audit.
- Exactly one controlled valid Goods Donation submission was persisted. The browser showed success, Goods count changed `0 → 1`, Cash remained `0`, Volunteer remained `0`, and exactly one matching row was present with category, quantity `1.25`, unit, received date, expiry date, and `created_at` persisted correctly.
- Duplicate-safety semantics were confirmed. Success reset was observed in the controlled submission before the retention correction; after that correction, the success path was checked by code inspection rather than another database submission.
- TypeScript, lint, webpack production build, and `git diff --check` passed. Plain Turbopack `npm run build` encountered an environment-specific local-port `Operation not permitted` restriction; the webpack build passed and this is not classified as an application defect.
- Expiry earlier than received remains allowed and is not hard rejected. The optional warning was not observed after a persisted browser submission; non-hard-rejection behavior was supported by browser behavior and focused code inspection. A second persisted submission was not performed for the optional warning.
- Exactly one controlled Goods Donation acceptance row remains as local acceptance evidence. No further Phase 2A submission is required.

## Phase 2B runtime acceptance complete — checkpoint pending

- Runtime acceptance classification: **PASS WITH NOTES**.
- Goods and Cash tabs passed browser acceptance. Goods remained selected initially and usable; its unsaved draft survived tab switching. No additional Goods record was submitted.
- Cash Amount, Date Received, optional Notes, pending state, error feedback and retention, successful reset, tab draft preservation, and practical keyboard/accessibility behavior passed. The inactive panel was excluded from ordinary keyboard navigation. This was not a full WCAG audit.
- Invalid attempts for missing required values, amount `0`, `1.234`, `10000000000`, a future received date, and notes over 255 characters were rejected without creating Cash rows.
- Exactly one controlled Cash acceptance row was saved. Browser confirmation was `Cash donation saved successfully.` Amount `125.25`, date `2026-10-03`, trimmed notes `Phase 2B cash acceptance 2026-10-03`, generated ID `1`, and `created_at` were verified; no duplicate row exists.
- Counts changed Goods `1 → 1`, Cash `0 → 1`, Volunteers `0 → 0`.
- Live Cash schema matched the expected columns and enforced positive amount constraint. TypeScript, lint, webpack production build, diff check, and 48 validation harness checks passed.
- Integrated browser testing used `http://localhost:3001/donations/new` because port `3000` was occupied by an older local server. This is an environment note, not an application defect.
- Phase 2B implementation is in the five expected source paths and awaits checkpoint review; do not mark it checkpointed until its commit exists.

## Verified checks

See [testing](docs/testing.md) for the current runtime acceptance evidence and retained historical pre-migration evidence.

## Pending checks

Phase 2B checkpoint review and commit authorization remain pending. No further Cash acceptance submission is required.

## Blockers and stakeholder decisions

- IT305 teacher guidance calls for meaningful external API integration. This is an academic/course requirement, separate from CES stakeholder functional requirements, and should support existing CES functionality rather than add unrelated scope.
- Candidate: external QR-code generation for a future Volunteer Signup/poster workflow.
- Exact API/provider: **PENDING**. No implementation has started.
- Any additional unresolved stakeholder questions should be recorded in [requirements](docs/requirements.md), not inferred from schema or placeholder pages.

## Next action

Review and create the Phase 2B checkpoint commit after explicit authorization.
