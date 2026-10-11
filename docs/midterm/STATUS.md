# Midterm Status

**PLANNING — NOT IMPLEMENTED**

This is the single authoritative midterm tracker. Update it after verified
midterm changes; other documents define the specification and capture process,
not competing completion trackers. Planning foundation reviewed; core CRUD/RBAC
design LOCKED. Implementation not started; evidence not captured; team inputs
pending. No runtime acceptance is claimed.

## Baseline and boundaries

Planning inspection date: **2026-10-11, Asia/Manila**. This is the actual planning
date, not a historical development, evidence, signature, or commit date.

| Item | Verified state / boundary |
| --- | --- |
| Original worktree | `/home/whis/Projects/ces-portal`, branch `main`; approved unstaged R3 Donation Records work is frozen. |
| Original and midterm committed baseline | `66595665c32c0cb1e3803afa5a47d0d2a10a1bce` — `docs: sync R2 activity management status`. |
| Midterm worktree | `/home/whis/Projects/ces-portal-midterm`; created only after confirming path and local branch were absent. |
| Midterm branch | `midterm-integration-checkpoint`; planning checkpoint descends directly from the baseline SHA. |
| Initial midterm state | Clean checkout of committed R2; no R3 changes copied. |
| Current midterm Git state | Checkpoint scope: exactly five Markdown files in `docs/midterm/`. This task authorizes explicit staging, one documentation commit, and dedicated-branch push; verify resulting SHA/remote/clean state in the execution report. |
| Databases / Docker | No connections, queries, schema changes, data changes, container actions, or volume actions in this task. Accepted `ces_portal` remains outside midterm writes. |
| Unrelated directory | `.aws remains unrelated, untouched, and excluded.` |

The baseline `PROJECT_STATUS.md` and requirements say R3 has not started because
they describe committed R2. The user's current task establishes that approved
R3 code exists **unstaged in the original worktree**. Preserve both facts;
do not rewrite baseline documentation or infer that R3 belongs to this branch.

## LOCKED planning decisions

The current task approves and locks these planning decisions. **Implementation
is not authorized.** Record any later approved design revision here first.

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

All remain PENDING; they do not block this planning checkpoint and must be
resolved before evidence production is finalized.

- Team name
- Complete member roster
- Submission deadline/date
- Chosen representative
- Which members already have Git commits
- YouTube/channel availability for each walkthrough
- Planned collaboration-proof method

## Git/team evidence risk

Historical repository review found **35 commits and two recorded author
identities**. This does not prove all current team members are represented. A
complete roster is required and must be compared before inferring member
coverage. Missing history requires genuine future contributions each member
understands. Do not fabricate/backdate commits. The instructor preference for
work spread across weeks cannot be retroactively manufactured; this is an
evidence risk, never a reason to falsify history.

## Migration reservation — LOCKED

Reserve `003_midterm_notices.sql` only for this dedicated midterm branch; no
migration is created now. Committed baseline has 001/002; approved R3 adds none.
If main gains another Migration 003 before intentional midterm merge, renumber
the Notice migration and regenerate its checksum/references before it is ever
applied to a shared main-development database. Never rewrite an already-applied
migration identity; an applied-chain collision requires reviewed reconciliation.

## Decisions pending / review inputs

| Input | Why needed | Effect |
| --- | --- | --- |
| Deep review of pushed implementation specification | Required before Phase 1 implementation authorization. | Planning design locked; no code/database authorization yet. |
| TeamName, roster, roles, actual authorship mapping, representative | Needed for cover, contribution assignments, and Classroom comment. | Submission/input gap; no core design blocker. |
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
| Week 3: DB, full CRUD, parameterization | Notice create/read/update/delete with bound SQL and audit transaction. | Design complete; Notices not implemented; demo DB not created. |
| Week 4: login, two roles, restriction | Existing R1 plus ADMIN-only Notice management and shared read page. | Login/roles exist at R2; new denial not implemented; synthetic STAFF setup pending. |
| Proof 1: Git history | Real baseline plus future authorized checkpoints and member contributions. | 35 baseline commits, 2 distinct recorded author identities; roster mapping unverified. |
| Proof 2: unedited 3–5 minute recording | Timed demo covering API/app, CRUD, login, denial, and source evidence. | Script planned; no recording created. |
| Proof 3: API request/status/response | Postman request and binary PNG preview, paired with app usage. | Capture pending; do not treat history as new capture. |
| Proof 4: DB create/update/delete before/after | Same Notice ID through absent → created → updated → absent; retained audit. | No Notice rows/schema/evidence yet. |
| Proof 5: hashed password and regular-user denial | Synthetic Argon2id evidence, ADMIN access, STAFF login/direct denial. | Safe capture plan complete; no account credentials or stored account hashes inspected. |
| Proof 6: each member walkthrough/change/YouTube | Roster-linked actual file/function, genuine change, real commit, video link. | Names, assignments, contributions, recordings, uploads pending. |
| Collaboration / timestamped group image | Genuine dated collaboration proof and real-time date/time image. | Not supplied; never fabricated. |
| AI disclosure / log / proof / signatures | Episode log, actual commit mapping, `/ai-evidence` proof, individual declarations. | Plan only; form, evidence exports, truthful reconstruction, signatures pending. |
| PDF / Classroom | Required structure/format/filename and individual completion checklist. | Assembly and submission pending. |

## Known gaps and verification boundary

- All six proof categories remain to be assembled for this checkpoint. Existing
  source and historical acceptance are context, not fabricated current proof.
- Two recorded Git identities cannot establish contributions from every member.
  Treat per-member history as an evidence gap until roster mapping is verified;
  absent contributions must be genuine future work, never backdated authorship.
- R2 has no ordinary STAFF-account provisioning workflow. Plan a guarded
  demo-only operator fixture, not a new account-management product feature.
- The migration runner's exact R2 audit successor must be deliberately extended
  for Notices; simply adding events or dropping its guard is insufficient.
- Internet/provider availability, a phone-reachable URL/second device if used,
  readable recordings, and instructor access to YouTube/evidence need rehearsal.
- Production deployment, real personal data, retention policy, and main-product
  acceptance remain outside this academic plan.
- Documentation checks only: exact-path scope, whitespace/untracked-file diff
  review, local links, baseline ancestry, explicit five-file index/commit scope, and original R3 content/state
  comparison. No application tests, builds, API requests, or DB checks run.

## Next exact action

Deep-review the pushed implementation specification from GitHub, resolve team inputs, then authorize Phase 1 midterm implementation. No implementation has started.

Planning foundation reviewed; core CRUD/RBAC design LOCKED. The execution report
records the actual planning commit, push result, and remote verification. Evidence
readiness and implementation authorization remain pending.
