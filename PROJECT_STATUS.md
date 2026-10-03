# Project Status

This is the single authoritative current project-status tracker. Functional scope is recorded in [requirements](docs/requirements.md); update this file when verified project status changes.

## Project phase

- **Phase 0 — Planning:** COMPLETE
- **Phase 1 — Foundation:** COMPLETE
- **Phase 2A — Goods Donation:** COMPLETE
- **Phase 2B — Cash Donation:** COMPLETE

## Git state

- **Branch:** `main`
- **Phase 2A feature checkpoint:** `7a06f983cc9abe302c1ca32262d738a3f1c6d9b7` (`feat: complete Goods Donation phase 2A`), pushed to `origin/main`.
- **Phase 2B feature checkpoint:** `e2ed677d31960f47d28afb4d691b8608f330ce26` (`feat: complete Cash Donation phase 2B`), pushed to `origin/main`.
- **Inventory feature checkpoint:** `edc6eeba85bfe057c92159554a8794586ef1f735` (`feat: complete Inventory`), committed and pushed to `origin/main`.
- **Inventory documentation sync:** `14392656d333569da78333f91006e8b468653327`, committed and pushed to `origin/main`.
- **Dashboard feature checkpoint:** `644fceba3822f45d13bad574117c2457cc211b11` (`feat: complete Dashboard`), committed and pushed to `origin/main`.
- **Dashboard documentation sync:** `d0137dd8889dac5b3b43ac8f5d692fc1c6cde7cd` (`docs: sync Dashboard completion status`), committed and pushed to `origin/main`.
- **Volunteer feature checkpoint:** `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`), committed and pushed to `origin/main`.
- **Volunteer documentation sync:** `9eccd9ea887d04b80388dcfbc394861d389662a9` (`docs: sync Volunteer completion status`), committed and pushed to `origin/main`.
- **GitHub:** Private repository `wariza818189/ces-portal`; remote `origin` is configured.
- **Working tree:** All feature checkpoints listed above are committed and pushed. Check Git status for local changes.

## Current feature status

- Phase 2A Goods Donation implementation and runtime acceptance are complete. Runtime classification was **PASS WITH NOTES**. Its feature checkpoint is committed and pushed.
- Phase 2B Cash Donation implementation and runtime acceptance are complete, classified **PASS WITH NOTES**. Its feature checkpoint is committed and pushed. Exactly one controlled Cash acceptance row remains as local evidence; no duplicate was created, and no further Cash submission is required.
- Dashboard is a confirmed requirement. Its implementation and integrated browser acceptance are complete, classified **PASS**. Feature checkpoint `644fceba3822f45d13bad574117c2457cc211b11` is committed and pushed to `origin/main`; documentation synchronization is complete.
- Inventory implementation and integrated browser acceptance are complete, classified **PASS WITH NOTES**. Its feature checkpoint `edc6eeba85bfe057c92159554a8794586ef1f735` is committed and pushed to `origin/main`; documentation synchronization is complete.
- Volunteer core workflow implementation is **COMPLETE** and runtime acceptance is **PASS WITH NOTES** under **SYNTHETIC / LOCAL DEMO ONLY**. Feature checkpoint `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`) and documentation sync `9eccd9ea887d04b80388dcfbc394861d389662a9` (`docs: sync Volunteer completion status`) are committed and pushed to `origin/main`; documentation synchronization is **COMPLETE**. Exactly one controlled synthetic acceptance row remains local evidence; no further Volunteer acceptance submission is required. Real personal-data collection and public production deployment are not approved; `/volunteers` remains unauthenticated/unprotected and its access-control/deployment design remains unresolved. Retention policy is pending CES/school policy confirmation.
- QuickChart static QR Code API for the Volunteer Signup poster is implemented and runtime accepted **PASS WITH NOTES** for **SYNTHETIC / LOCAL DEMO ONLY**. The exact QR payload decoded locally; phone scan remains a nonblocking note because no second device or confirmed phone-reachable URL was available. Zero database writes occurred. The feature checkpoint is **PENDING**; approved files are staged for review and remain uncommitted.
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

