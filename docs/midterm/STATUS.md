# Midterm Status

**PHASE 3B — MYSQL 8.4.11 DEMO ACCEPTANCE COMPLETE**

This is the single authoritative midterm tracker. Phase 1 and Phase 2 are
independently reviewed and approved at `9f0e6dd777dbcec1221febed00f5daff8710186c`
and `11a9277a6d30202de31f6241f4b192bcdcaf6cce`. The Phase 3B authorization
confirms independent committed-source review **PASS** for Phase 3A checkpoint
`f9f0a3760799846ef5e78b948e4882ae9a80da09`
(`feat: add midterm notices management UI`); this task did not repeat that
independent review. The unchanged source now passes engineering acceptance on
the dedicated actual local MySQL **8.4.11** database `ces_portal_midterm_demo`,
using separate scoped operator/runtime accounts and human-created synthetic
ADMIN/STAFF credentials. Schema/migrations, real browser ADMIN Notice CRUD,
STAFF read/management denial, auth/audit behavior, QuickChart rendering and
accepted-target integrity pass. This tracker records the acceptance checkpoint.
No final grading evidence, AI evidence or PDF was created;
remaining team/evidence inputs and midterm submission work remain pending.

## Baseline and boundaries

Planning inspection date: **2026-10-11, Asia/Manila**. This is the actual planning
date, not a historical development, evidence, signature, or commit date.

| Item | Verified state / boundary |
| --- | --- |
| Original worktree | `/home/whis/Projects/ces-portal`, branch `main`; approved unstaged R3 Donation Records work is frozen. |
| Original and midterm committed baseline | `66595665c32c0cb1e3803afa5a47d0d2a10a1bce` — `docs: sync R2 activity management status`. |
| Midterm worktree | `/home/whis/Projects/ces-portal-midterm`; created only after confirming path and local branch were absent. |
| Midterm branch | `midterm-integration-checkpoint`; initial planning checkpoint `be863193ed2efad5dfcde04a10441d917ba19b7f` descends directly from the R2 baseline; team-input checkpoint follows it. |
| Initial midterm state | Clean checkout of committed R2; no R3 changes copied. |
| Current midterm Git state | Phase 3B began clean on `midterm-integration-checkpoint`, HEAD = tracking ref = actual GitHub branch = `f9f0a3760799846ef5e78b948e4882ae9a80da09`. Application source remains byte-identical; this STATUS update records the acceptance checkpoint. |
| Databases / Docker | Historical Phases 1–3A used private socket-only MySQL 8.0.46 test servers under `/tmp`. Phase 3B uses the existing running `ces-mysql` MySQL 8.4.11 service, loopback `127.0.0.1:3307`, with separate retained `ces_portal_midterm_demo`. No container restart/recreation, volume change or destructive cleanup; accepted `ces_portal` is read-only and unchanged. |
| Unrelated directory | `.aws remains unrelated, untouched, and excluded.` |

The baseline `PROJECT_STATUS.md` and requirements say R3 has not started because
they describe committed R2. The user's current task establishes that approved
R3 code exists **unstaged in the original worktree**. Preserve both facts;
do not rewrite baseline documentation or infer that R3 belongs to this branch.

## LOCKED planning decisions

The planning decisions below remain LOCKED. The 2026-10-11 Phase 1 task
explicitly authorized foundation implementation and isolated tests, followed by
its separately authorized checkpoint and independent approval. Phase 2 was
separately checkpointed and independently approved. The 2026-10-14 implementation task authorized Phase 3A UI/routes/navigation,
the guarded STAFF fixture command and isolated browser acceptance. The separate
checkpoint task authorized final local review/correction, fresh checks,
explicit-path staging and the Phase 3A commit/normal push. The subsequent
Phase 3B authorization approved dedicated demo provisioning and engineering
acceptance using that independently approved source. Phase 3B is complete;
Phase 4 grading evidence remains pending separate review/authorization.
Record any approved design revision here first.

1. Use **CES Staff Notices**, internal informational messages, as the legitimate
   hard-delete CRUD domain. Do not add rubric-driven delete to business records.
2. Active ADMIN and STAFF read `/notices`; only ADMIN manages `/admin/notices`.
   STAFF direct navigation redirects to `/notices?access=admin-required` and
   shows a fixed access-denied banner. This is a safe redirect, not HTTP 403.
3. Independently authorize every page, data helper, and mutation on the server;
   recheck ADMIN and lock session/user within write transactions.
4. Use the definite schema and parameterized CRUD in the implementation spec,
   including a revision counter; omit `updated_by` because audit supplies it.
5. Audit Notice CREATE/UPDATE/DELETE transactionally with minimal metadata (create
   NULL; update revision changes/field names; delete previous revision only),
   retain deleted entity IDs without message text, and
   narrowly extend migration-chain validation without weakening existing checks.
6. Use isolated synthetic `ces_portal_midterm_demo`, with scoped credentials,
   plus separately disposable integration-test schemas. Never mutate accepted
   `ces_portal` to rehearse or satisfy the rubric.
7. Keep existing server-side QuickChart QR integration as primary Week 2 proof;
   recommend Postman for external request/status/PNG evidence and pair it with
   actual application QR use. No new external API or internal REST layer.
8. Prepare Mermaid architecture source, later export a readable vector figure
   for the formatted PDF. No final figure/PDF/evidence is created now.
9. Disclose **Generated AI use** for generated substantive planning/code and
   record meaningful episodes truthfully; do not relabel it as merely Assisted.

## TEAM INPUTS REQUIRED

Team name and complete roster are supplied. Remaining inputs do not block this
documentation checkpoint and must be resolved before evidence production is
finalized.

