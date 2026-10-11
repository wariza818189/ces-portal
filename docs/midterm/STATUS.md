# Midterm Status

**PHASE 1 SOURCE CHECKPOINT — FOUNDATION COMPLETE; INDEPENDENT REVIEW PENDING**

This is the single authoritative midterm tracker. Phase 1 schema, Migration 003,
exact audit successor recovery, and Notice audit validation are implemented and
isolated-verified on MySQL **8.0.46**. The separately authorized Phase 1 source
checkpoint preserves this foundation for independent GitHub review. Notice CRUD/RBAC/UI, STAFF fixture, demo database, and evidence remain
pending. No MySQL 8.4.11 target acceptance or full midterm completion is claimed.
Team name and five-member roster are recorded; remaining team/evidence inputs
remain pending.

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
| Current midterm Git state | Initial Phase 1 HEAD and remote: `859192bc42ce3c629cdf3d9285f3e82419b21dcd` — `docs: record IT305 midterm team inputs`; initially clean. The separate checkpoint task authorizes exactly the eight Phase 1 paths, one source commit, and a dedicated-branch push; the execution report records the checkpoint SHA and verified remote/clean state. |
| Databases / Docker | Phase 1 tests use a new private socket-only MySQL 8.0.46 server under `/tmp` and fresh guarded midterm/R1/R2 synthetic test schemas only. No destructive cleanup, Docker/container/volume actions, accepted `ces_portal` access, or demo database creation. |
| Unrelated directory | `.aws remains unrelated, untouched, and excluded.` |

The baseline `PROJECT_STATUS.md` and requirements say R3 has not started because
they describe committed R2. The user's current task establishes that approved
R3 code exists **unstaged in the original worktree**. Preserve both facts;
do not rewrite baseline documentation or infer that R3 belongs to this branch.

## LOCKED planning decisions

The planning decisions below remain LOCKED. The 2026-10-11 user task explicitly
authorized Phase 1 foundation implementation and isolated tests only. Later
CRUD/RBAC/UI, demo setup, and evidence capture require their own authorization.
The separate Phase 1 checkpoint task authorizes only the reviewed foundation. Record any approved design revision here first.

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

Current branch history contains **37 commits** with two author-name variants:
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
| Independent committed Phase 1 source review | Foundation implementation and isolated checks completed; a separate task authorizes source review and the Phase 1 checkpoint. | Deep-review the committed source directly from GitHub; do not begin Phase 2 until that review approves the migration/audit foundation. |
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
| Week 3: DB, full CRUD, parameterization | Notice create/read/update/delete with bound SQL and audit transaction. | Phase 1 schema/migration/audit foundation implemented and isolated-verified; CRUD pending; demo DB not created. |
| Week 4: login, two roles, restriction | Existing R1 plus ADMIN-only Notice management and shared read page. | Login/roles exist at R2; new denial not implemented; synthetic STAFF setup pending. |
| Proof 1: Git history | Real baseline plus future authorized checkpoints and member contributions. | 37 branch-history commits, two author-name variants, one account `wariza818189`; five-member coverage unresolved. |
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
  branch-only foundation work pending review, not shared-target migration approval.
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
  The source checkpoint is separately authorized; independent committed-source
  review remains pending. This is not full midterm acceptance.

## Next exact action

Deep-review the committed Phase 1 source directly from GitHub. Do not begin
Phase 2 until that review approves the migration/audit foundation. Deadline, final
representative, YouTube readiness, and collaboration-proof method remain pending.
No grading evidence was captured; verification results above are implementation
checks only. Checkpoint commit, push, and remote verification results are recorded
in the execution report.
