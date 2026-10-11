# Project Status

This is the single authoritative current project-status tracker. Functional scope is recorded in [requirements](docs/requirements.md); update this file when verified project status changes.

## Project phase

- **Phase 0 — Planning:** COMPLETE
- **Phase 1 — Foundation:** COMPLETE
- **Phase 2A — Goods Donation:** COMPLETE
- **Phase 2B — Cash Donation:** COMPLETE
- **Post-MVP UI/UX Redesign — UI-1 through UI-5:** COMPLETE; final integrated UI acceptance **PASS WITH NOTES** (2026-10-08).
- **CES Portal v2 — R1 Authentication, Authorization, and Audit Foundation: COMPLETE**; **PASS WITH NOTES — R1 TARGET MYSQL 8.4 ACCEPTANCE COMPLETE** (2026-10-09). R1 is a later operational expansion; authentication was excluded from the original stakeholder-confirmed MVP.
- **CES Portal v2 — R2 Activity Management: COMPLETE**; **PASS WITH NOTES — R2 TARGET MYSQL 8.4 ACCEPTANCE COMPLETE**. R3 has not started.

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
- **UI-1 — Foundations + Staff Shell:** `72393c737d4d398f63cea52d4702eec8572f8d8c` (`feat: add CES UI foundations and staff shell`), committed and pushed to `origin/main`. Semantic Tailwind 4 tokens, responsive shell, 240px sidebar, compact mobile navigation, active-route semantics, skip link, PageContainer/PageHeader, and rendered poster print-shell compatibility accepted.
- **UI-2A — Read-only Staff Pages:** `d43a50604d6e1c9b1b473016c1b6faf361e71f48` (`feat: redesign read-only staff pages`), committed and pushed to `origin/main`. Dashboard, Inventory, Volunteer Submissions, Card, StatusBadge, and shared button/link presentation accepted without functional/query/data behavior changes.
- **UI-2B — Donation Workspace:** `8b06d91467f439aa5af5b5261a76e04a39190694` (`feat: redesign donation workspace`), committed and pushed to `origin/main`. Goods/Cash workspace and form presentation accepted; mounted panels, keyboard tabs, drafts, exact decimal validation, reset/revision behavior, pending protection, and Server Actions preserved; zero database writes during redesign acceptance.
- **UI-3 — Public Volunteer Experience:** `d50b85ae7626fe36eaa58f36af415cd39ba599fd` (`feat: redesign public volunteer experience`), committed and pushed to `origin/main`. Wider public layout, form-first ~60/40 desktop composition, form-before-map mobile order, and OSM venue card accepted. Exact privacy/acknowledgement text, gating-only semantics, validation/actions, configuration/helper behavior, and map independence preserved; zero database writes.
- **UI-4 — QR Poster:** `a461fe01f648db1af9252a32827fd483cb2c3300` (`feat: polish volunteer QR poster`), committed and pushed to `origin/main`. Hierarchy, controls, fallbacks, responsive layout, and rendered A4 print accepted; 600×600 source, approximately 280px screen QR, 74mm print QR, QuickChart behavior, direct URL, and demo warning preserved.
- **UI-5 — Final Integrated UI Acceptance:** acceptance-only at UI-4 HEAD; no defects required correction and no source/feature commit was required. The working tree and index remained clean at acceptance.
- **R1 source checkpoint:** `3c1e9ec9b4d44d8cce8243efe0b548f418fd010f` (`feat: add staff authentication and audit foundation`), committed and pushed to `origin/main`.
- **R2 source checkpoint:** `7a0ea4e859b35a0e3b404f2ccecabe93435fcc8e` (`feat: add activity management and volunteer linking`), committed and pushed to `origin/main`.
- **GitHub:** Private repository `wariza818189/ces-portal`; remote `origin` is configured.
- **Working tree:** All feature checkpoints listed above are committed and pushed. Check Git status for local changes.

## Current feature status