- Team name: **The Visionaries**
- Complete member roster: five members, listed below
- Submission deadline/date/time: **PENDING — instructor has not posted the exact date/time yet**
- Google Classroom representative: **PENDING — Wariza or Layupan**
- Existing Git account mapping: **VERIFIED — one account, `wariza818189`; five-member contribution coverage remains unresolved**
- YouTube/channel availability for each walkthrough: **PENDING**
- Collaboration-proof method: **PENDING**; accepted options are a real-time
  timestamped group photo, meeting minutes, or both. No method chosen.

## Team roster — The Visionaries

- Wariza Robert James
- Layupan Jonel
- Amores Jayson
- Largo Willmer
- Casipong Rommel Jave

## Future genuine contribution categories — unassigned

1. Notice validation
2. Notice UI
3. ADMIN/STAFF authorization behavior
4. Tests
5. Accessibility/documentation plus code walkthrough

No category is assigned to a named member. Assignments follow verified Git-author
mapping and confirmed member availability.

## Git/team evidence risk

The team-input planning inspection recorded **37 commits** with two author-name variants:
**Robert James Wariza** and **Robert James O. Wariza**. Both resolve to the same
GitHub account, **`wariza818189`**, using the mapping verified and supplied for
this task. This is **one Git-visible contributor account**, not two team members;
it does not establish five-member coverage. Git attribution is not proof that a
human personally authored every line. No current evidence establishes commit
coverage for the other four roster members; they still require genuine
contribution mapping/work. Future categories remain unassigned. Do not reassign
old commits or fabricate/backdate contributions, authorship, or dates.

## Migration reservation — LOCKED

`003_midterm_notices.sql` is implemented only for this dedicated midterm branch.
Historical 001/002 bytes/checksums remain unchanged; approved R3 adds none.
If main gains another Migration 003 before intentional midterm merge, renumber
the Notice migration and regenerate its checksum/references before it is ever
applied to a shared main-development database. Never rewrite an already-applied
migration identity; an applied-chain collision requires reviewed reconciliation.

## Decisions pending / review inputs

| Input | Why needed | Effect |
| --- | --- | --- |
| Git-author/member mapping, availability, assignments, representative | The Visionaries and complete five-member roster are recorded; one-account mapping is verified, five-member coverage is unresolved, and representative is PENDING — Wariza or Layupan. | Resolve before contribution assignments and final submission; no technical decision changes. |
| Exact instructor AI Declaration form and allowed attachment delivery | Confirm exact use-level terminology, signature method, whether excerpts prove hashes, and evidence access rules. | Match form faithfully; conservative Generated recommendation stands. |
| Instructor acceptance of paired Postman + application proof | Postman demonstrates the same provider call, not the application's server network trace. | If necessary, capture server egress as planned; do not change integration. |
| Weeks 5–7 rubric / dates and submission deadline | Only Weeks 1–4 and proof/format instructions are supplied. | Proposed next steps remain proposals; do not invent dates or requirements. |
| Recording/YouTube access and phone-reachable demo URL if needed | Local demo machine, scoped DB operator/runtime and hidden synthetic credentials are established. Recording/upload and optional second-device arrangements remain pending. | Evidence dependencies, not schema/RBAC decisions. |
| Future main-product approval and migration reconciliation | Notices is approved academic/demo scope, not stakeholder-confirmed CES scope. | Branch-only 003 reserved; reconcile any main collision before shared main-development application. |

## Requirement coverage and evidence readiness

| Requirement | Planned coverage | Current readiness |
| --- | --- | --- |
| Week 1: Integration Plan v2 | Architecture source, technologies, flows, boundaries, dependencies, integration table. | Plan complete; final rendered diagram/document pending. |
| Week 2: working API response used in app | Existing QuickChart POST → validated PNG → Volunteer QR Poster. | Phase 3B actual poster renders the validated 600×600 QuickChart PNG for the configured local URL; final API/app grading capture pending. |
| Week 3: DB, full CRUD, parameterization | Notice create/read/update/delete with bound SQL and audit transaction. | Phase 1/2 approved; real MySQL 8.4.11 UI create/read/update/physical delete and minimal audits pass; grading evidence pending. |
| Week 4: login, two roles, restriction | Existing R1 plus ADMIN-only Notice management and shared read page. | Real demo ADMIN/STAFF fixtures, Argon2id format, login/logout, shared read and direct management denial pass; final grading evidence pending. |
| Proof 1: Git history | Real baseline plus future authorized checkpoints and member contributions. | Historical team-input inspection: 37 branch-history commits, two author-name variants, one account `wariza818189`; five-member coverage unresolved. |
| Proof 2: unedited 3–5 minute recording | Timed demo covering API/app, CRUD, login, denial, and source evidence. | Script planned; no recording created. |
| Proof 3: API request/status/response | Postman request and binary PNG preview, paired with app usage. | Capture pending; do not treat history as new capture. |
| Proof 4: DB create/update/delete before/after | Same Notice ID through absent → created → updated → absent; retained audit. | Phase 3B verified same Notice ID 1 through revision 1 → 2 → physically absent, with retained audits; final before/after captures pending. |
| Proof 5: hashed password and regular-user denial | Synthetic Argon2id evidence, ADMIN access, STAFF login/direct denial. | Argon2id format-only checks and real STAFF denial pass for synthetic accounts; no full hashes/passwords displayed and no final grading screenshot captured. |
| Proof 6: each member walkthrough/change/YouTube | Roster-linked actual file/function, genuine change, real commit, video link. | Five names recorded; one Git account mapped, four-member coverage unresolved; assignments, contribution evidence, recordings, YouTube readiness/uploads pending. |
| Collaboration proof | Real-time timestamped group photo, meeting minutes, or both; method not chosen. | Method and authentic proof PENDING; never fabricated. |
| AI disclosure / log / proof / signatures | Episode log, actual commit mapping, `/ai-evidence` proof, individual declarations. | Plan only; form, evidence exports, truthful reconstruction, signatures pending. |
| PDF / Classroom | Required structure/format/filename and individual completion checklist. | Assembly and submission pending. |

