# Midterm Implementation Specification

**PLANNING — NOT IMPLEMENTED.** Read [STATUS.md](STATUS.md) first. These are
LOCKED planning decisions, not implemented facts or authorization
to write code, migrations, tests, configuration, or database data.

## 1. Scope and source basis

Baseline: `66595665c32c0cb1e3803afa5a47d0d2a10a1bce` (committed R2), branch
`midterm-integration-checkpoint`. Existing architectural facts were checked in
`docs/architecture.md`, `docs/database-design.md`, `docs/security.md`,
`database/schema.sql`, `database/migrations/README.md`, `lib/auth/session.ts`,
`lib/auth/audit.mjs`, `lib/actions/activities.ts`, `scripts/lib/migrations.mjs`,
`scripts/bootstrap-admin.mjs`, and `lib/volunteer-qr.ts`.

Preserve Next.js App Router + Server Components/Server Actions + `mysql2/promise`
+ Zod. Baseline package declarations include Next `16.3.8`, React `19.2.8`,
Argon2 `0.45.1`, mysql2 `^3.24.5`, Zod `^4.6.5`, sharp `^0.35.5`, TypeScript,
and Tailwind 4. Ranges are declarations, not claims about a newly installed
runtime. Use the lockfile and local Next documentation at implementation time.

Relevant installed Next guides inspected for planning: authentication,
`redirect`, and `forbidden`, under the original checkout's
`node_modules/next/dist/docs/01-app/`. They confirm independent data/action
authorization, layout limitations, redirect exceptions/streaming behavior, and
the experimental `authInterrupts` requirement for `forbidden()`.

## 2. CRUD domain decision

**LOCKED — CES Staff Notices.** ADMIN publishes short internal informational
messages; all active staff can read them. Examples are a synthetic office-hours
notice or meeting reminder, not donation transactions, Volunteer consent,
activity lifecycle decisions, official records, or attendance evidence.

An obsolete or mistaken informational notice may legitimately be hard-deleted.
It has no dependent business rows. The retained application audit records who
deleted its ID and when. Reject adding hard-delete to Activities, Donations,
Volunteers, audit logs, or users merely for grading. Do not make Notices an
official retention-controlled document store. Later production adoption needs
stakeholder confirmation; this proposal is academic/demo scope.

## 3. LOCKED data model and indexes

Table: **`notices`**, InnoDB, utf8mb4, existing project collation convention.
This table definition is a design table, not a written migration.

