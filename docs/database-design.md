# Database Design

## Current schema

The application database is `ces_portal`. `database/schema.sql` defines the fresh R2 application schema; numbered migrations maintain existing installations. The original three business tables remain, with R2 additions described below:

| Table | Fields and SQL types | Constraints and indexes |
|---|---|---|
| `goods_donations` | `id BIGINT UNSIGNED AUTO_INCREMENT`; `category VARCHAR(50)`; `quantity DECIMAL(10,2) UNSIGNED`; `unit VARCHAR(20)`; `expiry_date DATE`; `date_received DATE`; `created_at TIMESTAMP` | Primary key; category, quantity, unit, expiry date, received date, and creation time are non-null; unit defaults to `pcs`; quantity check `> 0`; indexes on expiry date and category. |
| `cash_donations` | `id BIGINT UNSIGNED AUTO_INCREMENT`; `amount DECIMAL(12,2) UNSIGNED`; `date_received DATE`; `notes VARCHAR(255)`; `created_at TIMESTAMP` | Primary key; amount, received date, and creation time are non-null; notes is nullable; amount check `> 0`; index on received date. |
| `volunteers` | `id BIGINT UNSIGNED AUTO_INCREMENT`; `full_name VARCHAR(100)`; `course_year VARCHAR(100)`; `contact_number VARCHAR(30)`; `activity VARCHAR(150)`; `created_at TIMESTAMP` | Primary key; all listed fields are non-null; index on creation time. |

Goods and Cash donations remain separate because their fields differ. Both now include `recorded_by BIGINT UNSIGNED NULL`, with a nonunique actor index and foreign key to `users.id`. Legacy donations keep NULL; no historical actors are backfilled. New authenticated Goods/Cash actions populate the actor from the verified session. The existence of a table does not establish a complete stakeholder-approved workflow.

### R1 authentication, audit, and migration tables

| Table | Main fields and constraints | Purpose / relationships |
|---|---|---|
| `users` | Generated unsigned BIGINT `id`; `name VARCHAR(100)`; unique ASCII/binary `username VARCHAR(64)`; `password_hash VARCHAR(255)`; `role VARCHAR(10)`; `is_active BOOLEAN`; millisecond creation/update timestamps. Checks enforce `ADMIN`/`STAFF`, active values, and username format. | Project-local accounts; stores Argon2id hashes, never plaintext passwords. |
| `staff_sessions` | `token_hash BINARY(32)` primary key; unsigned BIGINT `user_id`; `created_at`/`expires_at DATETIME(3)`; expiry-after-creation check; user/expiry indexes. | SHA-256 token digest only; FK `user_id → users.id`. |
| `auth_rate_limits` | `identifier_hash BINARY(32)` primary key; `failures TINYINT UNSIGNED`; `window_started_at DATETIME(3)`; failures check `<= 5`; window index. | Hashed canonical identifier buckets for the 15-minute login window. |
| `audit_logs` | Generated unsigned BIGINT `id`; nullable `actor_user_id`; allowlisted event/entity/outcome fields; nullable entity ID/reason/JSON metadata; creation timestamp; event/outcome checks; creation/actor indexes. | FK `actor_user_id → users.id`; entity type/ID are application references, not polymorphic database FKs. R1 metadata is NULL. |
| `schema_migrations` | ASCII/binary `version VARCHAR(100)` primary key; `checksum CHAR(64)`; `APPLYING`/`APPLIED` status check; completed-statement count; start/applied timestamps. | Created and maintained by the migration runner, rather than the fresh application schema file. |

All application tables use InnoDB. The four R1 foreign keys (session user, audit actor, Goods actor, Cash actor) use `ON DELETE RESTRICT ON UPDATE RESTRICT`; they do not cascade-delete records. Auth/audit/session timestamps use UTC millisecond datetimes; existing business `created_at` TIMESTAMP fields remain unchanged. Do not expose stored hashes or token values in documentation or client responses.

### Additive schema evolution

`database/migrations/001_auth_foundation.sql` adds the four auth/audit tables and donation actor columns/indexes/FKs. The runner creates `schema_migrations`, serializes execution with an advisory lock, verifies checksums and existing structures, checkpoints each statement, and safely verifies/resumes an unchanged rerun. MySQL DDL implicitly commits, so recovery uses checkpoints rather than claiming one atomic migration transaction. Migration 001 performs no DROP, TRUNCATE, destructive reset, or actor backfill and remains unchanged historical SQL.