## Known gaps and verification boundary

- All six proof categories remain to be assembled for this checkpoint. Existing
  source and historical acceptance are context, not fabricated current proof.
- Two recorded author-name variants map to one GitHub account. Five-member
  coverage remains an evidence gap; the other four members need genuine
  contribution mapping/work, never reassigned or backdated authorship.
- R2 has no ordinary STAFF-account provisioning workflow. Phase 3A provides a
  guarded demo-only operator fixture, now executed by the human operator in
  Phase 3B. It is not a product account-management feature.
- The runner now recognizes exactly R1 → R2 → MIDTERM, with fixed checksums and
  statement definitions; unknown states/successors fail closed. This remains
  approved branch-only foundation work, not shared-target migration approval.
- Internet/provider availability, a phone-reachable URL/second device if used,
  readable recordings, and instructor access to YouTube/evidence need rehearsal.
- Production deployment, real personal data, retention policy, and main-product
  acceptance remain outside this academic plan.

## Phase 1 implementation and verification — 2026-10-11

- Source scope: `database/schema.sql`, `database/migrations/003_midterm_notices.sql`,
  `scripts/lib/migrations.mjs`, `lib/auth/audit.mjs`, `tests/midterm/audit.test.mjs`,
  `tests/midterm/database.test.mjs`, `package.json` (test script only), and this tracker.
- Notices: seven locked columns; required creator FK with RESTRICT/RESTRICT;
  nonblank title/message and positive revision CHECKs; only primary key,
  `idx_notices_created_by`, and `(updated_at, id)` feed index. No UI/CRUD/RBAC,
  navigation, fixture, new dependency, lockfile, R3, or secret/configuration change.
- Migration 003: exactly Notice CREATE plus atomic `chk_audit_event` replacement;
  no seed/backfill/business-row writes. SHA-256:
  `5030fb936e85f381a191288ef7a26805ec3a154056e339d161015df04c291967`.
- Historical SHA-256 unchanged:
  001 `7c018fd31fabb353545a9dd04cea3bfd4327e88ddab488764fecb2acdfa85d3d`;
  002 `e2704724d5bae39b2027bf50889001a198fa1d0051023f03b600f89e277b8a81`.
- Live information_schema parity covers Notice columns/types/nullability/defaults,
  primary/index details, FK/rules, all Notice CHECKs, and final audit CHECK.
  R2 upgrade, unchanged APPLIED rerun, both DDL-before-checkpoint recoveries,
  interrupted fresh-schema adoption, checkpointed missing table, Notice drift,
  unknown/missing/extra/reordered/unenforced audit events, checksum drift,
  duplicate numbers, and unknown/destructive successors are tested.
- Notice audits require actor/entity IDs and NOTICE/SUCCESS/NULL reason. CREATE
  metadata NULL; UPDATE only canonical title/message field names and consecutive
  UINT revisions; DELETE only previous revision. Notice text is excluded.
- Final `test:midterm`: **20 passed, zero failed/skipped** on a fresh isolated
  MySQL `8.0.46-0ubuntu0.24.04.4` schema. Earlier test iterations exposed and
  corrected a test-only FK alteration limitation and fresh-adoption recovery gap.
- R1: **18 passed, zero failed/skipped**, unchanged suite on its own fresh guarded
  R1 schema with the full branch migration chain. R2: **32 passed, zero
  failed/skipped** on its separate guarded R2 compatibility schema.
  Initial unconfigured runs skipped one DB suite each; configured results above
  supersede those skips.
- TypeScript (`--noEmit --incremental false`), ESLint, and `git diff --check` pass.
  Webpack production build passed in an elevated secret-free `/tmp` copy with
  synthetic build-only environment values after the sandbox TypeScript
  subprocess failed. No real environment files were read/copied.
- R2 database regression uses the historical committed R2 fresh schema and
  001/002 chain in a secret-free compatibility copy, with the new shared runner
  and audit code and byte-identical R1/R2 tests. This preserves the suite's
  two-migration assertions without changing test semantics. The full latest
  three-migration schema is covered separately by the midterm and R1 suites.
- Original R3 branch/baseline, unstaged scope, and content fingerprints remain
  unchanged. `.aws remains unrelated, untouched, and excluded.`
- Isolated schemas/data are retained; no DROP DATABASE/TABLE, TRUNCATE, or
  business-row cleanup was used. The test-only private server is stopped after
  verification. No accepted/demo database or Docker state was touched.
- Classification: **PASS — MIDTERM PHASE 1 SCHEMA/MIGRATION/AUDIT FOUNDATION COMPLETE**.
  The separately authorized Phase 1 source checkpoint was subsequently reviewed
  and approved at `9f0e6dd777dbcec1221febed00f5daff8710186c`. This is not full
  midterm acceptance.

## Phase 2 implementation and verification — 2026-10-11

- Baseline verified before editing: correct dedicated branch, HEAD = remote =
  `9f0e6dd777dbcec1221febed00f5daff8710186c`, clean worktree/index, diff check clean.
  Phase 1 is independently reviewed/approved; all six frozen foundation files,
  `package.json`, and `package-lock.json` remain byte-identical to that checkpoint.
- New source: `lib/validation/notices.ts`, `lib/auth/notice-authorization.ts`,
  `lib/notices.ts`, `lib/actions/notices.ts`. New tests:
  `tests/midterm/validation.test.mjs`, `tests/midterm/crud.test.mjs`.
  This tracker is updated. The sole shared adapter change in
  `tests/r1/framework.mjs` adds optional request-scoped refresh path observation
  and an optional callback, retaining existing `refreshFails` behavior. It proves
  independent path attempts and committed visibility; no transpiler changes.