## Phase 2B complete

- Runtime acceptance classification: **PASS WITH NOTES**.
- Goods and Cash tabs passed browser acceptance. Goods remained selected initially and usable; its unsaved draft survived tab switching. No additional Goods record was submitted.
- Cash Amount, Date Received, optional Notes, pending state, error feedback and retention, successful reset, tab draft preservation, and practical keyboard/accessibility behavior passed. The inactive panel was excluded from ordinary keyboard navigation. This was not a full WCAG audit.
- Invalid attempts for missing required values, amount `0`, `1.234`, `10000000000`, a future received date, and notes over 255 characters were rejected without creating Cash rows.
- Exactly one controlled Cash acceptance row was saved. Browser confirmation was `Cash donation saved successfully.` Amount `125.25`, date `2026-10-03`, trimmed notes `Phase 2B cash acceptance 2026-10-03`, generated ID `1`, and `created_at` were verified; no duplicate row exists.
- Counts changed Goods `1 → 1`, Cash `0 → 1`, Volunteers `0 → 0`.
- Live Cash schema matched the expected columns and enforced positive amount constraint. TypeScript, lint, webpack production build, diff check, and 48 validation harness checks passed.
- Integrated browser testing used `http://localhost:3001/donations/new` because port `3000` was occupied by an older local server. This is an environment note, not an application defect.
- Phase 2B feature checkpoint: `e2ed677d31960f47d28afb4d691b8608f330ce26`, pushed to `origin/main`.

## Verified checks

See [testing](docs/testing.md) for the current runtime acceptance evidence and retained historical pre-migration evidence.

## Pending checks

- No further Phase 2B acceptance or database submission is required.
- No further Inventory database acceptance write is required; its acceptance was read-only.
- No further Dashboard database acceptance write is required; its acceptance was read-only.

## Inventory complete

- Approved direction: read-only view of recorded Goods Donations, with a category filter, expiry-soonest-first ordering, and shared derived Expired / Expiring soon / Fresh status.
- Free-text search is out of scope for this pass because the confirmed Goods fields do not provide a useful search target.
- Read-only Inventory implementation is complete in `app/(staff)/inventory/page.tsx` and `lib/expiry.ts`. Category filtering and derived Expired / Expiring soon / Fresh status are implemented.
- Integrated browser acceptance passed. At 1280px the table was usable; at 375px labelled cards were usable without horizontal overflow. The current row showed Canned, `1.25 pcs`, received `2026-10-01`, expiry `2026-12-01`, and Fresh, with application date `2026-10-03`.
- All/Canned filters showed the row; Rice showed a clear no-match state; invalid category safely resolved to All. Practical keyboard filter operation passed with no obvious keyboard trap and no relevant browser console/runtime errors.
- Goods and Cash forms still rendered; neither was submitted. Counts remained Goods `1 → 1`, Cash `1 → 1`, Volunteers `0 → 0`; zero database writes were performed. No runtime correction was required.
- Expiry helper harness: 27 checks passed; mocked Inventory renderer harness: 10 checks passed. TypeScript, lint, webpack production build, and `git diff --check` passed.
- Port `3002` was used because other development servers occupied lower ports; this was an environment note.
- Inventory runtime acceptance is **PASS WITH NOTES**. Feature checkpoint `edc6eeba85bfe057c92159554a8794586ef1f735` (`feat: complete Inventory`) is committed and pushed to `origin/main`. Documentation synchronization is complete.
- Expected minimal implementation scope: `app/(staff)/inventory/page.tsx` and `lib/expiry.ts`.

## Dashboard complete