For a fresh install, apply `database/schema.sql`, then run the migration tool to verify structures and record the Migration 001/002 checksums. Existing installations use the migration tool directly after target/backup verification; the app never migrates on startup. See [operator guidance](../database/migrations/README.md). Migration 001 was accepted on actual MySQL `8.4.11`, database `ces_portal`, with status `APPLIED`, 10 checkpointed statements, and a verified rerun; detailed evidence is in [testing](testing.md#ces-portal-v2-r1--authentication-authorization-and-audit-foundation).

Donation Records (R3), Distribution and exact-decimal inventory hardening (R4), and CSV exports/audit hardening (R5) remain future work. R3 has not started; future tables are not asserted as implemented.

## Goods quantity and dates

Goods quantity uses `DECIMAL(10,2) UNSIGNED`, allowing at most two fractional decimal places in storage; current validation rejects inputs with more than two places and does not silently round them. The positive-value database check is also present.

`expiry_date` and `date_received` use SQL `DATE`, representing calendar dates rather than instants. The current application validation accepts valid ISO dates from `1000-01-01` through `9999-12-31` and rejects future received dates according to the configured application time zone (`Asia/Manila` by default, configurable with `APP_TIME_ZONE`). Past expiry dates are allowed, and expiry earlier than received date is warned about rather than hard-rejected. `date_received` is the business date goods arrived; `created_at` is the database record creation timestamp.

Expiry status is derived from `expiry_date` at read/display time. There is no expiry-status column in the current schema, avoiding a stored value that can become stale as time passes. Dashboard and Inventory use the same reusable helper and rules: before today is expired; today through seven days ahead is expiring soon; later is fresh.

Goods quantities with different units must not be presented as one summed quantity unless approved unit-conversion rules are defined; `pcs`, `kg`, and other units are not directly additive.

## Current state versus policy

The tables, columns, SQL types, constraints, and indexes above are facts from the current schema. The following are project policy recommendations, not features of the schema: keep calendar dates as SQL `DATE`; derive expiry status; preserve Goods/Cash separation unless an approved design change justifies otherwise; and make schema changes through reviewed, documented SQL migrations or a controlled schema update. R1 now provides the additive migration mechanism described above; migration/operator execution requires explicit target and backup verification.

## CES Portal v2 R2 Activities and Volunteer relationship

`activities` is an InnoDB managed business table in the current fresh schema and Migration 002:

| Column | SQL type / definition |
|---|---|
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `name` | `VARCHAR(150) NOT NULL`; duplicate names allowed |
| `activity_date` | `DATE NOT NULL` |
| `status` | ASCII/binary `VARCHAR(10) NOT NULL DEFAULT 'DRAFT'` |
| `venue_name` | `VARCHAR(250) NULL` |
| `latitude` | Exact `DECIMAL(8,6) NULL` |
| `longitude` | Exact `DECIMAL(9,6) NULL` |
| `created_by` | `BIGINT UNSIGNED NOT NULL`; verified staff actor |
| `created_at`, `updated_at` | `DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3))` |
| `revision` | `INT UNSIGNED NOT NULL DEFAULT 1`; optimistic conflict token |

Checks require nonblank trimmed name, date at least `1000-01-01`, status in DRAFT/ACTIVE/CLOSED/ARCHIVED, nonblank venue if present, both coordinates absent or both present, latitude within `[-90, 90]`, longitude within `[-180, 180]`, coordinates only with a venue, and positive revision. Lifecycle transitions are enforced by application policy; date does not automatically open/close registration.

Indexes are `idx_activities_status_date (status, activity_date, id)` and `idx_activities_created_by (created_by)`. `fk_activities_created_by` references `users.id`. Volunteers gain `activity_id BIGINT UNSIGNED NULL`, `idx_volunteers_activity_id (activity_id)`, and `fk_volunteers_activity` referencing `activities.id`. Both R2 FKs use `ON DELETE RESTRICT ON UPDATE RESTRICT`, with no cascade deletion. No application hard-delete Activity workflow exists.

`volunteers.activity VARCHAR(150) NOT NULL` remains. Pre-R2 rows keep their historical text and `activity_id = NULL`; no inferred text matching or backfill occurred. New managed submissions store the canonical Activity ID and canonical name snapshot loaded by the server. Later rename preserves the relationship and original stored name. Only the name is snapshotted; Activity date, venue, and coordinates are not Volunteer snapshots.

### Migration 002 and audit successor

`database/migrations/002_activity_management.sql` creates Activities, adds the nullable Volunteer column/index/FK, and expands `audit_logs.chk_audit_event` with `ACTIVITY_CREATED`, `ACTIVITY_UPDATED`, and `ACTIVITY_STATUS_CHANGED`, preserving all R1 events. Its five statements contain no seeds, text matching, historical backfill, or destructive business-data operation. Activity creation audit metadata is NULL; updates allow only changed Activity details and revision information, while status audit records previous/new status and revisions. No Volunteer PII belongs in this metadata.

The runner verifies DATE, exact DECIMAL definitions, relevant defaults, Activity structures, and the exact audit CHECK successor. Arbitrary destructive SQL is rejected. Only the narrowly recognized Migration-002 atomic replacement of `chk_audit_event` permits DROP CHECK syntax; arbitrary DROP is not allowed. Chain checksums, statement checkpoints, and serialized execution remain. Actual MySQL 8.4.11 target acceptance verified both migrations, Migration 002's five completed statements, enforced checks/indexes/FKs, and an unchanged rerun without duplicates. Immediately after migration, Activities remained zero and historical Volunteer stayed unlinked. Full evidence is in [R2 testing](testing.md#ces-portal-v2-r2--activity-management).