- Validation: reusable Zod schemas, exactly-one-string FormData scalars via
  `getAll`, outer trimming, Unicode code-point limits (title 120/message 2000),
  title control rejection, CRLF/CR normalization to LF, message LF/tab preservation
  and other control rejection. Over-limit text is rejected without truncation;
  SQL/HTML-shaped content stays literal plain text. Submitted actor/role/timestamp
  extras cannot control persistence.
- IDs stay canonical positive UINT64 decimal strings through bound queries and
  audit calls. Revisions accept canonical UINT32 decimal strings before exact
  Number conversion. Real update/audit/delete of `9007199254740993` is verified.
  Overflow edits fail; max-revision no-op and matching physical delete succeed.
- Every mutation checks ADMIN before validation, opens a transaction and rechecks
  ADMIN via existing `requireStaff(connection)` and locked session/user reads.
  Actor IDs derive from the in-transaction session. The exported locked-row helper
  independently verifies ADMIN on its connection before parameterized FOR UPDATE.
- Feed reads independently require active STAFF/ADMIN, use fixed
  `updated_at DESC, id DESC` ordering, project six necessary fields only, and
  validate every returned row without coercing malformed stored text. IDs are
  SQL-cast strings; projected DATETIME text is UTC, not Manila-local. No protected
  row caching, public reads, or view audits.
- Create obtains CAST(LAST_INSERT_ID() AS CHAR) on the same connection. Edit
  compares locked revision and increments exactly once only on actual changes;
  no-op preserves all timestamps/revision and writes no audit. Delete physically
  removes the matching row. Mutations verify exactly one affected row and commit
  their minimal success audit together; deleted entity evidence survives.
- Isolated tests call actual exported Server Actions/helpers through the existing
  R1 framework adapter. They cover STAFF, anonymous, expired, inactive, invalid
  session and malformed/unknown-role denial with no mutation/success audit.
  Malformed roles are injected at the session projection because the DB role
  CHECK prevents storing them; the database constraint is not weakened.
- Real FOR UPDATE locks block competing edits and both edit/delete orderings:
  one mutation succeeds and the stale/missing contender fails. CREATE/UPDATE/
  DELETE audit insertion failures roll back their actual SQL changes. Separate
  injected driver, affected-row and generated-ID failures fail safely.
- For each mutation, role downgrade, account deactivation and session expiry
  after the initial ADMIN check are persisted before connection acquisition;
  the transaction's real FOR SHARE recheck denies it with zero Notice/audit writes.
- Revalidation independently attempts `/notices` and `/admin/notices` after
  confirmed changed commits. Either refresh failure returns confirmed success
  with reload/do-not-resubmit guidance. No-op does not refresh. Injected commit
  failures both before and after actual commit report uncertainty and require a
  current read before retry, with no refresh or blind automatic replay.
- `npm run test:midterm`: **44 passed, zero failed/skipped**, comprising unchanged
  Phase 1 checks plus six validation cases and seventeen CRUD/RBAC/transaction
  cases with their parent suite. Private MySQL version:
  **8.0.46-0ubuntu0.24.04.4**. Latest schema plus all three migrations are verified.
- `npm run test:r1`: **18 passed, zero failed/skipped**, on its fresh guarded
  synthetic schema with the latest migration chain. The initial run failed
  because the fresh private root account has no password while R1's config
  requires one; a schema-scoped synthetic test account corrected the setup.
- `npm run test:r2`: **32 passed, zero failed/skipped**, using the documented
  secret-free R2 compatibility copy: historical committed R2 fresh schema and
  001/002 chain, current shared runner/audit code and unchanged R1/R2 test files.
  Its two-migration assertions remain intact; the full latest three-migration
  schema is independently covered by midterm/R1.
- `npx tsc --noEmit --incremental false`, `npm run lint`, and `git diff --check`
  pass. The first typecheck caught BigInt literal syntax incompatible with the
  project's ES2017 target; BigInt(string) preserves exact validation and passed.
  `npm run build -- --webpack` passed in the secret-free elevated `/tmp` copy
  with synthetic unreachable build-only DB settings after the sandbox could not
  parse TypeScript --showConfig subprocess output. No real env files read/copied.
- Only fresh `ces_midterm_test_*`, `ces_r1_test_*`, and `ces_r2_test_*` schemas
  on the task-created socket-only private server were used. Test schemas/data
  are retained and the private server was stopped. No accepted/demo DB, Docker,
  existing server, volume, DROP DATABASE/TABLE, TRUNCATE, or destructive cleanup.
  Synthetic Notice DELETE is feature verification, not retained-target cleanup.
- No Notice UI/components/routes/navigation, demo database, demo STAFF fixture,
  or grading evidence. No browser CRUD, visible denial, responsive Notice UI,
  Week 3/4 acceptance, or full midterm completion is claimed. Team/evidence
  pending items remain unchanged.
- Diff reviewed across all eight intended paths. No Phase 1 changes, dependencies,
  lockfile, env/secrets, original R3 files, or `.aws` changes. Original R3 branch,
  baseline, unfinished scope, and all 14 SHA-256 file fingerprints match the
  before-work snapshot. `.aws remains unrelated, untouched, and excluded.`
- Classification: **PASS — MIDTERM PHASE 2 SERVER CRUD/RBAC COMPLETE**.
  At implementation handoff, all Phase 2 work was left unstaged with no commit
  or push, pending the separately authorized checkpoint gate below.

## Phase 2 final local review and source checkpoint — 2026-10-11

- Checkpoint gate began on `midterm-integration-checkpoint` at approved Phase 1
  `9f0e6dd777dbcec1221febed00f5daff8710186c`, matching the actual GitHub branch;
  exactly the eight reviewed Phase 2 paths were unstaged and the index was empty.
- Full local source review found no production defect requiring correction.
  Validation, independent server authorization, UTC DTO projection/row validation,
  bound SQL, real row locking/revisions, no-op behavior, physical delete, minimal
  transactional audits, revocation, rollback and safe result semantics match the
  locked specification. Protected session/user locks precede Notice row locks.
