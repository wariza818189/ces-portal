# Project Status

This is the single authoritative current project-status tracker. Functional scope is recorded in [requirements](docs/requirements.md); update this file when verified project status changes.

## Project phase

- **Phase 0 — Planning:** COMPLETE
- **Phase 1 — Foundation:** COMPLETE
- **Phase 2A — Goods Donation:** RUNTIME ACCEPTANCE COMPLETE — CHECKPOINT PENDING

## Git state

- **Branch:** `main`
- **Committed baseline:** `30fe83d239e62fbc20c0fa00ef1bcd02c803c180` on `main`, tracking `origin/main`.
- **GitHub:** Private repository `wariza818189/ces-portal`; remote `origin` is configured. No Phase 2A feature checkpoint has been committed or pushed.
- **Working tree:** Phase 2A implementation and acceptance documentation are staged for review; the feature checkpoint commit has not been created.

## Current feature status

- Phase 2A Goods Donation implementation and runtime acceptance are complete. The checkpoint remains pending until its feature commit exists.
- Cash Donation is a confirmed requirement but is not implemented.
- Dashboard and Inventory are confirmed requirements but remain placeholders without database-backed records.
- Volunteer Signup and the read-only Volunteer Submissions view are confirmed requirements but remain placeholders; the QR poster workflow and external API integration are not implemented.
- Authentication is not implemented.

## Phase 2A runtime acceptance complete — checkpoint pending

- Runtime acceptance classification: **PASS WITH NOTES**.
- Actual integrated browser rendering confirmed the Goods UI is usable and Cash is disabled. No relevant runtime or console errors were observed.
- Missing required values, quantity `0`, `1.234`, and `100000000`, and a future received date were rejected. Invalid attempts created no rows.
- A narrow correction retained category and unit after server validation failure. Browser verification after the correction confirmed retention of category, quantity, unit, received date, and expiry date.
- Practical keyboard and accessibility checks passed; this was not a full WCAG audit.
- Exactly one controlled valid Goods Donation submission was persisted. The browser showed success, Goods count changed `0 → 1`, Cash remained `0`, Volunteer remained `0`, and exactly one matching row was present with category, quantity `1.25`, unit, received date, expiry date, and `created_at` persisted correctly.
- Duplicate-safety semantics were confirmed. Success reset was observed in the controlled submission before the retention correction; after that correction, the success path was checked by code inspection rather than another database submission.
- TypeScript, lint, webpack production build, and `git diff --check` passed. Plain Turbopack `npm run build` encountered an environment-specific local-port `Operation not permitted` restriction; the webpack build passed and this is not classified as an application defect.
- Expiry earlier than received remains allowed and is not hard rejected. The optional warning was not observed after a persisted browser submission; non-hard-rejection behavior was supported by browser behavior and focused code inspection. A second persisted submission was not performed for the optional warning.
- The Phase 2A feature checkpoint commit requires explicit authorization.

## Verified checks

See [testing](docs/testing.md) for the current runtime acceptance evidence and retained historical pre-migration evidence.

## Pending checks

The Phase 2A checkpoint commit remains pending. No further Goods Donation submission is needed for the accepted scope.

## Blockers and stakeholder decisions

- IT305 teacher guidance calls for meaningful external API integration. This is an academic/course requirement, separate from CES stakeholder functional requirements, and should support existing CES functionality rather than add unrelated scope.
- Candidate: external QR-code generation for a future Volunteer Signup/poster workflow.
- Exact API/provider: **PENDING**. No implementation has started.
- Any additional unresolved stakeholder questions should be recorded in [requirements](docs/requirements.md), not inferred from schema or placeholder pages.

## Next action

Review the staged Phase 2A checkpoint and create its commit only when explicitly authorized. Do not push without explicit authorization. Do not begin Cash Donation before the Phase 2A checkpoint is committed.
