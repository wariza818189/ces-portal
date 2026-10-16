# CES Portal — Azure QA and presentation readiness

Date: **2026-10-16, Asia/Manila**. Baseline: clean `deploy/azure-ces-demo`,
HEAD `a6ad127353334d3005441d7d28a0bd571c7d1f0d`.
Live target: [Azure CES Portal](https://ces-portal-demo-2026-gwhzg4c0hadshmd9.eastasia-01.azurewebsites.net/).
Repository changes below are **uncommitted and undeployed**.

**Final polish update:** the new local production acceptance in section 7
supersedes the earlier deferred delete regression and v1 dataset proposal.
Sections 1–5 preserve the initial live QA evidence and its then-current wording;
they do not describe the newly polished interface as already deployed. This
follow-up made **zero Azure database or configuration changes**. Local candidate
acceptance passes; final Azure/phone/print acceptance remains pending.

The current approved academic branch includes Staff Notices, as documented in
`docs/midterm/STATUS.md`; the main-product R2 tracker does not supersede that
branch-specific scope. Testing remains synthetic-only. No real secret file or
credential was inspected. The operator signed in manually; no invalid login
attempt was made. No Azure resource/configuration, credential, grant, firewall,
OIDC, migration, accepted branch or Docker state was changed.

## 1. Live functional results

PASS means the stated observation succeeded, not that every edge case was tested.
BLOCKED identifies missing access/configuration or an explicitly deferred check.

| Scenario | Expected | Actual / evidence | Result |
| --- | --- | --- | --- |
| Public `/` and login | Unauthenticated root reaches staff sign-in; usable fields | Root redirected to `/login?next=%2Fdashboard`; Username, Password and Sign In rendered. | PASS |
| ADMIN login | Valid existing account opens staff workspace | Operator's manual sign-in opened Dashboard; Notices management was available. No credentials captured. | PASS |
| Dashboard database read | Current stored counts and Cash sum | Initially Goods `0`, Cash `0.00`, Volunteers `0`. After controlled saves: Goods `1`, Cash `0.37`, Volunteers `1`, expired `1`; [desktop evidence](presentation-qa/dashboard-1366.png). A second anonymous Volunteer was saved later. | PASS |
| Goods required validation | Empty required selection prevents save | Native “Please select an item in the list” appeared on blank submission. | PASS |
| Goods create / past-expiry warning | Exact quantity saved, earlier expiry accepted with warning | Other `0.37 packs`, received `2026-10-16`, expiry `2026-10-15`; success explicitly warned expiry preceded received date; reset form. | PASS |
| Cash invalid amount | Zero rejected without save | Server returned “Amount must be greater than 0” with highlighted field. Pending “Saving...” disabled controls. | PASS |
| Cash create | Marked exact-decimal record saved once | `0.37`, received Oct 16, `[QA-AZ-20261016]` fictional collection note; success/reset, Dashboard total updated. | PASS |
| Inventory / category filter | Stored quantity/unit/category and derived expiry visible; no-match state works | Other `0.37 packs` rendered Expired; Rice filter showed “No matching category”; All restored the row. Other three category options rendered. | PASS |
| Activity create / edit | Draft creation and revision-protected edit | Created `[QA-AZ-20261016] Starling Community Packing`, then renamed with `— Updated`; date Oct 20, fictional venue. Table reflected the edit. | PASS |
| Activity transitions | Supported transitions update registration and retain records | Activity 1: Draft → Active → Closed → Active; public signup disappeared while Closed and returned after reopen. Activity 2: Draft → Archived; terminal/read-only UI. Closed → Archived and concurrency/stale-revision cases were not repeated live. | PASS, sampled |
| Volunteer acknowledgement | Required acknowledgement gates submission | Populated fictional form without acknowledgement was blocked by native “Please check this box.” | PASS |
| Public Volunteer save / staff view | Selected ACTIVE Activity stored with canonical name snapshot | Synthetic Mira Starling submission succeeded; exact name, fictional course, `00000000000` and Activity name appeared in staff view. | PASS |
| Truly anonymous Volunteer save | No staff session needed | After logout, public form still loaded and Synthetic Niko Starling saved successfully; [success capture](presentation-qa/anonymous-signup-success.png). | PASS |
| Notices create / read / edit | ADMIN controls save and reflect revisions | Notice ID `1`, marked synthetic packing briefing: create revision 1, read feed/management, edit message to revision 2. | PASS |
| Notices delete | Only this run's notice removed after confirmation | Operator confirmed ID 1/revision 2 deletion. “Notice deleted” plus empty list appeared. A stale edit-error banner also remained: [evidence](presentation-qa/notice-deleted.png). | PASS deletion; FAIL feedback UX |
| ADMIN logout | Session invalidated, staff pages require login | Sign Out returned to login; all subsequent direct protected-route probes reached sign-in with no staff navigation. | PASS |
| Anonymous protection | No staff content on protected routes | `/dashboard`, `/donations/new`, `/inventory`, `/activities`, `/notices`, `/admin/notices`, `/volunteers`, `/volunteers/poster`: eight login redirects, no staff navigation; [probe results](presentation-qa/protected-routes.json). | PASS |
| Navigation | Six working primary links and selected-route feedback | Dashboard, Donations, Inventory, Activities, Notices, Volunteers all opened; mobile links remained visible. Poster subaction opened its page. | PASS |
| STAFF → ADMIN restriction | Ordinary STAFF cannot manage Notices | No Azure STAFF browser session was available. Existing database-free role/page checks passed; prior acceptance is historical only. No account provisioned. | BLOCKED live |
| Volunteer QR poster | Configured signup URL produces QR/link for academic API demonstration | Poster says signup link is not configured; no QR or direct URL. [Evidence](presentation-qa/poster-unconfigured.png). | FAIL presentation configuration |
| Map rendering | Venue text/map when configured, graceful fallback otherwise | Azure has no configured default venue/map. Selecting QA Activity showed its fictional venue, with “Map unavailable” because no coordinates were provided. Form remained usable. | PASS fallback; BLOCKED map demonstration |

Anonymous redirects normalize the requested destination to `/dashboard`. This
is the already documented R2 UX limitation, not a staff-data exposure. Inspection
was through rendered browser UI, not direct Azure SQL or server-log access.

### Controlled live records retained

Only new synthetic records were written. No pre-existing business record was
changed/deleted. Initial business pages were empty. These writes are functional
QA, **not execution of the presentation seed**.

| Record | Retained state / identity |
| --- | --- |
| Goods | One Other `0.37 packs` row, received Oct 16 / expiry Oct 15. Schema has no name/notes marker; identify by the exact tuple and this run, not by broad category/date deletion. UI does not expose its ID. |
| Cash | One `0.37` row with `[QA-AZ-20261016]` notes and fictional Starling Outreach Circle. UI does not expose its ID. |
| Activity 1 | `[QA-AZ-20261016] Starling Community Packing — Updated`, Oct 20, Fictional Starling Community Hall; retained ACTIVE. |
| Activity 2 | `[QA-AZ-20261016] Archived rehearsal`, Oct 16; retained ARCHIVED. |
| Volunteers | Synthetic Mira Starling QA-AZ-20261016 (fictional Year 2), Synthetic Niko Starling QA-AZ-20261016 (fictional Year 3); both contact `00000000000`, both Activity 1. Niko success was observed anonymously; its staff-row rendering was not rechecked after logout. |
| Notice 1 | Created, edited and deleted only after explicit operator confirmation. No retained Notice. Application design audits these operations; Azure audit rows were not directly inspected. |

Authentication/session/audit writes are additional support writes. No claim of
zero database writes is made. Existing business workflows do not offer general
Goods/Cash/Volunteer deletion; no cleanup or business deletion feature was added.

## 2. UI and responsive findings

All eight main pages were navigated at each exact requested viewport. DOM
measurements showed no document overflow or visible main-content element beyond
the viewport. Tables became cards on narrow screens; six navigation links used
the existing two-column layout. [All 24 measurements](presentation-qa/responsive.json).

| Viewport | Pages inspected | Result |
| --- | --- | --- |
| 360 × 800 | Dashboard, Donations, Inventory, Activities, Notices, Manage Notices, Volunteers, public Volunteer | PASS; [Activity/mobile evidence](presentation-qa/activities-360.png). |
| 390 × 844 | Same eight pages | PASS; [public Volunteer evidence](presentation-qa/volunteer-390.png). |
| 1366 × 768 | Same eight pages | PASS; desktop summary cards, sidebar, tables and form composition fit. |

Screenshots of Dashboard, Activities and Volunteer pages were visually inspected.
The baseline already has coherent navy CES branding, spacing, type, cards,
buttons and status badges. No redesign, animation, new navigation model or
unrelated feature was warranted. Native required feedback, action pending
protection, success/reset, category no-match and no-active-activity empty states
were observed. Console warning/error reads returned empty arrays on the live
staff/public tabs. No browser-visible network failure was observed; the tool
does not expose a complete HTTP network waterfall, so no full network audit is
claimed. QR/map absence was diagnosed from rendered fallback plus source config
requirements, not a captured upstream request failure.

## 3. Fixes implemented locally

- `components/notices/delete-notice-control.tsx`: deletion feedback now carries
  the deleted ID and fixed success message. When that ID is the open editor,
  navigation replaces the stale edit URL with `/admin/notices`, preserving the
  page-level success state. Server authorization, revision checks and delete
  transaction are unchanged; router destination is a fixed internal path.
- `app/(public)/login/page.tsx`: added explicit CES Portal branding above the
  existing Community Extension Services identity and staff sign-in heading.
- Volunteer, Activities and poster introductory text now describes the actual
  workflow without repetitive “local demonstration” phrasing. The poster's
  unconfigured-link message gives a support next step.
- Synthetic-only warnings, exact privacy/use notice, acknowledgement, staff
  access disclosure and prohibition on real-data/production use remain intact.
  These are material disclosures, not disposable development placeholders.
- Added preview-first operator tool, guarded fixture/rollback library, tests,
  [data runbook](PRESENTATION_DATA.md) and synthetic-only evidence. No dependency,
  schema, migration, authentication, currency or business-rule change.

### Local verification

| Check | Observed result |
| --- | --- |
| `npm run lint` | PASS. |
| `npx tsc --noEmit --incremental false` | PASS. |
| Production `npm run build -- --webpack` | PASS, all 14 page-generation steps; secret-free `/tmp` source copy with synthetic configuration and Node 24.21.0. Sandbox TypeScript subprocess initially failed; permitted elevated build passed. |
| `npm run test:midterm` with explicit synthetic DB-free environment and no test DB selectors | 25 passed, 2 integration suites skipped; no failures. Includes Notice UI, validation, role boundaries, fixture and audit checks. |
| `node --import ./tests/r1/register.mjs --test --test-isolation=none tests/db/tls.test.mjs` | 8 passed; no database/network connection. Initial invocation without required loader failed and was corrected to the documented command. |
| `CES_PRESENTATION_TEST_SOCKET=<new-private-socket> node --test --test-isolation=none tests/presentation-data.test.mjs` | 9 passed, zero skipped. Actual isolated MySQL 8.0.46 insert/rerun/rollback, drift/referral/target/journal refusal, and rollback on journal failure. Existing baseline row/users/audits preserved. |
| `npm run test:r2` in synthetic DB-free mode | 12 passed, 1 skipped DB suite, 1 **pre-existing failure**: historical UI test asserts five links, while HEAD already has six for approved midterm Notices. Verified both files at baseline HEAD; neither navigation nor this historical test changed. |
| Local production browser | Login/logout, revised Activities/public Volunteer text, retained disclosures, and new CES Portal sign-in at all three sizes passed; no overflow or console errors. [Local login](presentation-qa/local-login-390.png). |
| Notice delete-editor browser regression | **NOT RUN at operator request.** A disposable local notice ID 3 was created/opened; operator chose to leave deletion untested. It remains untouched. The source fix compiles and existing static checks pass, but actual post-delete navigation/success persistence still requires acceptance. |
| `git diff --check` | PASS. Final index remains unstaged; HEAD and deployment branch unchanged. |

The private MySQL uses only a new `/tmp` socket with networking disabled. No
accepted/demo DB or Docker instance was used. The compiled app was bound only
to loopback port 3230; private fixtures are retained after processes stop.

## 4. Remaining limitations and blockers

1. **QR demonstration blocked:** an operator must review/set
   `VOLUNTEER_SIGNUP_URL` to
   `https://ces-portal-demo-2026-gwhzg4c0hadshmd9.eastasia-01.azurewebsites.net/volunteer`
   through the approved Azure app-setting workflow. No secret is needed for this
   value. No setting was changed here. Then verify actual QuickChart PNG, exact
   QR payload, phone scan and print layout; no provider success is claimed now.
2. **Delete-editor fix awaits browser acceptance** and remains undeployed.
3. **Live role boundary coverage is incomplete:** no Azure STAFF login/session;
   an operator can sign in as existing STAFF and verify shared Notices read plus
   `/admin/notices` redirect/denial before the presentation. No repeated invalid
   logins, account creation or password changes are needed.
4. Fresh/expiring-soon multi-row Inventory ordering and fuller Activity-state
   presentation require the separately reviewed synthetic dataset. Only Expired
   was demonstrated live; the dataset covers the missing cases.
5. Map fallback works; an approved configured public venue/coordinates or
   appropriate Activity venue is needed only if demonstrating the map. No new
   venue/provider was selected and no Azure map settings were changed.
6. No exhaustive accessibility/security/concurrency audit, full HTTP trace,
   physical print, second-device test, Azure audit-row inspection or target
   MySQL 8.4 seed rehearsal was performed. Existing production/governance,
   consent, retention and account lifecycle limitations remain unchanged.
7. The historical R2 test assertion needs a separately reviewed branch-aware
   test expectation if a completely green full R2 command is required. Its
   existing five-link assumption does not justify removing Notices.

## 5. Synthetic-data preparation and rollback

[PRESENTATION_DATA.md](PRESENTATION_DATA.md) contains the complete 15-record plan,
approval-gated commands, target/actor guards, idempotency journal, transaction
and rollback strategy. [Exact preview](presentation-qa/presentation-plan.json).
Preview defaults to zero connections. **Neither apply nor rollback ran on Azure.**

Rollback compares exact journal IDs and full snapshots, refuses later linked
Volunteers or edited records, retains all audit history and removes only its own
fixture rows after separate approval. It cannot remove the earlier live QA
records. Crash/unknown-commit states fail closed and require operator
reconciliation; a new journal is never a safe retry shortcut.

## 6. Presentation readiness assessment

**Core live workflows: PASS WITH NOTES. Polished local candidate: READY FOR
REVIEW. Azure presentation acceptance: PENDING DEPLOYMENT/CONFIGURATION.**
Login, database-backed summaries, Goods/Cash save/validation, Inventory,
Activity management, synthetic signup, Notice CRUD, logout and anonymous route
protection worked. The final local acceptance now verifies the delete-editor
fix, polished disclosures, real provider QR and local STAFF denial (section 7).
The Azure QR setting, live STAFF check, separate dataset approval/execution,
phone scanning and physical print remain before the full walkthrough.

Review this uncommitted diff first. If approved, perform one controlled source
deployment and the separately approved configuration/data actions, then repeat
the focused outstanding checks. No commit, push, redeploy or automatic Azure
seed was performed. This is an academic synthetic presentation assessment, not
approval for real personal-data collection or institutional production use.

## 7. Final presentation polish — local production acceptance

Follow-up baseline: same branch/HEAD, with **all original uncommitted QA changes
preserved**. A secret-free copy of the modified source was built under `/tmp`
with synthetic settings. A freshly initialized socket-only MySQL 8.0.46 and
new disposable schemas/role fixtures were used; no prior private server or
accepted database was reset. No real credential file was read and no existing
credential/grant, Azure resource, configuration, migration, Docker service or
accepted branch was changed. Any accounts/grants created were confined to the
new disposable test server. Earlier local notice ID 3 from the initial task
remains untouched in its separate stopped private instance.

### Interface and Notice deletion

- The staff shell now displays one compact neutral **Academic prototype**
  disclosure. Repeated large yellow banners were removed from Activities,
  both Notice pages and Volunteer Submissions. It still requires fictional
  records and states that real-data collection/institutional production use
  are unapproved. Staff access restrictions remain enforced server-side.
- Public registration and the QR poster retain an obvious concise notice:
  **“Do not submit real personal or contact information.”** Exact existing
  privacy/use acknowledgement and all form/workflow rules are unchanged.
  Volunteer page summaries/captions describe the actual workflow without
  repetitive synthetic/demo labels. CES branding and navigation remain.
- Poster fallback no longer says “Scan” when there is no QR image. The existing
  provider, direct link, validation, timeout/cache and print dimensions remain.
- A **new** disposable Notice ID 3 in the new browser schema was created,
  edited to revision 2, opened at `/admin/notices?edit=3`, then deleted through
  its own confirmed control as authorized for this disposable workflow. The
  prior locally implemented fix returned to `/admin/notices`, retained “Notice
  deleted,” removed the editor/row, and showed **no unrelated edit error**.
  No further source change to that fix was necessary.
  [Deletion result](presentation-qa/final-polish/delete-editor-success.png).
- Read-only private SQL confirmed that Notice 3 is absent; exactly its
  NOTICE_CREATED / NOTICE_UPDATED / NOTICE_DELETED audits remain. Update
  metadata records message and revision 1→2; delete metadata only revision 2.
  Every original v2 fixture ID and complete snapshot still matches its journal.
  [Audit and preservation evidence](presentation-qa/final-polish/delete-audit.json).
- Synthetic STAFF sign-in read shared Notices but direct `/admin/notices`
  redirected to the shared page with the existing access-denied banner and
  no management controls. [Local evidence](presentation-qa/final-polish/staff-denied.png).
  Azure STAFF acceptance is still separate and pending.

### QR and responsive outcomes

The local production process was explicitly supplied the intended **runtime**
`VOLUNTEER_SIGNUP_URL`:
`https://ces-portal-demo-2026-gwhzg4c0hadshmd9.eastasia-01.azurewebsites.net/volunteer`.
Its poster fetched a **real QuickChart response**, displayed a complete
600×600 PNG and rendered the exact direct URL. This is actual provider/image
acceptance in the local process, not proof that Azure's App Setting was fixed.
No phone scan or physical print was performed. The PNG was not independently
decoded; exact request payload/direct link are checked separately.
[Configured poster](presentation-qa/final-polish/volunteers_poster-1366.png),
[actual PNG](presentation-qa/final-polish/volunteer-qr.png).

[QR_ACCEPTANCE.md](QR_ACCEPTANCE.md) records the exact configuration, unchanged
provider contract and short image/direct-link/phone/A4/physical-print procedure.
Print CSS still hides staff chrome (including the shared disclosure) and controls,
keeps the public prototype notice, and uses a 74 mm QR. This is a CSS/source
check, not rendered print or physical-print acceptance.

All **nine** pages (the previous eight plus QR poster) were navigated at
360×800, 390×844 and 1366×768: **27/27 measurements passed**, no document or
visible content overflow. Each main staff/public page has one shared/page
prototype notice; the poster also retains its required printable notice.
Screenshots of Activity cards/table, public form and real-QR poster were visually
inspected; there were no overlapping controls or unreadable/wrapped batch codes.
[Measurements](presentation-qa/final-polish/responsive.json),
[mobile Activities](presentation-qa/final-polish/activities-360.png),
[public form](presentation-qa/final-polish/volunteer-390.png).
The local browser's warning/error logs were empty. No full network waterfall,
accessibility audit or second-device acceptance is claimed.

### Dataset revision and checks

The reviewed revision is **proposed v2**, not approved Azure data. It retains
4 Goods / 2 Cash / 4 Activities / 3 Volunteers / 2 Notices, total Cash `2225.50`,
all expiry states and all four Activity statuses. Clean activity/notice names,
short `(fictional)` person/venue labels and academic-sample notes replace raw
batch codes. Fictional-only and zero contact information remain obvious.
[V2 preview](presentation-qa/presentation-plan-v2.json).

The private journal supplies reliable exact IDs, batch version, date, actor,
plan hash and complete snapshots. Collision checks cover every domain before
insertion; they refuse rather than adopt existing matches. Cross-version
markers/tuples block v2 over v1. A common advisory lock serializes both versions.
Rerun/rollback additionally validates that manifest records actually match the
reviewed version/relationships before full snapshot comparison. Legacy v1
preview bytes are unchanged; v1 journal verification/rollback remains supported,
with no new v1 applications. No journal conversion, previous QA cleanup or Azure
seed was attempted. Details and versioned commands are in
[PRESENTATION_DATA.md](PRESENTATION_DATA.md).

| Final check | Actual result |
| --- | --- |
| `npm run lint` / TypeScript `--noEmit --incremental false` | PASS. |
| `npm run build -- --webpack` | PASS on the approved elevated path in a secret-free temporary copy; all 14 page-generation steps. |
| Focused presentation UI/QR checks with the existing TS loader | **5 passed**: public prohibition, compact staff boundary, invalid config, exact unchanged provider contract/valid PNG and direct-link/failure branches. Harness uses a synthetic PNG, separate from the real provider check above. |
| `npm run test:midterm` in explicit synthetic DB-free mode | **25 passed, 2 database suites skipped**, no failures. One wording assertion was updated to reflect disclosure ownership in the shell; RBAC/revision/audit assertions remain. |
| Private `tests/presentation-data.test.mjs` | **12 passed, zero skipped**, actual MySQL 8.0.46 transactions: v2 apply/rerun/rollback, all-domain collisions, drift/references, journal/target/TLS guards, failure atomicity, original-v1 content compatibility and legacy rerun/rollback/cross-version refusal. |
| Existing TLS suite with documented TS loader | **8 passed**. |
| Browser Notice deletion + read-only audit/manifest check | PASS; only the newly created disposable notice deleted, original fixture rows and audit history retained. |
| Local STAFF restriction / anonymous public notice | PASS. |
| Responsive browser checks | **27/27 passed** at the three requested dimensions. |
| R2 suite | **12 passed, 1 DB suite skipped, 1 existing failure**. See separate note below. |
| Diff/links/final Git inspection | No whitespace errors; intended files unstaged/uncommitted, same branch/HEAD. No push or deployment. |

**Separate pre-existing test issue:** `tests/r2/ui.test.mjs:37` expects five
links, but approved midterm HEAD has six, including Notices. The same isolated
test fails `6 !== 5`; neither the obsolete assertion nor approved navigation
was changed to hide this. The current midterm six-link check passes. This is
not a production UI failure or a reason to remove Notices.

### Exact recommended next deployment action

1. Review this complete uncommitted source/report/v2-preview diff. Authorize
   an explicit-path checkpoint commit and **one normal push of
   `deploy/azure-ces-demo`** when ready. The existing **Build and deploy CES Azure
   demo** workflow triggers on that push and deploys `ces-portal-demo-2026` /
   Production. Do not also trigger a duplicate workflow run. No main or accepted
   academic branch should be updated.
2. In the same approved release window, have the operator review/set only the
   exact `VOLUNTEER_SIGNUP_URL` above through existing Azure App Settings and
   confirm its runtime restart. This is a separately approved configuration
   action, not performed by this task. No credentials or other settings change.
3. After the single deployment completes, repeat focused public/staff disclosure,
   existing ADMIN/STAFF role, responsive and QR image/direct-link checks. Follow
   [QR acceptance](QR_ACCEPTANCE.md) for phone and physical A4 scanning. If an
   Azure write is to be used to recheck deletion, separately authorize **one new
   disposable notice**; never delete an existing notice for acceptance.
4. Review/approve the v2 dataset, actual current database baseline, presentation
   date and exact target/actor/private journal before any operator seed. If the
   presentation is later, regenerate/review dates so expiry states remain useful.
   Data approval/execution is separate from source deployment; preserve the
   earlier QA records and any existing journal. No seed is in CI.

Remaining blockers are the controlled deployment, Azure QR configuration/live
STAFF acceptance, approved dataset execution, and phone/physical-print checks.
The local deletion-regression blocker is resolved. Local MySQL 8.0.46 evidence
does not claim target MySQL 8.4 seed acceptance or production governance approval.