- Validation tests gained explicit one-code-point title/message lower-bound
  assertions and positive-sign revision rejection; no new file or dependency.
  All tests execute actual production helpers/actions. Fault injection wraps real
  connections; concurrent lock tests hold separate real InnoDB transactions.
  Unknown-role projections are injected because persisted role CHECKs remain intact.
- Shared adapter review: the only Phase 2 change is optional request-scoped
  `refreshPaths` observation and `onRefresh` callback. Existing `refreshFails`,
  session/cookie behavior, exception propagation, TypeScript imports/transforms,
  and real database behavior remain intact; no auth/CRUD bypass. Unchanged R1/R2
  suites verify backward compatibility.
- Fresh final reruns: `npm run test:midterm` **44 passed**; `npm run test:r1`
  **18 passed**; `npm run test:r2` **32 passed**. All: **zero failed/skipped**.
  Midterm and R1 cover the full latest migration chain. R2 uses the documented
  secret-free compatibility copy with historical R2 schema/001–002 and current
  shared runner/audit code, preserving unchanged two-migration assertions.
- Private MySQL **8.0.46-0ubuntu0.24.04.4**, freshly initialized socket-only under
  `/tmp`; separate fresh guarded midterm/R1/R2 schemas. The disposable regression
  account uses named test privileges on two exact schema names only. Candidate
  source contains no DB-account creation/grant logic or wildcard grants. No
  accepted/demo database, real credentials/data, existing server or Docker state.
  Schemas/data retained and the task-created test server stopped; no destructive
  cleanup. Notice DELETE remains controlled synthetic feature verification.
- Final TypeScript (`npx tsc --noEmit --incremental false`), ESLint (`npm run lint`),
  and diff whitespace checks pass. Webpack production build passes in a fresh
  secret-free elevated `/tmp` source copy with synthetic unreachable DB settings;
  sandbox attempt failed parsing TypeScript --showConfig subprocess output. No
  secret files read/copied and no new Notice route is claimed.
- Exactly eight checkpoint paths: four Notice source files, two midterm tests,
  existing R1 adapter and this tracker. Entire unstaged/cached diff reviewed;
  explicit-path staging only. Six frozen Phase 1 files, package and lockfile
  remain byte-identical to the approved foundation. Repository-local noreply
  email verified; no global identity modification. One Phase 2 commit is
  authorized: `feat: add midterm notices CRUD and authorization`; normal push
  targets only `midterm-integration-checkpoint`, never main or force-push. Actual
  commit SHA/push/remote equality and clean-state results are in the execution report.
- Original R3 main/baseline, all 14 unfinished paths and SHA-256 fingerprints
  remain frozen. `.aws remains unrelated, untouched, and excluded.`
- Independent committed-source review is pending. Phase 3 UI/routes/navigation,
  demo STAFF fixture/database, browser acceptance and grading evidence were not
  started. No MySQL 8.4.11 acceptance or full midterm completion is claimed;
  deadline, representative, YouTube and collaboration-proof inputs remain pending.

## Phase 3A implementation and isolated acceptance — 2026-10-14

- Baseline: dedicated branch `midterm-integration-checkpoint`, HEAD = remote =
  `11a9277a6d30202de31f6241f4b192bcdcaf6cce`, clean worktree/index and diff check.
  The user's Phase 3A authorization confirms independent Phase 2 approval.
- Nine intended paths only: shared and ADMIN Notice pages, Notice form/delete
  components, shared navigation, guarded STAFF fixture command, two midterm test
  files, and this tracker. No package/dependency/lockfile change or extra route.
- Each page independently calls `requireUser` before protected loading. ADMIN
  management redirects non-ADMIN immediately, before search params, list loading,
  selection or controls. Shared feed uses protected `listNotices`, escaped text,
  `whitespace-pre-wrap`/wrapping, explicitly UTC timestamps, separate empty/load
  failure states, synthetic/local-only warning, and ADMIN-only management link.
- STAFF denial uses only the exact scalar `access=admin-required` and fixed
  message. Arrays/repeated/arbitrary values produce no denial or reflected text.
  The query is informational; all server authorization remains intact. Existing
  `safeReturnPath` still defaults new Notice destinations to `/dashboard`.
- Small `useActionState` create/edit form: required labels/hints, associated
  field errors, disabled pending fields/buttons, textarea, no browser maxLength,
  create success reset, invalid/conflict draft retention, returned expected
  revision after save, successful no-op and Close editor. Hidden IDs/revisions
  remain untrusted and validated by unchanged server actions.
- Native delete confirmation shows escaped title/current revision. No
  confirmation/cancellation writes nothing; pending says `Deleting...` with
  disabled controls. Stale delete refuses newer content. Confirmed deletion
  feedback persists in a small listener above the revalidated list, implemented
  in the existing delete-control file; no additional component file or library.
- Navigation has Dashboard, Donations, Inventory, Activities, Notices, Volunteers.
  `grid-cols-2 lg:grid-cols-1` is retained. Notice active state covers only
  `/notices`, `/admin/notices` and children of those exact roots.
- `node scripts/seed-midterm-demo.mjs` is a demo-only interactive operator command.
  It checks live `SELECT DATABASE()` for exactly `ces_portal_midterm_demo`, exact
  APPLIED Migration 003 with two completed statements, and all required tables.
  It validates name/canonical username/password, uses hidden password and
  confirmation prompts, Argon2id, fixed active STAFF role, bound SQL, duplicate
  refusal, exactly one inserted row, safe string identity, commit/rollback and
  bounded safe CLI errors. It performs no migrations/schema/privilege management,
  overwrite, provisioning audit invention or browser endpoint. Tested only with
  fake connections; **not executed on the real demo database**.
