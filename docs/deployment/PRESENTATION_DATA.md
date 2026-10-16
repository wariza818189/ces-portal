# Synthetic presentation data — review before execution

Prepared 2026-10-16 (Asia/Manila). **No Azure seed or rollback was executed.**
This is an operator fixture for the approved academic demonstration, separate
from the small live browser QA writes listed in [PRESENTATION_QA](PRESENTATION_QA.md).
It adds no product workflow, migration, account, integration or currency rule.

## Reviewable dataset

The proposed revised batch is `CES-PRESENTATION-20261016-v2`. Its explicit reference
date is `2026-10-16`; changing that date changes the reviewed records and requires
review of a new preview. Expiry labels are always calculated by the application
relative to its current date, so rehearse near the chosen presentation date.

| Table | Intended additions |
| --- | --- |
| Goods / Inventory | Canned 120 pcs, received Oct 6, expires Jan 14 2027 (fresh); Rice 25 kg, received Oct 11, expires Oct 19 (soon); Noodles 40 packs, received Oct 9, expires Oct 16 (due today/soon); Other 6 boxes, received Oct 2, expires Oct 15 (expired). |
| Cash | `1500.00` and `725.50`, received Oct 14/15, with concise academic-sample notes for fictional Starling Outreach Circle / Willow Student Circle. Total `2225.50`, without an assumed currency. |
| Activities | Community Packing and Outreach ACTIVE (Oct 20); Student Reading Circle DRAFT (Oct 26); Community Supply Sorting CLOSED (Oct 13); Outreach Planning Rehearsal ARCHIVED (Oct 9). Clean display names; fictional venues. |
| Volunteers | Mira Starling, Niko Willow and Lina Meadow, each labeled `(fictional)`, BSIT Years 1–3 and `00000000000` contacts. All link to the ACTIVE packing activity and retain its name snapshot. |
| Notices | Packing team briefing / Volunteer orientation, with concise academic-sample context in the message. |

All venues/organizations/people are fictional. Goods has no donor-name field;
no such field is invented. Inventory derives from Goods; no separate inventory
rows or hardcoded dashboard values are introduced. Unlike units are not summed.
No real phone/email is used, and no message is sent to anyone. Venue coordinates
are omitted rather than placing a fictional venue at a real location.

Inspect the [v2 preview](presentation-qa/presentation-plan-v2.json), or regenerate
it without a database connection:

```bash
node scripts/presentation-data.mjs --date 2026-10-16 --batch CES-PRESENTATION-20261016-v2
```

## Operator execution, only after separate approval

### Version and existing-data safety

The original [v1 preview](presentation-qa/presentation-plan.json) is preserved
unchanged for traceability. The default preview is now v2; explicit `--batch`
is recommended for all review and execution commands. No Azure execution of
either version occurred in these tasks.

V2 removes raw `CES-PRESENTATION-...` and `[Presentation]` codes from display
fields while retaining obvious `(fictional)` person/venue labels, academic
sample text, zero-only contact numbers and the interface prototype disclosure.
The 15-record counts, exact Cash sum, units, dates, expiry coverage, supported
Activity transitions and linked Volunteer snapshots are unchanged.

Existing v1 journals are not rewritten or converted. Use
`--batch CES-PRESENTATION-20261016-v1`, the **original date, target and manifest**,
and matching `apply:CES-PRESENTATION-20261016-v1` for a read-only rerun or
`rollback:CES-PRESENTATION-20261016-v1` for a separately approved rollback.
New v1 applications without an existing journal are retired/refused. V2 will
not adopt v1 records or clean up QA data; remaining v1 rows require review of
their original journal. Do not apply v2 over v1 by changing the journal version,
hash, path or snapshots. If either version was applied outside this chat,
reconcile the actual target before approving another seed.

1. Obtain approval for this dataset, exact Azure MySQL DNS host/port/database,
   existing active ADMIN ID used for audit attribution, and the seed operation.
2. Take and verify the approved target backup. Record baseline row counts,
   Cash sum, Activities and Notices; preserve the existing live QA records.
3. Use the already authorized operator environment through its normal secure
   mechanism. Do not paste credentials into commands, reports or chat. The tool
   reads `DB_*` environment variables; it never reads an env file itself.
   Do not change users, grants, credentials, firewall, tier or migrations to
   make the tool run. Stop if existing operator permissions are insufficient.
4. Choose a **new absolute manifest path outside Git** in a private durable
   directory, with a backup. Keep the same file for all reruns and rollback.
   The directory must already exist. Do not use ephemeral `/tmp` for Azure's
   real operation journal; `/tmp` was used only for isolated tests.
5. Replace the review placeholders below with the approved non-secret target
   identity and manifest path. These are examples, not instructions to run now.

