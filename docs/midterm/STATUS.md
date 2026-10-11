# Midterm Status

**PHASE 2 SOURCE CHECKPOINT — SERVER CRUD/RBAC COMPLETE; INDEPENDENT COMMITTED-SOURCE REVIEW PENDING**

This is the single authoritative midterm tracker. Phase 1 is independently
reviewed and approved at `9f0e6dd777dbcec1221febed00f5daff8710186c`
(`feat: add midterm notices persistence foundation`). Phase 2 Notice server
CRUD, ADMIN mutation authorization, STAFF read authorization, and validation are
implemented, locally source-reviewed, and freshly isolated-verified on MySQL
**8.0.46**. This separately authorized Phase 2 source checkpoint preserves the
server/domain implementation for independent committed-source review.
UI/routes/navigation, demo database, demo STAFF provisioning,
and grading evidence remain pending. No MySQL 8.4.11 target acceptance or full
midterm completion is claimed. Team name and five-member roster are recorded;
remaining team/evidence inputs remain pending.

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
| Current midterm Git state | Phase 2 began clean with HEAD = `origin/midterm-integration-checkpoint` = `9f0e6dd777dbcec1221febed00f5daff8710186c`, the approved Phase 1 checkpoint. The checkpoint-gate task also began at that HEAD/remote with exactly eight intended unstaged Phase 2 paths and an empty index. Its execution report records the new Phase 2 checkpoint SHA, push, remote equality and final clean state. |
| Databases / Docker | Phase 1 and Phase 2 tests each use a new private socket-only MySQL 8.0.46 server under `/tmp` and fresh guarded midterm/R1/R2 synthetic test schemas only. No destructive cleanup, Docker/container/volume actions, accepted `ces_portal` access, or demo database creation. |
| Unrelated directory | `.aws remains unrelated, untouched, and excluded.` |

The baseline `PROJECT_STATUS.md` and requirements say R3 has not started because
they describe committed R2. The user's current task establishes that approved
R3 code exists **unstaged in the original worktree**. Preserve both facts;
do not rewrite baseline documentation or infer that R3 belongs to this branch.

## LOCKED planning decisions

The planning decisions below remain LOCKED. The 2026-10-11 Phase 1 task
explicitly authorized foundation implementation and isolated tests, followed by
its separately authorized checkpoint and independent approval. The current
checkpoint task authorizes final local source review, fresh isolated
reruns, and one Phase 2 commit/push only after all gates pass. Phase 3 remains
unapproved.
UI, demo setup/provisioning, and evidence capture require later authorization.
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
| Independent committed Phase 2 source review | Phase 1 is approved; Phase 2 local source review and fresh isolated verification pass in this separate source checkpoint. | Deep-review committed Phase 2 from GitHub before authorizing Phase 3. |
| Git-author/member mapping, availability, assignments, representative | The Visionaries and complete five-member roster are recorded; one-account mapping is verified, five-member coverage is unresolved, and representative is PENDING — Wariza or Layupan. | Resolve before contribution assignments and final submission; no technical decision changes. |
| Exact instructor AI Declaration form and allowed attachment delivery | Confirm exact use-level terminology, signature method, whether excerpts prove hashes, and evidence access rules. | Match form faithfully; conservative Generated recommendation stands. |
| Instructor acceptance of paired Postman + application proof | Postman demonstrates the same provider call, not the application's server network trace. | If necessary, capture server egress as planned; do not change integration. |
| Weeks 5–7 rubric / dates and submission deadline | Only Weeks 1–4 and proof/format instructions are supplied. | Proposed next steps remain proposals; do not invent dates or requirements. |
| Demo machine, DB operator, hidden local credentials, recording/YouTube access | Needed to run and submit real evidence later. | Operational evidence blockers, not unresolved schema/RBAC decisions. |
| Future main-product approval and migration reconciliation | Notices is approved academic/demo scope, not stakeholder-confirmed CES scope. | Branch-only 003 reserved; reconcile any main collision before shared main-development application. |

## Requirement coverage and evidence readiness

| Requirement | Planned coverage | Current readiness |
| --- | --- | --- |
| Week 1: Integration Plan v2 | Architecture source, technologies, flows, boundaries, dependencies, integration table. | Plan complete; final rendered diagram/document pending. |
| Week 2: working API response used in app | Existing QuickChart POST → validated PNG → Volunteer QR Poster. | Baseline source inspected; historical acceptance documented; fresh checkpoint evidence not captured. |
| Week 3: DB, full CRUD, parameterization | Notice create/read/update/delete with bound SQL and audit transaction. | Phase 1 foundation approved; Phase 2 server CRUD/parameterization isolated-verified; UI/demo DB/evidence pending. |
| Week 4: login, two roles, restriction | Existing R1 plus ADMIN-only Notice management and shared read page. | Login/roles exist at R2; Phase 2 direct mutation/read authorization and revocation checks verified; visible denial/UI and demo STAFF setup pending. |
| Proof 1: Git history | Real baseline plus future authorized checkpoints and member contributions. | Historical team-input inspection: 37 branch-history commits, two author-name variants, one account `wariza818189`; five-member coverage unresolved. |
| Proof 2: unedited 3–5 minute recording | Timed demo covering API/app, CRUD, login, denial, and source evidence. | Script planned; no recording created. |
| Proof 3: API request/status/response | Postman request and binary PNG preview, paired with app usage. | Capture pending; do not treat history as new capture. |
| Proof 4: DB create/update/delete before/after | Same Notice ID through absent → created → updated → absent; retained audit. | Notice schema verified in isolation; CRUD/demo rows/evidence pending. |
| Proof 5: hashed password and regular-user denial | Synthetic Argon2id evidence, ADMIN access, STAFF login/direct denial. | Safe capture plan complete; no account credentials or stored account hashes inspected. |
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
- R2 has no ordinary STAFF-account provisioning workflow. Plan a guarded
  demo-only operator fixture, not a new account-management product feature.
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

## Next exact action

Deep-review the committed Phase 2 source from GitHub. If approved, authorize
Phase 3 Notice UI/routes/navigation, guarded synthetic STAFF fixture, and browser
acceptance planning. Deadline, final representative, YouTube readiness and
collaboration-proof method remain pending. No grading evidence was captured.