- `npm run test:midterm`: **58 passed, zero failed/skipped**, including seven
  fixture and seven UI tests plus all accepted Phase 1/2 checks. New page tests
  exercise actual page functions/session guards/list projections with fake reads;
  browser authorization is separately verified, not inferred from markup.
  Initial full runs exposed premature test module DB import and a reused nonempty
  test target; delayed imports and a fresh retained schema corrected test setup.
- `npm run test:r1`: **18 passed, zero failed/skipped**, latest migration chain.
  Historical full R2 compatibility: **32 passed, zero failed/skipped**, unchanged
  tests, committed R2 schema/001–002 and five-link navigation with current shared
  runner/audit. Current R2 policy/database: **27 passed, zero failed/skipped**,
  current application source/six-link navigation with the same two-migration
  compatibility fixture. Separate current policy run: **8 passed**. Historical
  `tests/r2/ui.test.mjs` remains byte-identical: its exact five-link assertion is
  intentionally superseded by current midterm six-link UI tests, not claimed to
  pass against current navigation. All latest-chain semantics remain covered by
  midterm/R1; current Activities/Volunteer browser smoke also passes.
- TypeScript `npx tsc --noEmit --incremental false`, ESLint `npm run lint`, webpack
  `npm run build -- --webpack`, and `git diff --check` pass. Runtime/checks use
  explicit secret-free `/tmp` source copies and installed lockfile dependencies,
  with synthetic configuration only; source byte parity was verified.
- Actual in-app Chromium browser against fresh
  `ces_midterm_test_browser_1791980327169` synthetic target, private socket-only MySQL
  `8.0.46-0ubuntu0.24.04.4`. The actual target uses a numeric unique suffix; no
  accepted/demo target or original environment files. The initial dev process
  ended during QA; acceptance resumed on the successful current production build.
  Standalone Playwright browser binaries were unavailable, so in-app Chromium
  completed acceptance; no repository dependency was added.
- Anonymous `/notices` and `/admin/notices`: actual HTTP **307** login redirects,
  no protected content/controls; existing safe `/dashboard` return behavior.
  Actual real-login ADMIN create/read/no-op/changed edit/delete succeeds. Notice
  ID `1` advances revision `1 → 2 → 3`, then is physically absent. A second
  synthetic Notice ID `2` verifies deletion pending, then is physically absent.
  Read-only DB checks verify newer revision survives stale attempts and retained
  Notice audits after deletion. No business feature submissions were made.
- Real-login STAFF reads the created Notice without Manage Notices, directly
  requests management and receives `/notices?access=admin-required` with the exact
  denial text and no Create/Save/Delete controls. Dev HTTP log records **307**,
  not 403. Exact/repeated/arbitrary signal behavior also passes in production.
- Browser validation: native required title/message; server whitespace-title
  field error with correct associations and retained multiline draft; visible
  disabled `Saving...`; successful create clears fields and refreshes lists;
  no-op remains successful at revision 1; changed edit retains saved values and
  returned revision; two-tab stale edit retains draft/revision and stale delete
  cannot remove newer revision 3. Confirmed DELETE removes rows and refreshes
  shared feed. A read-only transaction lock on synthetic ID 2 makes disabled
  `Deleting...`/confirmation observable; lock released with rollback, no write.
- Visual/DOM inspections at **390 × 844** and **1440 × 900**: no horizontal
  overflow, six usable links/two-column mobile grid, long literal Notice wrapping,
  fitting create/edit/delete controls and readable list. Keyboard: skip link
  reaches main, nav/Manage Notices work, create/edit field order, buttons,
  confirmation, deletion and Close editor work with visible focus. No formal
  WCAG certification is claimed. Browser console: no new Notice errors,
  hydration/key/nesting/failed-action exceptions observed. Temporary runtime
  connection-refused navigation and one synthetic login retry were QA setup
  interruptions, not counted as Notice defects.
- Current Dashboard, Activities, public Volunteer Registration, Volunteer
  Submissions, Volunteer poster, Donations and Inventory render successfully
  without business writes. Poster gracefully handles absent synthetic URL;
  QuickChart source/integration remains byte-identical. No new provider call or
  Week 2 grading evidence is claimed.
- All Phase 1/2 protected contracts, auth policy, historical R2 UI test and
  migrations, dependency/lockfile, original R3 and QuickChart files remain
  byte-identical. Original `main`/HEAD, empty index, same 14 unfinished paths and
  all SHA-256 fingerprints match the before-work snapshot. No `.aws` inspection.
- Private schemas/data are retained; the task-created private MySQL server and
  Next.js runtime are stopped after QA. No Docker action, shared DB access, real demo creation, DROP/TRUNCATE/reset,
  environment/credential file in Git, final grading capture, AI evidence or PDF.
  Contributions remain unassigned; no invented authorship or backdating.
- Classification: **PASS — MIDTERM PHASE 3A UI/ROUTES AND ISOLATED BROWSER
  ACCEPTANCE COMPLETE**. Ready for independent unstaged-source review, not full
  midterm or MySQL 8.4.11 demo acceptance. No staging, commit or push.

## Phase 3A final local review and source checkpoint — 2026-10-14

- Gate began at approved Phase 2 HEAD = remote =
  `11a9277a6d30202de31f6241f4b192bcdcaf6cce` on the dedicated branch, with an
  empty index and exactly the nine intended unstaged Phase 3A paths.
- Reviewed every page/component/navigation/fixture/test in full. Independent
  page authentication, ADMIN redirect-before-load/construction, exact scalar
  denial/edit queries, protected list projection, escaped multiline text and UTC
  labels satisfy the locked design. Form key/defaultValue state retains failed
  drafts, resets successful creates, and advances revisions only on success.
  Native delete confirmation is an affordance, never server authorization.