| Column | Recommended definition | Rationale |
| --- | --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` | Match existing IDs; pass as a decimal string, never an unsafe JS number. |
| `title` | `VARCHAR(120) NOT NULL` | Required short plain-text heading. |
| `message` | `VARCHAR(2000) NOT NULL` | Bounded plain-text body; sufficient for small internal notices. |
| `created_by` | `BIGINT UNSIGNED NOT NULL` | Verified ADMIN ID, immutable after create. |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3))` | UTC creation instant, set by DB. |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3))` | Set explicitly to UTC on actual update; no implicit ON UPDATE clause. |
| `revision` | `INT UNSIGNED NOT NULL DEFAULT 1` | Small, necessary optimistic token to reject stale edits/deletes. |

Constraints: nonblank trimmed `title` and `message` database CHECKs;
`revision > 0` CHECK; `created_by → users.id` FK with **ON DELETE RESTRICT ON
UPDATE RESTRICT**. No cascade deletes.

Exact index decision — LOCKED: primary key `(id)` for identity/row locking;
`idx_notices_created_by (created_by)` to support the required foreign key;
`idx_notices_updated (updated_at, id)` to support the deterministic feed query
`ORDER BY updated_at DESC, id DESC`. No separate created-time, title, message,
revision, search, or speculative indexes. Equal timestamps resolve by ID.
Duplicate titles are permitted. Every ADMIN can manage any Notice.

Omit **`updated_by`**: UPDATE audit already records its verified actor and
timestamp, and CREATE already has `created_by`. No lifecycle status, expiry,
priority, attachment, recipient, Activity FK, soft-delete field, Markdown/HTML,
or other feature field. `revision` is justified by competing ADMIN edits and
delete confirmation against an outdated row, rather than added for the rubric.

## 4. LOCKED routes and authorization

| Actor / action | `/notices` | `/admin/notices` | Notice mutations |
| --- | --- | --- | --- |
| Active ADMIN | Read-only feed and Manage Notices link | List/create/edit/delete | Allowed after independent transaction reauthorization. |
| Active STAFF | Read-only feed | Denied before management data/UI query; safe redirect | Rejected server-side even for forged/direct action requests. |
| Anonymous, expired session, inactive/unknown-role user | Existing R1 login flow | Existing R1 login flow | Denied; no Notice/audit-success writes. |

Future source routes are `app/(staff)/notices/page.tsx` and
`app/(staff)/admin/notices/page.tsx`. Route groups add no URL prefix. There are
no detail routes or REST endpoints in this scope.

Choose **explicit safe redirect** for authenticated STAFF:
`/admin/notices` → `/notices?access=admin-required`. The shared feed displays
the fixed message **“Access denied. Only ADMIN can manage CES Staff Notices.”**
for that exact signal to a verified STAFF user. Do not reflect arbitrary query
text or use the banner/query as authorization. Show readable role context using
only synthetic account information in grading evidence. ADMIN gets the actual
management UI; denied users receive no management payload.

This is the clearest minimal stable flow for this baseline: it visibly explains
the denial and still lets STAFF read business-relevant notices. A true 403-style
interrupt would require experimental configuration; reject that extra dependency
for this checkpoint. Do not label this flow as an HTTP 403 response. Next may
emit a 307 before streaming or a streamed redirect instruction; verify actual
behavior in browser/HTTP acceptance instead of guaranteeing a wire status.

Anonymous handling retains R1's safe login/default `/dashboard` destination
behavior, including the existing layout normalization note; preserving an exact
post-login Notice return URL is excluded from this small feature. No arbitrary
`next` destination is accepted. Page redirects must be outside SQL catches so
Next's thrown redirect is not swallowed.

Add a Notices link for both roles. Keep the ADMIN management link on the shared
page after a server role check; do not add a separate global Admin menu or
propagate identity through the client navigation just to hide a link.

Navigation hiding alone is not authorization. Server protection is layered:

1. Existing staff layout verifies active login, but each page independently checks
   its required role before any protected load. Layout checks alone cannot stop
   independently rendered segments/RSC or direct actions.
2. Server-only list/read helpers verify staff; management helpers require ADMIN.
   Project only necessary fields; do not return password hashes, sessions, user
   records, or audit metadata to Notice clients. Public role has no Notice access.
3. Define a small server-only Notice ADMIN guard using existing
   `requireStaff(connection?)` plus `role === 'ADMIN'`. Its connection form uses
   R1's locked session/user recheck. Existing `requireRole` has no transaction
   connection argument and cannot replace that recheck by itself.
4. Every exported Notice mutation first verifies ADMIN, validates, opens a
   transaction, and verifies ADMIN again using the same connection. Actor ID
   always derives from session; ignore/reject submitted actor/timestamps/roles.

## 5. Validation and presentation

Server Zod schemas accept only intended FormData fields. Non-string/multiple
values for scalar fields fail validation; do not silently select a duplicate
field or trust hidden controls. Browser limits supplement server enforcement.

- Trim outer whitespace; reject whitespace-only title/message. Count Unicode
  code points, as the project does, rather than bytes or UTF-16 units. Title is
  1–120 characters; message is 1–2000 after normalization. Reject, never truncate.
- Title rejects control characters. Message normalizes CRLF/CR to LF and permits
  LF/tab for plain-text paragraphs, rejecting other control characters. Preserve
  meaningful internal spaces and newlines. React escapes text; use a whitespace
  preserving text block, never `dangerouslySetInnerHTML` or markup parsing.
- IDs are canonical positive decimal strings at most `18446744073709551615`,
  checked with BigInt/range validation and bound as strings. Reject signs,
  decimals, zero, whitespace variants, and excess length.
- Submitted revision is an integer string 1–4294967295, converted only after
  validation. Reject stale revision and counter overflow on edit. Delete may
  still remove a max-revision Notice after matching the current revision.
- Keyboard-accessible controls, labels/errors, visible pending states, and
  delete confirmation show title and revision. Cancel performs no write. Disable
  repeat clicks while pending. Keep input on validation/conflict failure.
- No idempotency key/table is added: create double-submit prevention is UI-level,
  not an exactly-once guarantee. If commit outcome is uncertain, inspect before
  retrying rather than creating a duplicate.

## 6. LOCKED parameterized CRUD and transaction behavior

Below are conceptual query contracts for implementation, not runnable migration
or application code. Use `connection.execute(sql, values)`/`db.execute` with
fixed SQL. Never interpolate user data, IDs, revisions, sorts, identifiers, or
search strings. Ordering/columns/table names are fixed server constants.

| Operation | Conceptual bound-query contract | Result and integrity rule |
| --- | --- | --- |
| CREATE | Insert `title=?, message=?, created_by=?`; schema supplies generated ID, timestamps, revision 1. | Require affectedRows = 1; obtain ID as string with `CAST(LAST_INSERT_ID() AS CHAR)` on same connection; insert `NOTICE_CREATED` audit before commit. |
| READ | Select allowlisted Notice columns with fixed `ORDER BY updated_at DESC, id DESC`; single-ID reads use `WHERE id=?`. | Require active staff/ADMIN as appropriate; missing row returns safe not-found/conflict. No transaction needed for ordinary listing; no view audit required. |
| UPDATE lock | Select current row `WHERE id=? FOR UPDATE`. | Inside authorized transaction, require row exists and submitted revision equals stored revision. |
| UPDATE write | Set `title=?, message=?, updated_at=UTC_TIMESTAMP(3), revision=revision+1 WHERE id=? AND revision=?`. | If unchanged, report no change and write no audit/timestamp/revision. Otherwise reject overflow, require affectedRows = 1, and audit `NOTICE_UPDATED`. |
| DELETE lock | Select current row `WHERE id=? FOR UPDATE`. | Require current revision matches confirmed revision; missing/stale row is a safe conflict, never a successful repeated delete. |
| DELETE write | Delete `WHERE id=? AND revision=?`. | Require affectedRows = 1, then audit `NOTICE_DELETED` with deleted ID on the same transaction. No related data deletion. |

All successful mutations and their audit inserts commit together. Acquire the
session/user lock before the Notice lock consistently. Roll back on validation
inside transaction, authorization loss, stale/missing row, affected-row failure,
audit failure, driver failure, or lock timeout; release the connection in finally.
No mutation uses a client-supplied creator/updater. Return safe user messages;
log only bounded safe codes, never raw SQL/driver messages, form text, or secrets.

Competing edits/deletes serialize on the row lock and revision; at most one
mutation of a given revision succeeds. An edit must not overwrite a newer edit;
a stale delete must not remove newly edited content. Revocation/deactivation is
checked by the in-transaction user/session lock. Races are tested, not merely
assumed. Deadlocks/timeouts return a safe retry-after-review message; do not
automatically replay an uncertain commit.

After confirmed commit, revalidate `/notices` and `/admin/notices`. A refresh
failure must still report saved, with a reload instruction, not a failed mutation
that invites duplicate submission. Unknown commit outcome is reported as
uncertain and requires a read/check before retry. Do not cache protected Notice
data across users/requests; preserve the current server-first data pattern.

## 7. Definite audit decision and migration work

**Audit CREATE, UPDATE, and DELETE.** This matches existing transactional domain
audits, makes actor/delete evidence clear, and avoids a temporary unaudited
feature that would be harder to merge later. Events: `NOTICE_CREATED`,
`NOTICE_UPDATED`, `NOTICE_DELETED`; entity type `NOTICE`; outcome `SUCCESS`;
reason code NULL; actor and entity IDs required. Audit entity IDs are application
references, not a Notice FK, so delete evidence survives Notice deletion.

CREATE metadata is NULL. DELETE metadata may contain only `previous_revision`;
never retain the deleted full message. UPDATE metadata is only
`changed_fields` (unique subset of `title`, `message`), `previous_revision`, and
`new_revision` (exactly previous + 1). No Notice text, user names, credentials,
hashes, request bodies, or personal information in metadata. Add strict exact-key
validation in the shared audit helper. Denied/no-op/stale requests create no
success event. Do not add a denied-event schema expansion just for recording.

Future migration work must create Notices and expand `chk_audit_event`, retaining
all R1/R2 events. Existing `scripts/lib/migrations.mjs` recognizes exactly the
Migration 002 checksum/constraint successor; an extra event currently fails
closed. Extend it with one explicitly recognized Notice successor, exact old/new
allowlists, chain checksums, verification of prior applied structures at latest
state, completed-statement recovery, and fresh-schema parity. Keep arbitrary
DROP/TRUNCATE/business DELETE and unknown successors rejected. The only additional
DROP CHECK allowance is the exact atomic replacement of this same constraint.
Do not edit historical 001/002 or remove migration records. MySQL DDL implicitly
commits; checkpoint recovery is required, not a claimed atomic DDL transaction.

LOCKED branch-only reservation: **`003_midterm_notices.sql`**. The committed
baseline contains 001/002 and approved R3 intentionally adds no migration. Do
not create 003 in this checkpoint. If main gains another Migration 003 before
the midterm feature is intentionally merged, renumber the Notice migration and
regenerate its checksum/references **before it is ever applied to a shared
main-development database**. Never rewrite an already-applied migration identity.
If the Notice migration has already been applied to a retained demo/test database,
preserve that applied chain and stop for a reviewed reconciliation strategy; do
not silently rename an applied migration. See reconciliation below.

## 8. Demo database and account setup plan

Use **`ces_portal_midterm_demo`**, separately created on approved local MySQL 8.4.
No data export/copy from accepted `ces_portal`, no reuse of its credentials,
no change to Docker Compose, accepted containers, or volumes. A DBA/operator may
create this additional schema with scoped privileges after separate approval.

Recommended future setup sequence:

1. Confirm selected branch/checkpoint, target hostname/schema, operator scope,
   and empty fresh target. Use locally supplied environment configuration,
   `DB_NAME=ces_portal_midterm_demo`; operator verifies `SELECT DATABASE()`.
2. Apply the checkpoint's reviewed latest fresh schema, then the recognized
   migration chain to verify structures and record checksums. Use the reserved
   Notice identity `003_midterm_notices.sql`; preserve historical 001/002. No
   migration runs on app startup. This is future work; no schema/migration file is created now.
3. Bootstrap synthetic ADMIN with existing `scripts/bootstrap-admin.mjs` using
   hidden interactive password entry. Then use a reviewed **demo-only operator
   fixture command** to create one synthetic active STAFF account: exact schema
   guard, validated canonical username/name, hidden password/confirmation,
   `hashPassword` from `lib/auth/passwords.mjs`, parameterized insert in a
   transaction, refusal to overwrite any existing identity. This is fixture
   provisioning, not product account lifecycle. Do not invent a user-created
   audit event; record fixture setup separately; real logins use existing audits.
4. Runtime DB account receives necessary R2 rights plus Notice SELECT/INSERT/
   UPDATE/DELETE and audit INSERT. Grant DELETE to `notices` specifically, not
   global business/audit/user DELETE. Keep DDL/user administration operator-only.
5. Establish synthetic Notice examples if needed through actual ADMIN UI. A
   managed ACTIVE Activity is only needed if demonstrating a submitted Volunteer;
   QR/app usage can be shown by opening the public form without registration.
6. Run the app from this worktree in a separate process/port with local
   environment settings. Never copy/read original `.env.local` or `.env.docker`.
   Keep cookie sessions separate from the original app (use a distinct local
   hostname or isolated browser profiles); different ports alone do not isolate
   cookie scope. Stop/restart the demo process when changing DB configuration,
   since its pool is process-global.

Credentials remain local/uncommitted, entered hidden, never passed as command
arguments or shown in evidence. Future setup instructions must first verify
local ignore/exclude rules and keep secret configuration outside Git if necessary;
no configuration edits are made now. Use the documented Node runtime compatible
with native Argon2; install the branch's lockfile dependencies only after approval.

Reset rehearsals by completing Notice UI delete for each known rehearsal ID,
retaining audit history. Log out and use a new synthetic Notice per take. Never
reset/truncate audit logs, users, migrations, or core records. If a fresh complete
fixture is needed, create a new empty `ces_portal_midterm_demo_<run>` schema with
separate authorization and credentials, recreate synthetic fixtures, and verify
target before use; preserve the previous run. Do not DROP any schema/volume to
reset. Integration tests use separate explicitly selected empty disposable
`ces_midterm_test_<run>` schemas, not the recording schema or accepted database.

## 9. Likely future source scope (not created now)

| File / area | Planned responsibility |
| --- | --- |
| `app/(staff)/notices/page.tsx` | Staff-authorized read feed, ADMIN Manage link, fixed denial banner. |
| `app/(staff)/admin/notices/page.tsx` | ADMIN check/STAFF redirect before protected management load. |
| `components/notices/*` | Small feed/management form/delete confirmation and accessible feedback; avoid unnecessary component splits. |
| `lib/notices.ts` | Server-only projections/list/lock helpers with independent role checks. |
| `lib/auth/notice-authorization.ts` | Small connection-aware ADMIN guard over existing session verification. |
| `lib/actions/notices.ts` | Independently authorized transactional actions and post-commit refresh. |
| `lib/validation/notices.ts` | Definite Unicode text/ID/revision/FormData validation. |
| `components/layout/staff-navigation.tsx` | Shared Notices link only; preserve original R3 navigation until reconciliation. |
| `lib/auth/audit.mjs` | Notice event/metadata allowlists; existing behavior preserved. |
| `database/schema.sql`, future `003_midterm_notices.sql` | Fresh/migrated parity and audit CHECK extension using the branch-only reservation. |
| `scripts/lib/migrations.mjs` | Exact successor recognition/recovery and structure validation. |
| `scripts/seed-midterm-demo.mjs` | Guarded synthetic STAFF fixture only, after separate review; no public administration. |
| `tests/midterm/*` and appropriate package test entry | Focused checks only when implementation is authorized; reuse safe test adapters. |
| Relevant existing project docs and `docs/midterm/*` | Verified implementation/setup/evidence status sync in future checkpoints. |

Future precise file scope is reviewed before implementation. No code, config,
test, migration, account fixture, or other source file is authorized in this task.

## 10. Verification strategy and acceptance criteria

After implementation is authorized, run meaningful focused validation/policy,
transaction, migration, and browser checks; typecheck, lint, and production build.
R1/R2 regressions remain required where shared audit/migration code changes.
Their existing DB suites require their own guarded R1/R2 schemas/private test
server; never point them at demo or accepted data. Report skipped DB checks as
skipped, not passed. Use the existing documented webpack build fallback only if
the same environment limitation is encountered, and record actual commands.

Acceptance requires all of the following:

1. ADMIN creates, reads, edits, and physically deletes a synthetic Notice; same
   ID is proven in UI and DB before/after; actor/timestamps/revisions correct.
2. STAFF reads notices, directly requests `/admin/notices` and gets the planned
   denial redirect; direct action invocation/forged ADMIN actor cannot write.
   Anonymous/expired/inactive/unknown-role requests cannot read protected data
   or mutate; in-transaction role revocation is tested.
3. Validation covers boundary/over-limit Unicode, blank/control/multiline text,
   invalid/large IDs/revisions, duplicates in scalar FormData, and SQL-shaped
   input persisted safely as literal text or rejected by validation.
4. Audits match every successful real mutation, survive delete, contain no text
   or secrets, and cannot be orphaned by audit failures. Injected create/edit/
   delete audit failures roll back Notice changes. No-op edits write nothing.
5. Competing edit/edit and edit/delete with one revision yield one success and
   a safe conflict; absent rows, stale deletion, max revision, lock failures,
   refresh failure, and uncertain commit return truthful safe results.
6. Fresh install and R2 upgrade produce equivalent schemas; unchanged rerun,
   DDL-before-checkpoint recovery, old/new audit CHECK recognition, checksum/
   schema drift, and unknown/destructive successors are covered in isolation.
7. Actual browser/HTTP behavior validates both routes, denial/RSC absence of
   management controls/data, pending/confirmation/errors, keyboard/mobile use,
   and post-mutation feed refresh. Server guard evidence supplements hidden links.
8. Existing QuickChart POST/PNG/poster/public destination remain intact. Core
   business behavior and existing audit events/constraints remain unchanged.
9. Demo target and privileges are verified; no accepted DB writes or original
   R3 edits. Evidence meets all six proof categories and AI/submission plan
   before final midterm acceptance (not a condition falsely claimed now).

## 11. Git checkpoints and later reconciliation

After explicit authorization: planning checkpoint → implementation checkpoints
(schema/audit safety; CRUD and role boundaries; UI and genuine member changes,
with relevant checks) → evidence/documentation checkpoint → final midterm
checkpoint. Each is reviewable, not a single dump commit. Commits/pushes require
their own explicit authorization; no invented hashes, authors, or timestamps.

Notices may be useful enough to keep as an internal staff information feed;
recommend retaining it **only after stakeholder/product review**. Do not merge
now. First stabilize R3 separately in its original worktree through its authorized
checkpoint, and checkpoint reviewed midterm source separately. Later reconcile
in a separate integration branch/worktree from the agreed main checkpoint,
reviewing navigation, shared audit/policy/migration code, and status documentation.
No casual copying of dirty R3 files into this R2 baseline.

Use the reserved `003_midterm_notices.sql` only on this midterm branch. If main
gains another 003 before intentional merge, the Notice migration must be
renumbered and its checksum/references regenerated before any application to a
shared main-development database. Never rewrite an already-applied migration
identity. A collision involving a retained applied chain requires a reviewed
reconciliation strategy, preserving applied identities and checksums. Re-run
fresh install, existing-main upgrade, audit allowlists, and R3/Notice regressions
on isolated databases.

## 12. Explicit exclusions

No implementation now; reservation only, no migration file; no target DB or
Docker writes; no R3 edits/copy/merge. Only the five planning documents may be
staged, committed once, and pushed to the dedicated midterm branch in this task. No ORM, Express,
Redux, Axios, new external API, unnecessary REST API, client-only permissions,
new roles, account lifecycle, official retention system, audit deletion, or
rubric-driven delete of core business/user records. No real personal data,
production/public deployment, fabricated contributions/evidence/dates/signatures,
or final PDF/evidence files during planning. `.aws` is unrelated and excluded.
