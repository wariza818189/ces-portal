# Database Design

## Current schema

The application database is `ces_portal`. `database/schema.sql` defines the fresh R1 application schema; numbered migrations maintain existing installations. The three business tables remain:

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

`database/migrations/001_auth_foundation.sql` adds the four auth/audit tables and donation actor columns/indexes/FKs. The runner creates `schema_migrations`, serializes execution with an advisory lock, verifies checksums and existing structures, checkpoints each statement, and safely verifies/resumes an unchanged rerun. MySQL DDL implicitly commits, so recovery uses checkpoints rather than claiming one atomic migration transaction. No DROP, TRUNCATE, destructive reset, or actor backfill is performed.

For a fresh install, apply `database/schema.sql`, then run the migration tool to verify structures and record its checksum. Existing installations use the migration tool directly after target/backup verification; the app never migrates on startup. See [operator guidance](../database/migrations/README.md). Migration 001 was accepted on actual MySQL `8.4.11`, database `ces_portal`, with status `APPLIED`, 10 checkpointed statements, and a verified rerun; detailed evidence is in [testing](testing.md#ces-portal-v2-r1--authentication-authorization-and-audit-foundation).

Activity Management, Donation Records, Distribution, CSV export, and R4 exact-decimal hardening remain future v2 work; no future Activity/Distribution tables are asserted here.

## Goods quantity and dates

Goods quantity uses `DECIMAL(10,2) UNSIGNED`, allowing at most two fractional decimal places in storage; current validation rejects inputs with more than two places and does not silently round them. The positive-value database check is also present.

`expiry_date` and `date_received` use SQL `DATE`, representing calendar dates rather than instants. The current application validation accepts valid ISO dates from `1000-01-01` through `9999-12-31` and rejects future received dates according to the configured application time zone (`Asia/Manila` by default, configurable with `APP_TIME_ZONE`). Past expiry dates are allowed, and expiry earlier than received date is warned about rather than hard-rejected. `date_received` is the business date goods arrived; `created_at` is the database record creation timestamp.

Expiry status is derived from `expiry_date` at read/display time. There is no expiry-status column in the current schema, avoiding a stored value that can become stale as time passes. Dashboard and Inventory use the same reusable helper and rules: before today is expired; today through seven days ahead is expiring soon; later is fresh.

Goods quantities with different units must not be presented as one summed quantity unless approved unit-conversion rules are defined; `pcs`, `kg`, and other units are not directly additive.

## Current state versus policy

The tables, columns, SQL types, constraints, and indexes above are facts from the current schema. The following are project policy recommendations, not features of the schema: keep calendar dates as SQL `DATE`; derive expiry status; preserve Goods/Cash separation unless an approved design change justifies otherwise; and make schema changes through reviewed, documented SQL migrations or a controlled schema update. R1 now provides the additive migration mechanism described above; migration/operator execution requires explicit target and backup verification.
