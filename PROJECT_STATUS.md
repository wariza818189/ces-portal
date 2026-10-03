# Project Status

This is the single authoritative current project-status tracker. Functional scope is recorded in [requirements](docs/requirements.md); update this file when verified project status changes.

## Project phase

- **Phase 0 — Planning:** COMPLETE
- **Phase 1 — Foundation:** COMPLETE
- **Phase 2A — Goods Donation:** IMPLEMENTATION CORRECTIONS COMPLETE; RUNTIME ACCEPTANCE PENDING

## Git state

- **Branch:** `main`
- **Committed baseline before documentation checkpoint:** `bf4973b` — `chore: establish MySQL database foundation` (`origin/main` at this baseline before the documentation push).
- **Documentation checkpoint:** Established as its own local commit, `docs: establish CES project documentation foundation`.
- **GitHub:** Private repository `wariza818189/ces-portal`; remote `origin` is configured. The documentation checkpoint has not been pushed.
- **Working tree:** Separate intentional, uncommitted Phase 2A Goods Donation work remains in `.env.example`, `app/(staff)/donations/new/page.tsx`, `components/donations/goods-form.tsx`, `lib/actions/donations.ts`, `lib/constants.ts`, `lib/date.ts`, and `lib/validation/donations.ts`.

## Current feature status

- Phase 2A Goods Donation form, server-side validation, parameterized save action, and date handling are implemented as uncommitted work. Do not mark the phase complete before runtime acceptance and its checkpoint.
- Cash Donation is a confirmed requirement but is not implemented.
- Dashboard and Inventory are confirmed requirements but remain placeholders without database-backed records.
- Volunteer Signup and the read-only Volunteer Submissions view are confirmed requirements but remain placeholders; the QR poster workflow and external API integration are not implemented.
- Authentication is not implemented.

## Phase 2A runtime acceptance pending

- Browser runtime verification.
- Invalid-input UI testing.
- Form input-retention verification.
- Keyboard and accessibility verification.
- One controlled valid Goods Donation insert.
- Direct MySQL persistence verification and expected row-count check.
- Duplicate-safety confirmation.
- Final diff review.
- Phase 2A checkpoint commit (requires explicit authorization).

## Verified checks

Repository inspection confirmed the branch, HEAD, dirty Phase 2A paths, schema, routes, and implementation structure. This status entry does not claim that lint, build, browser, or database checks passed.

## Pending checks

All Phase 2A runtime acceptance items above remain pending unless separately recorded with evidence. No browser acceptance is complete.

## Blockers and stakeholder decisions

- IT305 teacher guidance calls for meaningful external API integration. This is an academic/course requirement, separate from CES stakeholder functional requirements, and should support existing CES functionality rather than add unrelated scope.
- Candidate: external QR-code generation for a future Volunteer Signup/poster workflow.
- Exact API/provider: **PENDING**. No implementation has started.
- Any additional unresolved stakeholder questions should be recorded in [requirements](docs/requirements.md), not inferred from schema or placeholder pages.

## Next action

After the amended documentation checkpoint is pushed to the configured private `origin/main` with explicit authorization, finish Phase 2A runtime acceptance. Do not jump to Cash Donation before that acceptance is complete.