- Read-only Dashboard implementation is complete in `app/(staff)/dashboard/page.tsx`. It shows Goods record count, Cash Donation Total, Volunteer submission count, and the Fresh / Expiring soon / Expired Goods summary.
- Runtime acceptance classification: **PASS**. Goods Records `1`, Cash Donation Total `125.25`, Volunteer Submissions `0`, Fresh `1`, Expiring soon `0`, Expired `0`; application date `2026-10-03`. No currency identifier is displayed.
- Desktop at 1280px and narrow layout at 375px passed with no horizontal overflow. Practical keyboard checks passed, and no relevant browser console/runtime errors were observed.
- Inventory regression passed. Goods and Cash forms rendered; neither was submitted.
- Database counts remained Goods `1 → 1`, Cash `1 → 1`, Volunteers `0 → 0`; Cash total remained `125.25`. Zero database writes were performed and no runtime correction was required.
- Focused harness: 114 checks passed. TypeScript, lint, webpack production build, and `git diff --check` passed.
- Dashboard feature checkpoint `644fceba3822f45d13bad574117c2457cc211b11` (`feat: complete Dashboard`) is committed and pushed to `origin/main`. Dashboard documentation sync `d0137dd8889dac5b3b43ac8f5d692fc1c6cde7cd` is also committed and pushed. Documentation synchronization is complete; expected source scope was `app/(staff)/dashboard/page.tsx` only.

## Volunteer core workflow complete — SYNTHETIC / LOCAL DEMO ONLY

- Approved implementation boundary: **SYNTHETIC / LOCAL DEMO ONLY**. This does not approve real personal-information collection or public production deployment.
- Approved notice purpose: “The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.” The public form must show this notice before submission and require acknowledgement: “I understand that the information I provide will be used for CES volunteer registration and activity coordination.” The acknowledgement gates submission only; consent evidence is not stored. No schema change for consent storage is approved.
- Contact numbers may be used only for communication related to the selected CES activity and necessary activity coordination. Intended viewers are CES Staff / CES Coordinator.
- All four fields (`full_name`, `course_year`, `contact_number`, `activity`) are required and nonblank after trimming. Trim surrounding whitespace, preserve meaningful internal text, enforce schema limits without truncation (100, 100, 30, and 150 characters respectively), and preserve contact numbers as strings including leading zeros. No phone regex, minimum length, course/activity list, capitalization, or phone normalization is approved.
- Real-data operation remains blocked until an access-control/deployment design exists for `/volunteers`. The route is not protected by staff route grouping. Authentication remains outside MVP scope.
- Retention policy pending CES/school policy confirmation. No delete feature is approved. QuickChart poster integration status and acceptance are recorded below.
- Public `/volunteer` form, server validation, parameterized persistence, and read-only `/volunteers` view are implemented in the five approved Volunteer source files. Dashboard source was not changed.
- Runtime acceptance completed with classification **PASS WITH NOTES**. The built-in integrated browser was unavailable; actual working-tree application acceptance used temporary headless Firefox. This was a tooling note, not an application defect.
- Browser acceptance passed at 375px for the public form and at 1280px / 375px for staff submissions. Practical keyboard checks passed; this was not a full WCAG audit. No relevant runtime or console errors were observed.
- Exactly one controlled synthetic acceptance row was created and remains local evidence: Full Name `Synthetic Volunteer Acceptance`, Course / Year `BSIT 3 - DEMO`, Contact Number `00000000000`, Activity `CES Volunteer Demo Activity`, ID `1`, `created_at` `2026-10-03 13:15:52`. No duplicate exists and no further Volunteer submission is required.
- Counts changed Goods `1 → 1`, Cash `1 → 1`, Volunteers `0 → 1`; Cash total remained `125.25`. Dashboard showed Volunteer Submissions `1`. Invalid attempts created no rows.
- Validation trims surrounding whitespace while preserving internal whitespace, uses Unicode-aware limits of 100 / 100 / 30 / 150, and preserves leading zeroes in contact numbers. Acknowledgement is required to submit but is not stored as consent evidence.
- Dashboard, Inventory, Goods form, and Cash form regressions passed; neither donation form was submitted. The 141 focused checks, TypeScript, lint, webpack production build, and `git diff --check` passed.
- Core workflow implementation is **COMPLETE**. Runtime acceptance is **PASS WITH NOTES**. Feature checkpoint `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`) and documentation sync `9eccd9ea887d04b80388dcfbc394861d389662a9` (`docs: sync Volunteer completion status`) are committed and pushed to `origin/main`; documentation synchronization is **COMPLETE**. Exactly one controlled synthetic acceptance row remains locally; Volunteers changed `0 → 1`, and Dashboard Volunteer Submissions correctly became `1`. Zero duplicate Volunteer rows exist; no further Volunteer acceptance submission is required. The 141 focused checks, TypeScript, lint, webpack production build, and diff check passed. Browser note: the built-in connector was unavailable; working-tree acceptance completed successfully with temporary headless Firefox.
- Real personal-data collection and public production deployment are **NOT approved**. `/volunteers` remains unauthenticated/unprotected; authentication remains outside the current MVP. The acknowledgement is not stored as consent evidence. Retention policy remains pending CES/school policy confirmation; no delete workflow was added.