- One narrow Phase 3A correction: persistent delete feedback now accepts only
  the two fixed server success messages, including confirmed-save refresh advice.
  Other event payloads are ignored, never reflected. This retains the listener
  above the removed row and preserves row-local stale errors. No route, data,
  auth, action or dependency contract changes. A new executable helper regression
  test rejects arrays, objects, oversized text, markup and appended arbitrary text.
- Fresh final automated runs: `npm run test:midterm` **59 passed** (seven fixture,
  eight UI checks plus accepted Phase 1/2 coverage); `npm run test:r1` **18 passed**;
  current R2 policy/database compatibility **27 passed**; historical full R2
  compatibility **32 passed**. All: **zero failed/skipped**. R2 schema/001–002
  fixture compatibility preserves its historical migration-count semantics.
  Historical five-link UI assertion is unchanged and intentionally superseded by
  current six-link coverage; no rendering manipulation to satisfy both counts.
- TypeScript `npx tsc --noEmit --incremental false`, ESLint `npm run lint`, webpack
  `npm run build -- --webpack`, and unstaged/cached whitespace checks pass.
  Checks run in secret-free byte-matched `/tmp` copies using installed lockfile
  dependencies and synthetic configuration. New private socket-only MySQL
  **8.0.46-0ubuntu0.24.04.4**; separate fresh guarded schemas. Previous QA server,
  deleted Notice IDs and six retained minimal audits are not cleaned or reused.
- Reused completed implementation browser QA for unchanged routes/RBAC/forms,
  responsive/keyboard/console and existing features. Reran affected deletion
  behavior on the corrected production build at loopback port 3218 against a
  fresh `ces_midterm_test_browser_checkpoint_<unique>` schema: actual ADMIN login,
  UI create/confirmed physical delete, persistent `Notice deleted.` after row
  removal, empty shared feed and no browser console warnings/errors all pass.
  That correction-check Notice is absent and its two minimal audits are retained.
  This is engineering QA, not final grading evidence.
- Exactly nine checkpoint paths: two Notice pages, two client component files,
  navigation, demo-only fixture, two test files and this tracker. All protected
  Phase 1/2/auth policy/schema/migration/package/lockfile files and historical R2
  UI test remain byte-identical to Phase 2. No env/credentials, R3, `.aws`, grading
  evidence, AI evidence, PDF, new dependency or additional source file.
- Repository-local noreply email and actual effective author identity verified;
  global identity unchanged. Explicit-path staging and complete cached review
  only. One separate authorized commit: `feat: add midterm notices management UI`.
  Normal push targets only `midterm-integration-checkpoint`, with no amendment,
  main update or force-push. Actual SHA/push/remote/clean-state results are in the
  execution report; no self-referential documentation-only follow-up commit.
- Original R3 `main`/HEAD, empty index, all 14 unfinished source paths and SHA-256
  fingerprints remain frozen. `.aws remains unrelated, untouched, and excluded.`
- No real demo fixture invocation or `ces_portal_midterm_demo` creation/mutation.
  MySQL 8.4.11 Phase 3B and independent committed Phase 3A review remain pending.
  Grading/AI evidence, PDF, real contribution coverage and other team inputs are
  still pending. This checkpoint does not claim final midterm acceptance.

## Phase 3B dedicated MySQL 8.4.11 demo acceptance — 2026-10-14

- Baseline: `midterm-integration-checkpoint`, local HEAD/tracking ref/actual
  GitHub branch all `f9f0a3760799846ef5e78b948e4882ae9a80da09`; clean tracked
  worktree/index and diff check before work. Independent Phase 3A review PASS is
  confirmed by the user's approval, not a new review performed in this task.
- The initial opaque accepted runtime configuration had insufficient provisioning
  privileges. Stopped without widening `ces_app`; the separately authorized
  Docker root path resolved provisioning. `ces-mysql` was already running MySQL
  8.4.11, with only `127.0.0.1:3307 → 3306` published. Root authoritatively
  confirmed the exact demo DB and both account names absent before creation.
  Container defaults files were mode 0600 and removed after use; root credentials
  were never printed/copied/changed. No sudo, container recreation or volume action.
- Created only `ces_portal_midterm_demo`, matching metadata-validated `utf8mb4` /
  `utf8mb4_0900_ai_ci`. Separate independent random passwords protect
  `ces_midterm_operator` and `ces_midterm_runtime`, both restricted to exact host
  `172.18.0.1`, verified as the Docker gateway and host-side connection source.
  No `%` host grants. Database grant patterns escape underscores for exact scope.
- Operator grants are ALL PRIVILEGES only on the exact demo DB, with no global
  administrative privilege, GRANT OPTION or accepted-target access. Runtime has
  demo-wide SELECT; Notice INSERT/UPDATE/DELETE; auth-rate-limit INSERT/UPDATE;
  session INSERT/DELETE; audit INSERT; Activity INSERT/UPDATE; Goods/Cash/Volunteer
  INSERT. Exact live grants match the approved source needs. No user mutations,
  audit UPDATE/DELETE, business DELETE, DDL or global administrative privileges.
  Runtime connection, reads and rollback-only locking reads passed; real app
  login/logout/Notice transactions subsequently exercised required mutations.
- `.env.midterm-operator.local` and `.env.midterm-demo.local` contain only new
  scoped credentials/safe demo settings; both ignored/untracked and mode 0600.
  No ambiguous `.env.local` exists in this worktree. Accepted credentials were
  used opaquely only for accepted-target read-only comparisons, never demo setup
  after the new operator path or application runtime. No env contents displayed.
- Fresh committed `database/schema.sql` installed unchanged through the scoped
  operator after live exact-database and zero-table guards. Runtime table grants
  followed table creation. Committed migration command with the new operator env
  passed twice unchanged. 001/002/003 have exact approved checksums, status
  APPLIED and completed statement counts 10/5/2. Historical migration bytes stay
  unchanged; 003 checksum remains
  `5030fb936e85f381a191288ef7a26805ec3a154056e339d161015df04c291967`.