```bash
node scripts/presentation-data.mjs --date 2026-10-16 --batch CES-PRESENTATION-20261016-v2 --mode apply \
  --host APPROVED_MYSQL_DNS --port 3306 --database APPROVED_DATABASE \
  --actor APPROVED_ADMIN_ID --manifest /PRIVATE_DURABLE_DIRECTORY/ces-presentation-v2.json \
  --approve apply:CES-PRESENTATION-20261016-v2
```

The configured host/port/database must exactly match these flags. Every network
target requires `DB_SSL_MODE=VERIFY_IDENTITY`; the only socket exception is the
isolated `/tmp/ces-presentation-mysql-*` test server with host `localhost`.
The selected database and applied 001/002/003 migration statuses/counts are
checked. No DDL or migration runs. The existing active ADMIN is locked in the
write transaction; this is direct **operator fixture attribution**, not proof
of an interactive ADMIN session or a new product provisioning capability.

An exclusive journal lock and database advisory lock serialize this batch.
All 15 business inserts and their existing supported audit events commit in one
transaction. Activities start Draft and use supported audited transitions to
reach the requested statuses. Volunteers have no newly invented audit event.
No pre-existing row is updated, replaced, deleted or adopted as fixture data.
Every planned Goods/Cash tuple, Activity name, Notice title and Volunteer name is checked for collisions before insertion. Any collision refuses the entire operation without adopting or overwriting the existing row. Remaining v1 markers also block v2. The same advisory lock serializes both versions.

The private journal is the durable replacement for long visible batch codes. It records generated IDs, version, exact plan hash, actor and complete synthetic row snapshots. Rerun/rollback verifies both the reviewed plan fields and every stored column, including Activity/Volunteer relationships.
It is synced before commit (`prepared`), then marked `applied`. Repeating apply
with that same journal verifies every row and performs zero business/audit
writes. Changed/missing rows cause refusal rather than replacement. A rolled-back
batch cannot be reapplied. Do not create another journal to bypass these guards.

6. Inspect actual UI/SQL totals after successful execution. If the live QA
   records are still the only other records, expected totals are Goods `5`, Cash
   `2225.87`, Volunteers `5`, Activities `6`, Notices `2`. These are **predictions**,
   not observed Azure seed results. Refresh all pages and verify the active
   selector, four Activity statuses and current expiry labels.

## Rollback, only after separate approval

This is an exceptional operator rollback of the fixture, not a new business
delete workflow. Preserve/review the original journal and take a fresh backup.

```bash
node scripts/presentation-data.mjs --date 2026-10-16 --batch CES-PRESENTATION-20261016-v2 --mode rollback \
  --host APPROVED_MYSQL_DNS --port 3306 --database APPROVED_DATABASE \
  --actor APPROVED_ADMIN_ID --manifest /PRIVATE_DURABLE_DIRECTORY/ces-presentation-v2.json \
  --approve rollback:CES-PRESENTATION-20261016-v2
```

Rollback locks and compares **all columns of all 15 manifest rows** before any
delete. It refuses drift, missing rows and additional Volunteers linked to a
seeded Activity. It deletes only those exact IDs, children before parents, in
one transaction. All previous audit history remains; supported Notice delete
audit events are appended. It invents no Goods/Cash/Volunteer/Activity deletion
events. The operator must retain the journal as the explanation for the
seed-only business-row removals. Existing users, sessions, credentials, unrelated
records and auto-increment sequences are preserved. Repeating a completed
rollback is a zero-write no-op. Original live QA records are outside this journal
and cannot be removed by this rollback.

If a process crashes, commit is uncertain, or the journal is `initializing`,
`prepared`, `rollback_prepared`, or has a stale `.lock`/`.next` file, **stop**.
Do not discard the journal or blindly retry. An operator must compare the saved
IDs/snapshots and retained audits against the approved database and backup,
establish whether the transaction committed, and document reconciliation before
changing any journal state. A lost journal is not automatically reconstructed
by matching existing tuples. Do not perform a wholesale shared-database restore
over intervening records as routine cleanup.

## Verification boundary

Twelve automated checks, including v1/v2 compatibility, cross-version refusal and collision checks in every domain, plus including real insert/rollback/idempotency/drift/referral/
uncertain-journal/failure-atomicity checks, pass on a new **socket-only MySQL
8.0.46** under `/tmp`. An existing baseline Goods row and all users/audits were
preserved. Test schemas are retained and the private server is stopped after
verification. No Azure database connection was made by this tool. MySQL 8.4
operator execution, backups, permissions and final UI totals still require the
approved target rehearsal. Direct write CLI modes are deliberately absent from
package scripts and CI/deployment automation.