- **Post-MVP UI/UX redesign is COMPLETE**, final integrated UI acceptance **PASS WITH NOTES** at `a461fe01f648db1af9252a32827fd483cb2c3300`. All six routes, responsive layouts, practical keyboard/accessibility smoke, invalid-only form regressions, OSM independence, and rendered A4 QR regression passed. No source defect was found during UI-5; the working tree was clean at acceptance. Full evidence and limitations are in [testing](docs/testing.md#post-mvp-uiux-redesign--final-integrated-ui-acceptance).
- **Historical local database measurement (UI-5, 2026-10-08):** operator read-only before/after snapshots matched: Goods `0 → 0`, Cash `0 → 0`, Volunteers `0 → 0`, Cash total `0.00 → 0.00`; **zero database writes**, no valid acceptance submissions. Earlier sections preserve historical controlled-row evidence; the documentation does not infer why the local database state changed.
- Academic/classroom readiness remains **SYNTHETIC / LOCAL DEMO ONLY**. Real personal-information collection and public production deployment remain unapproved. `/volunteers` is now restricted to authenticated active staff under R1; acknowledgement is not durable consent evidence, and privacy/retention, deployment hardening, and operational governance remain pending.

- Phase 2A Goods Donation implementation and runtime acceptance are complete. Runtime classification was **PASS WITH NOTES**. Its feature checkpoint is committed and pushed.
- Phase 2B Cash Donation implementation and runtime acceptance are complete, classified **PASS WITH NOTES**. Its feature checkpoint is committed and pushed. Historical Cash acceptance created one controlled row without a duplicate; the evidence remains documented. UI-5 measured zero Cash rows; no further Cash acceptance submission is required.
- Dashboard is a confirmed requirement. Its implementation and integrated browser acceptance are complete, classified **PASS**. Feature checkpoint `644fceba3822f45d13bad574117c2457cc211b11` is committed and pushed to `origin/main`; documentation synchronization is complete.
- Inventory implementation and integrated browser acceptance are complete, classified **PASS WITH NOTES**. Its feature checkpoint `edc6eeba85bfe057c92159554a8794586ef1f735` is committed and pushed to `origin/main`; documentation synchronization is complete.
- Volunteer core workflow implementation is **COMPLETE** and runtime acceptance is **PASS WITH NOTES** under **SYNTHETIC / LOCAL DEMO ONLY**. Feature checkpoint `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`) and documentation sync `9eccd9ea887d04b80388dcfbc394861d389662a9` (`docs: sync Volunteer completion status`) are committed and pushed to `origin/main`; documentation synchronization is **COMPLETE**. Historical Volunteer acceptance created one controlled synthetic row; the evidence remains documented. UI-5 measured zero Volunteer rows; no further Volunteer acceptance submission is required. Real personal-data collection and public production deployment are not approved; `/volunteers` is now protected by R1 active-staff authorization; broader privacy, deployment, and operational work remains unresolved. Retention policy is pending CES/school policy confirmation.
- QuickChart static QR Code API for the Volunteer Signup poster is implemented and runtime accepted **PASS WITH NOTES** for **SYNTHETIC / LOCAL DEMO ONLY**. The exact QR payload decoded locally; phone scan remains a nonblocking note because no second device or confirmed phone-reachable URL was available. Zero database writes occurred. Feature checkpoint `07c8141792aea8b83ca5b20ed1b19f11507274c6` (`feat: integrate QuickChart Volunteer QR poster`) is committed and pushed to `origin/main`; implementation is **COMPLETE**. Documentation synchronization is **COMPLETE** in this follow-up commit.
- **Current v2 R1 state:** staff authentication/authorization, eight-hour opaque database-backed sessions, Argon2id hashes, active `ADMIN`/`STAFF` checks, database login throttling, login/logout, application audit trail, and donation actor attribution are implemented. Staff pages and Goods/Cash actions enforce server-side checks; `/login` and `/volunteer` remain public. Migration 001 passed on actual MySQL `8.4.11`, database `ces_portal`.
- **Historical accepted target database measurement (R1, 2026-10-09):** Goods `1 → 1`, Cash `0 → 1`, Volunteers `1 → 1`, Cash total `0.00 → 0.01`. Migration preserved the pre-write snapshot. Exactly one authorized synthetic Cash acceptance row was created, with `recorded_by = authenticated Admin ID = audit actor = 1`. Auth/support writes are separate; R1 was not zero-write acceptance. UI-5 and R1 are separate point-in-time acceptance measurements; no cause of the intervening database-state difference is inferred. See [R1 testing](docs/testing.md#ces-portal-v2-r1--authentication-authorization-and-audit-foundation).

- **Current v2 R2 state:** protected `/activities` workspace; managed Draft/Active/Closed/Archived Activities; explicit transitions; Draft/Active editing; terminal Archive; no hard delete; revision protection and transactional Activity audit. Both active ADMIN/STAFF manage Activities. Migration 002 adds Activities, nullable Volunteer links, and expanded audit events without historical matching/backfill.
- **New Volunteer signup:** select an ACTIVE managed Activity; eligibility depends only on status, including past/future dates. The server verifies it under a shared lock and stores its ID plus canonical Activity-name snapshot. Historical rows remain unlinked; later name changes do not alter snapshots. There is no free-text fallback.
- **Current presentation:** selected Activity venue/location controls OSM; configured venue appears only as demonstration context without selection. Staff navigation is Dashboard, Donations, Inventory, Activities, Volunteers; desktop sidebar and visible two-column mobile navigation remain (five links span three narrow-screen rows, no hamburger). Poster remains a Volunteers subaction. QR remains generic `/volunteer`; Dashboard has no Activity metric and counts both linked and unlinked Volunteers.
- **Latest accepted target database measurement (R2, MySQL 8.4.11, `ces_portal`):** Goods `1`, Cash `1`, Volunteers `2`, Cash total `0.01`, Activities `1`. Migration 002 preserved the pre-write Goods `1`, Cash `1`, Volunteers `1`, Cash total `0.01`, Activities `0`. One controlled synthetic Activity is retained Archived at revision `5`, and one linked synthetic Volunteer retains the original name snapshot. Historical Volunteer remains unlinked; no destructive cleanup. See [R2 testing](docs/testing.md#ces-portal-v2-r2--activity-management).

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
- Historical acceptance created one controlled Goods Donation row and the evidence remains documented. UI-5 measured zero Goods rows; no further Phase 2A submission is required.

## Phase 2B complete

- Runtime acceptance classification: **PASS WITH NOTES**.
- Goods and Cash tabs passed browser acceptance. Goods remained selected initially and usable; its unsaved draft survived tab switching. No additional Goods record was submitted.
- Cash Amount, Date Received, optional Notes, pending state, error feedback and retention, successful reset, tab draft preservation, and practical keyboard/accessibility behavior passed. The inactive panel was excluded from ordinary keyboard navigation. This was not a full WCAG audit.
- Invalid attempts for missing required values, amount `0`, `1.234`, `10000000000`, a future received date, and notes over 255 characters were rejected without creating Cash rows.
- Exactly one controlled Cash acceptance row was saved. Browser confirmation was `Cash donation saved successfully.` Amount `125.25`, date `2026-10-03`, trimmed notes `Phase 2B cash acceptance 2026-10-03`, generated ID `1`, and `created_at` were verified; no duplicate row was found during that acceptance.
- Counts changed Goods `1 → 1`, Cash `0 → 1`, Volunteers `0 → 0`.
- Live Cash schema matched the expected columns and enforced positive amount constraint. TypeScript, lint, webpack production build, diff check, and 48 validation harness checks passed.
- Integrated browser testing used `http://localhost:3001/donations/new` because port `3000` was occupied by an older local server. This is an environment note, not an application defect.
- Phase 2B feature checkpoint: `e2ed677d31960f47d28afb4d691b8608f330ce26`, pushed to `origin/main`.

## Verified checks

See [testing](docs/testing.md) for the latest R2 target acceptance, final integrated UI acceptance, and retained historical module/system evidence.

## Pending checks

- No further Phase 2B acceptance or database submission is required.
- No further Inventory database acceptance write is required; its acceptance was read-only.
- No further Dashboard database acceptance write is required; its acceptance was read-only.

## Inventory complete

- Approved direction: read-only view of recorded Goods Donations, with a category filter, expiry-soonest-first ordering, and shared derived Expired / Expiring soon / Fresh status.
- Free-text search is out of scope for this pass because the confirmed Goods fields do not provide a useful search target.
- Read-only Inventory implementation is complete in `app/(staff)/inventory/page.tsx` and `lib/expiry.ts`. Category filtering and derived Expired / Expiring soon / Fresh status are implemented.
- Integrated browser acceptance passed. At 1280px the table was usable; at 375px labelled cards were usable without horizontal overflow. The row recorded during that acceptance showed Canned, `1.25 pcs`, received `2026-10-01`, expiry `2026-12-01`, and Fresh, with application date `2026-10-03`.
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

## Historical Volunteer core workflow complete — SYNTHETIC / LOCAL DEMO ONLY

- Approved implementation boundary: **SYNTHETIC / LOCAL DEMO ONLY**. This does not approve real personal-information collection or public production deployment.
- Approved notice purpose: “The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.” The public form must show this notice before submission and require acknowledgement: “I understand that the information I provide will be used for CES volunteer registration and activity coordination.” The acknowledgement gates submission only; consent evidence is not stored. No schema change for consent storage is approved.
- Contact numbers may be used only for communication related to the selected CES activity and necessary activity coordination. Intended viewers are CES Staff / CES Coordinator.
- At original MVP acceptance, all four fields (`full_name`, `course_year`, `contact_number`, `activity`) were required and nonblank after trimming. Trim surrounding whitespace, preserve meaningful internal text, enforce schema limits without truncation (100, 100, 30, and 150 characters respectively), and preserve contact numbers as strings including leading zeros. No phone regex, minimum length, course/activity list, capitalization, or phone normalization was approved in that historical phase. R2 later replaced free-text Activity entry with managed selection.
- At original Volunteer acceptance, `/volunteers` lacked authentication; that historical MVP exclusion did not provide a security boundary. R1 now restricts it to authenticated active staff. Real-data operation still awaits privacy/retention, deployment, and operational approval.
- Retention policy pending CES/school policy confirmation. No delete feature is approved. QuickChart poster integration status and acceptance are recorded below.
- At original Volunteer acceptance, public `/volunteer`, server validation, parameterized persistence, and read-only `/volunteers` were implemented in five approved Volunteer source files. Dashboard source was not changed in that historical phase; R2 later added managed selection and linking.
- Runtime acceptance completed with classification **PASS WITH NOTES**. The built-in integrated browser was unavailable; actual working-tree application acceptance used temporary headless Firefox. This was a tooling note, not an application defect.
- Browser acceptance passed at 375px for the public form and at 1280px / 375px for staff submissions. Practical keyboard checks passed; this was not a full WCAG audit. No relevant runtime or console errors were observed.
- Historical acceptance created exactly one controlled synthetic row, whose evidence remains documented: Full Name `Synthetic Volunteer Acceptance`, Course / Year `BSIT 3 - DEMO`, Contact Number `00000000000`, Activity `CES Volunteer Demo Activity`, ID `1`, `created_at` `2026-10-03 13:15:52`. No duplicate was found during that acceptance. UI-5 measured zero Volunteer rows; no further Volunteer acceptance submission is required.
- Counts changed Goods `1 → 1`, Cash `1 → 1`, Volunteers `0 → 1`; Cash total remained `125.25`. Dashboard showed Volunteer Submissions `1`. Invalid attempts created no rows.
- Validation trims surrounding whitespace while preserving internal whitespace, uses Unicode-aware limits of 100 / 100 / 30 / 150, and preserves leading zeroes in contact numbers. Acknowledgement is required to submit but is not stored as consent evidence.
- Dashboard, Inventory, Goods form, and Cash form regressions passed; neither donation form was submitted. The 141 focused checks, TypeScript, lint, webpack production build, and `git diff --check` passed.
- Core workflow implementation is **COMPLETE**. Runtime acceptance is **PASS WITH NOTES**. Feature checkpoint `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`) and documentation sync `9eccd9ea887d04b80388dcfbc394861d389662a9` (`docs: sync Volunteer completion status`) are committed and pushed to `origin/main`; documentation synchronization is **COMPLETE**. Historical acceptance created one controlled synthetic row: Volunteers changed `0 → 1`, and Dashboard Volunteer Submissions correctly became `1`. No duplicate was found during that acceptance; UI-5 measured zero Volunteer rows; no further Volunteer acceptance submission is required. The 141 focused checks, TypeScript, lint, webpack production build, and diff check passed. Browser note: the built-in connector was unavailable; working-tree acceptance completed successfully with temporary headless Firefox.
- Real personal-data collection and public production deployment are **NOT approved**. `/volunteers` is now protected under R1, a later expansion beyond the original MVP. The acknowledgement is not stored as consent evidence. Retention policy remains pending CES/school policy confirmation; no delete workflow was added.

## IT305 QuickChart QR API integration — PASS WITH NOTES — SYNTHETIC / LOCAL DEMO ONLY

- The selected provider is QuickChart static QR Code API at `https://quickchart.io/qr`, supporting the existing Volunteer Signup poster workflow as an academic/course integration decision, not a new CES stakeholder requirement.
- Implementation is complete in the server-only QR helper and `/volunteers/poster`; `/volunteers` links to the poster without prefetching. Configuration uses server-only `VOLUNTEER_SIGNUP_URL`. The validated QR uses a static PNG, fixed rendering settings, bounded request/response handling, strict PNG decode validation, and 24-hour success-only `unstable_cache` reuse. No database or schema changes were made.
- Acceptance: 126 temporary focused assertions passed; TypeScript, lint, webpack production build, and diff checks passed. One sandbox build attempt failed in the TypeScript subprocess; the successful webpack build used the established outside-sandbox path.
- A controlled live QuickChart request returned a validated PNG. The rendered QR was decoded locally with `jsQR` to exactly `http://localhost:3012/volunteer`; no online decoder was used. The visible fallback URL matched. Desktop, 375px, print-media retention/hiding, safe failure states, and route regressions passed. Physical printing was not tested.
- `/volunteer`, existing synthetic `/volunteers` row, Dashboard count `1`, Inventory, Goods form, and Cash form rendered successfully without submissions. Database values stayed Goods `1`, Cash `1`, Volunteers `1`, Cash total `125.25`; zero writes occurred.
- A physical phone scan was not performed because no second device or confirmed phone-reachable URL was available. Future demonstration should configure a phone-reachable `VOLUNTEER_SIGNUP_URL`.
- During one mistaken repository build, Next.js loaded `.env.local` internally. The file contents were not inspected, printed, modified, copied, or included in evidence. Successful build and live acceptance subsequently used a secret-free temporary copy/process environment. This is an environment note, not a security incident.
- Feature checkpoint `07c8141792aea8b83ca5b20ed1b19f11507274c6` (`feat: integrate QuickChart Volunteer QR poster`) is committed and pushed to `origin/main`; implementation is complete. Documentation synchronization is recorded in this follow-up commit.

## Final integrated system testing and project closeout — PASS WITH NOTES

- MVP implementation and the final integrated system test are **COMPLETE**. No blocking functional defect was found. Project readiness is for academic/classroom demonstration and handoff under **SYNTHETIC / LOCAL DEMO ONLY**, not production.
- Final system testing baseline: `aebfd1bda9b337a63dc33b22980a05c8f56dd83d`; `HEAD` matched `origin/main` and the working tree was clean before testing.
- TypeScript, lint, webpack production build, read-only database connectivity/count check, healthy `ces-mysql`, and Git diff checks passed. The sandbox blocked DB/Docker access and the build TypeScript subprocess; checks passed on the established elevated path.
- Dashboard, Goods/Cash invalid-only form regressions, Inventory, public Volunteer Signup invalid-only regression, Volunteer Submissions, and QuickChart poster graceful-failure path passed across the six routes. Staff navigation and direct public signup access passed. Desktop and approximately 375px layouts had no horizontal overflow; practical keyboard checks passed (not a WCAG audit). No relevant browser console/runtime errors were observed.
- Goods remained `1 → 1`, Cash `1 → 1`, Volunteers `1 → 1`, and Cash total `125.25 → 125.25`. Zero database writes and no valid form submissions occurred. No new live QuickChart request was made.
- Notes: no phone-reachable second-device scan or physical print; one Goods row means multi-row expiry ordering could not be compared; rapid route navigation canceled speculative RSC/prefetch requests without other application request failures. The public Volunteer warning clearly states the synthetic/local and no-real-data boundary, using wording different from the poster's uppercase label at that historical acceptance; UI-3/UI-5 subsequently verified the exact uppercase demo label on the public page.
- The QuickChart static QR academic integration is complete and runtime accepted **PASS WITH NOTES**. Exact local QR decoding passed in its earlier technical acceptance. `docs/business-workflows.md` now records the implemented poster flow.

## Blockers and stakeholder decisions

- IT305 teacher guidance calls for meaningful external API integration. This academic/course requirement is separate from CES stakeholder functional requirements and should support existing CES functionality rather than add unrelated scope. The QuickChart Volunteer Signup poster integration is implemented and runtime accepted as recorded above.
- Any additional unresolved stakeholder questions should be recorded in [requirements](docs/requirements.md), not inferred from schema or placeholder pages.

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — OpenStreetMap venue

- The closed MVP history above remains unchanged. The optional `/volunteer` venue map is a separate academic/demo enhancement, accepted **PASS WITH NOTES**. Feature commit `104f187dd653d76b9175f4673b0208c23eb05a83` (`feat: add OpenStreetMap volunteer venue map`) is pushed to `origin/main`; documentation is synchronized in the follow-up commit.
- OpenStreetMap was selected for one configured public CES/demo venue. The accepted venue is **Assumption College of Davao**, marker `7.08819, 125.62420`. A Google Maps implementation was abandoned before commit because its Cloud/billing setup was unsuitable for this classroom enhancement; no Google Maps source entered Git history. The current iframe needs no API key or billing account.
- At the original OSM acceptance, the map was driven only by configured venue name and coordinates and was independent of Volunteer Activity; it sent no Volunteer PII to map URLs. No database, schema, Volunteer persistence, package, or QuickChart change was made. The browser loads OpenStreetMap as a third-party service and shows attribution.
- Operator-confirmed live Firefox evidence: the configured venue heading and text, tiles, campus-area marker, larger-map link, attribution, and Volunteer form appeared together. Prior responsive evidence passed at 1280px and 375px without horizontal overflow; map height is 320px. Codex verified source and local rendered HTML, not a new browser visual inspection.
- Implementation acceptance recorded 367 focused helper/component assertions and 140 technical OSM browser assertions. This finalization passed TypeScript, lint, isolated elevated webpack build, and diff checks. All six routes returned HTTP 200; the poster was checked with QR generation disabled. Database read-only before/after remained Goods `1 → 1`, Cash `1 → 1`, Volunteers `1 → 1`, Cash total `125.25 → 125.25`; **zero writes**.
- The enhancement does not make the application production-ready. `/volunteers` is now protected by R1; real personal-data deployment is unapproved, authentication was excluded from the original MVP, retention is unresolved, acknowledgement is not durable consent evidence, and no delete workflow exists.

## CES Portal v2 R1 foundation completion

R1 is complete and accepted **PASS WITH NOTES** on actual MySQL 8.4.11. Backup/restore rehearsal, additive migration/rerun, initial Admin bootstrap, sessions/route/action protection, throttle smoke, audit safety, and the single authenticated Cash transaction passed. The earlier isolated MySQL 8.0.46 synthetic acceptance supports deeper concurrency/rollback evidence; target smoke does not imply every isolated case was repeated. Full evidence is in [R1 testing](docs/testing.md#ces-portal-v2-r1--authentication-authorization-and-audit-foundation).

## CES Portal v2 R2 completion and remaining work

R2 Activity Management is COMPLETE, classified **PASS WITH NOTES — R2 TARGET MYSQL 8.4 ACCEPTANCE COMPLETE**, at source checkpoint `7a0ea4e859b35a0e3b404f2ccecabe93435fcc8e` (`feat: add activity management and volunteer linking`). Isolated MySQL 8.0.46 implementation checks and actual MySQL 8.4.11 target acceptance are recorded separately in [testing](docs/testing.md#ces-portal-v2-r2--activity-management). Target backup/restore, Migration 002/rerun, lifecycle/audit, linked signup, preserved name snapshot, Activity-aware OSM, and protected route/UI checks passed. Anonymous protected-route smoke normalized the post-login destination to `/dashboard`; this is a nonblocking UX note, not an authorization defect.

Pending roadmap: R3 Donation Records; R4 Goods Distribution/stock-out and exact-decimal inventory hardening; R5 CSV exports and audit hardening; R6 operational wording transition and integrated acceptance. R3 has not started. Before operational handoff, full Staff account lifecycle (create, deactivate/reactivate, password reset, role changes, last-Admin protection), source/network-aware throttling, session/throttle cleanup, Volunteer privacy/retention, broader public-abuse controls, deployment hardening, formal backup/restore operating procedures, audit retention/review, and a currency decision before operational Cash reporting/export remain pending. Existing-Admin bootstrap prompting before refusal remains a nonblocking UX note.

## Next action

Review the R2 documentation diff, then authorize its separate documentation checkpoint. R3 has not started. Original MVP and UI-1 through UI-5 remain complete under **SYNTHETIC / LOCAL DEMO ONLY**. Physical printer output and a second-device QR scan remain optional evidence; real personal-data collection and public production deployment remain unapproved.