- Live information_schema verified all ten InnoDB tables, seven Notice columns,
  exact three indexes, creator FK RESTRICT/RESTRICT, three enforced Notice CHECKs,
  the final twelve-event audit CHECK and intact Volunteer–Activity FK. Temporary
  read-only helpers corrected their index-order, Date-comparison and valid
  Argon2 parameter-order assumptions; no database/application correction.
- Human operator ran the committed hidden-password scripts: active ADMIN ID 1,
  `midterm.admin`, `Synthetic Midterm Admin`; active STAFF ID 2, `midterm.staff`,
  intentionally named `Midterm Staff`. Exactly two users; both Argon2id formats
  verified through booleans, no full hash output/plaintext password field. One
  ADMIN_BOOTSTRAPPED audit references USER 1 with NULL actor/reason/metadata;
  no invented STAFF provisioning event or business fixture.
- Production webpack build passed with explicit demo runtime settings. Direct
  Node `--env-file` invocation first failed because Next propagated that flag
  into worker NODE_OPTIONS, where Node rejects it. A `/tmp` parent launcher loads
  the env opaquely and starts Next with inherited environment and no such flag.
  No source/config fix. The actual production runtime binds only 127.0.0.1:3220
  using the runtime account. The managed shell later ended with exit 143; the
  same build resumed as a detached loopback process, preserving DB/session state.
- Anonymous `/notices` and `/admin/notices`: actual HTTP 307 to
  `/login?next=%2Fdashboard`, with login UI and no protected management controls.
  One read-only probe's automatic approval review timed out; its permitted retry
  succeeded. This was not an application failure or a 403 response.
- Actual human ADMIN login through the form, shared feed/Manage Notices and
  management access passed. Exactly one engineering Notice ID 1 was created
  through UI at revision 1, read, updated to revision 2 and physically deleted.
  Creator ID 1/creation time remained unchanged; valid UTC update time advanced.
  CREATE metadata NULL; UPDATE only changed_fields [title,message] and revisions
  1/2; DELETE only previous_revision 2. Exactly one of each success audit remains,
  with no Notice text. Pending controls, refreshed feed and persistent delete
  feedback were observed. No other business submissions.
- Real ADMIN logout invalidated its session. Real human STAFF login showed
  Midterm Staff; `/notices` read the current empty feed without Manage Notices.
  Direct `/admin/notices` navigation redirected to `/notices?access=admin-required`
  with exact `Access denied. Only ADMIN can manage CES Staff Notices.` and no
  Create/Save/Delete management controls. Current STAFF logout returned to login.
  A forged authenticated STAFF Server Action was not repeated in this browser
  run; unchanged direct-write guards are covered by the approved Phase 2 tests.
  No STAFF Notice write/success audit occurred. This optional check is not claimed
  as live HTTP mutation evidence.
- Final retained audits: ADMIN_BOOTSTRAPPED 1, AUTH_LOGIN_SUCCESS 3, AUTH_LOGOUT 2,
  NOTICE_CREATED/UPDATED/DELETED 1 each (9 total), all successful. The additional
  human STAFF login left one earlier STAFF session; retained without cleanup.
  No failure audit was manufactured. Auth metadata is NULL; actor/entity IDs and
  minimal Notice metadata verified. No username/password/raw token/Notice text
  in auth metadata. Demo core business tables and Notices remain empty.
- Browser smoke passed Dashboard, Goods/Cash workspace, Inventory, Activities,
  Volunteer Submissions, public Volunteer Registration, poster and Notices.
  The empty public form shows no ACTIVE Activities; map settings are absent.
  Existing server-side QuickChart POST succeeded and poster rendered a complete
  validated 600×600 PNG for `http://127.0.0.1:3220/volunteer`. No provider/source
  change, standalone Postman proof, phone scan or final grading API capture.
- Short browser checks at 390×844 and 1440×900 verified six navigation links,
  Notice feed, ADMIN controls and STAFF denial fit without horizontal overflow.
  Viewport restored. No new uncaught/hydration/Server Action/DB permission errors
  in the recovered browser/runtime. Shell-lifetime and viewport-transition
  interruptions were resolved without application changes. Full Phase 3A visual/
  keyboard coverage was not repeated; no formal WCAG certification.
- Exact accepted-target before/after snapshots match: Goods 1, Cash 1, Activities
  1, Volunteers 2, cash total 0.01; all four deterministic business digests,
  migration records and nine schema fingerprints unchanged. No accepted writes
  or grants; no accepted personal row content printed.
- Original R3 main/HEAD `66595665c32c0cb1e3803afa5a47d0d2a10a1bce`, empty index,
  same 14 unfinished files and SHA-256 fingerprints match the established baseline.
  `.aws remains unrelated, untouched, and excluded.` No DROP/TRUNCATE/reset/audit
  deletion, final grading captures/recording, AI evidence, declarations,
  contribution fabrication or PDF. Browser views were engineering QA only.
  Only this STATUS file changed; all application source remains at the approved
  checkpoint. Local env files stay ignored;
  temporary helpers/reports live only under `/tmp`.
- Classification: **PASS — MIDTERM PHASE 3B MYSQL 8.4.11 DEMO ACCEPTANCE COMPLETE**.
  This is engineering acceptance, not completion of the midterm submission.

## Next exact action

Begin the grading-evidence phase from the stable Phase 3B demo environment.
Plan and capture evidence in rubric order without altering accepted source:
Git history/team contributions, unedited 3–5 minute recording, QuickChart API
proof, Notice DB CRUD before/after proof, password-hash/RBAC proof, individual
member walkthroughs, collaboration proof, AI declarations/log/evidence, and the
final technical PDF. Classroom submission steps remain pending.
