# R1 operator migration and bootstrap

Do not run these against a shared or uncertain database. Confirm the target and a
verified backup first. The application never applies migrations on startup.

Node 24.21 was verified for R1; Argon2 uses a native addon. Configure DB_HOST,
DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME through your normal local environment.
DB_SOCKET optionally selects a Unix socket for isolated tests. No secret values
belong in command arguments, this document, or SQL. The scripts do not load env
files implicitly; Node's `--env-file` option may consume the operator's local
configuration without printing it.

Existing installation (the accepted three business tables must already exist):

```sh
node --env-file=.env.local scripts/migrate.mjs --database ces_portal
node --env-file=.env.local scripts/bootstrap-admin.mjs
```

The database argument must exactly match DB_NAME. Substitute the explicitly
approved database name if different. Bootstrap requires a TTY and prompts for
name, username, hidden password, and hidden confirmation. It refuses when any
Admin exists, including an inactive Admin. There is no default credential or
browser bootstrap endpoint. Recovery/account management is outside R1.

Fresh installation: apply `database/schema.sql` using your operator MySQL client,
then run the migration runner to verify the additive actors/indexes/FKs and
record its checksum; then bootstrap. Existing rows are never assigned an actor.

The runner serializes migrations with a database advisory lock, records an
APPLYING/APPLIED status, checksum, and completed-statement count. DDL implicitly
commits. On failure, earlier statements can remain applied. Do not edit an
already-started migration: an unchanged rerun resumes from checkpoints and
recognizes matching actor columns/indexes/FKs if DDL committed before its
checkpoint. Unexpected definitions or checksum changes stop the runner. Back up
and investigate schema drift; do not reset or drop tables to recover.

The minimal parser permits the supplied simple additive CREATE/ALTER syntax;
it is not a general SQL/procedure migration framework. Runtime database rights
should permit required reads and domain inserts, auth bucket updates, session
creation/invalidation, and audit inserts. Migration/bootstrap need separate
operator privileges. Do not grant routine audit modification/deletion or user
administration privileges to the runtime account.

R1 sessions expire absolutely after eight hours; expired sessions/buckets are not
purged automatically. Username policy is trimmed lowercase ASCII, starts with
an alphanumeric character, and permits letters, digits, dot, underscore, and
hyphen. Passwords are not trimmed and require 12–128 Unicode characters.
Five failures per canonical identifier block subsequent attempts in a 15-minute
fixed window. Audit records contain no raw login identifiers, tokens, passwords,
notes, contacts, or request bodies. Retention policy is still pending.

The demo/synthetic warnings intentionally remain. Migration does not authorize
real personal-data collection or public deployment. Exact-decimal hardening is
still required before R4 stock-out; R1 preserves existing donation rules.

## Reproducing the R1 checks

`npm run test:r1` runs the policy checks and skips database tests by default.
For integration checks, create a **new, empty** disposable MySQL schema named
`ces_r1_test_<unique_suffix>` and grant a synthetic test account access only to
that schema. Set DB_NAME and CES_R1_TEST_DATABASE to that exact same name and
configure the other DB variables for the isolated server. Then run:

```sh
node tests/r1/setup.mjs
npm run test:r1
```

The fixture loader refuses a nonempty target. The integration suite creates
synthetic accounts/donations and mutates their active/session/throttle state;
use a new disposable schema for another run. Neither script resets or deletes
business records. Framework adapters exercise the real action/auth functions;
they do not replace separate HTTP/browser acceptance against a real Next server.

## R2 Activity migration (target acceptance complete on MySQL 8.4.11)

Migration 002 adds Activities, a nullable indexed Volunteer Activity FK, and the
three approved Activity audit events. It does not seed Activities, change
historical Volunteer text, or infer links. Migration 001 is unchanged. Apply the
migration only after explicit target/backup authorization. Migration 002 target
acceptance completed successfully on MySQL 8.4.11 (`ces_portal`); isolated
implementation verification uses disposable schemas.

The runner recognizes only `002_activity_management.sql` as the successor of
`audit_logs.chk_audit_event`. It verifies the exact old or expanded allowlist
while progressing, and requires the expanded enforced CHECK after completion.
The sole permitted DROP syntax is the exact atomic replacement of that CHECK;
other destructive SQL remains forbidden. Checksums for the whole available
chain are checked before applying migrations. DATE/DECIMAL definitions, defaults,
checkpointed structures, and fresh latest-schema parity are verified. An
unchanged rerun recognizes DDL that committed before its checkpoint. Missing,
unapproved, or drifted checks fail closed; never remove migration records or
reset tables to recover.

Runtime rights additionally need Activity reads/inserts/updates and Volunteer
inserts with the Activity relationship. Do not grant Activity deletion or audit
update/deletion for ordinary runtime use. All Activity actors derive from the
verified session. Updates/status changes use row locks and revision conflicts;
public Volunteer signup holds a shared Activity lock through its insert.

`npm run test:r2` runs focused validation/audit tests and skips database checks
without explicit isolated configuration. The current integration suite requires
DB_NAME = CES_R2_TEST_DATABASE with a `ces_r2_test_` prefix, an empty fixture
schema, and a freshly initialized private `/tmp/ces-r2-mysql-*/mysql.sock` server
with networking disabled. It creates separate synthetic schemas on that server
for drift/recovery tests using its test-only root account. Never point that
socket at operator data. The selected application account needs access only to
the fixture schema. No schemas or records are automatically deleted. R1
regression uses a separate empty `ces_r1_test_` fixture with its existing setup
script. Node test isolation is disabled so the synchronous TypeScript/framework
hooks apply to every test and individual assertions are reported.