## IT305 QuickChart QR API integration — PASS WITH NOTES — SYNTHETIC / LOCAL DEMO ONLY

- The selected provider is QuickChart static QR Code API at `https://quickchart.io/qr`, supporting the existing Volunteer Signup poster workflow as an academic/course integration decision, not a new CES stakeholder requirement.
- Implementation is complete in the server-only QR helper and `/volunteers/poster`; `/volunteers` links to the poster without prefetching. Configuration uses server-only `VOLUNTEER_SIGNUP_URL`. The validated QR uses a static PNG, fixed rendering settings, bounded request/response handling, strict PNG decode validation, and 24-hour success-only `unstable_cache` reuse. No database or schema changes were made.
- Acceptance: 126 temporary focused assertions passed; TypeScript, lint, webpack production build, and diff checks passed. One sandbox build attempt failed in the TypeScript subprocess; the successful webpack build used the established outside-sandbox path.
- A controlled live QuickChart request returned a validated PNG. The rendered QR was decoded locally with `jsQR` to exactly `http://localhost:3012/volunteer`; no online decoder was used. The visible fallback URL matched. Desktop, 375px, print-media retention/hiding, safe failure states, and route regressions passed. Physical printing was not tested.
- `/volunteer`, existing synthetic `/volunteers` row, Dashboard count `1`, Inventory, Goods form, and Cash form rendered successfully without submissions. Database values stayed Goods `1`, Cash `1`, Volunteers `1`, Cash total `125.25`; zero writes occurred.
- A physical phone scan was not performed because no second device or confirmed phone-reachable URL was available. Future demonstration should configure a phone-reachable `VOLUNTEER_SIGNUP_URL`.
- During one mistaken repository build, Next.js loaded `.env.local` internally. The file contents were not inspected, printed, modified, copied, or included in evidence. Successful build and live acceptance subsequently used a secret-free temporary copy/process environment. This is an environment note, not a security incident.
- Feature checkpoint remains **PENDING** until commit is authorized. Proposed message: `feat: integrate QuickChart Volunteer QR poster`.

## Blockers and stakeholder decisions

- IT305 teacher guidance calls for meaningful external API integration. This academic/course requirement is separate from CES stakeholder functional requirements and should support existing CES functionality rather than add unrelated scope. The QuickChart Volunteer Signup poster integration is implemented and runtime accepted as recorded above.
- Any additional unresolved stakeholder questions should be recorded in [requirements](docs/requirements.md), not inferred from schema or placeholder pages.

## Next action

Review the unstaged and staged QuickChart implementation/documentation checkpoint; commit only after explicit authorization.
