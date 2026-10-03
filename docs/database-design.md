# Database Design

## Current schema

The application database is `ces_portal`. The checked-in schema is `database/schema.sql` and defines three independent tables:

| Table | Fields and SQL types | Constraints and indexes |
|---|---|---|
| `goods_donations` | `id BIGINT UNSIGNED AUTO_INCREMENT`; `category VARCHAR(50)`; `quantity DECIMAL(10,2) UNSIGNED`; `unit VARCHAR(20)`; `expiry_date DATE`; `date_received DATE`; `created_at TIMESTAMP` | Primary key; category, quantity, unit, expiry date, received date, and creation time are non-null; unit defaults to `pcs`; quantity check `> 0`; indexes on expiry date and category. |
| `cash_donations` | `id BIGINT UNSIGNED AUTO_INCREMENT`; `amount DECIMAL(12,2) UNSIGNED`; `date_received DATE`; `notes VARCHAR(255)`; `created_at TIMESTAMP` | Primary key; amount, received date, and creation time are non-null; notes is nullable; amount check `> 0`; index on received date. |
| `volunteers` | `id BIGINT UNSIGNED AUTO_INCREMENT`; `full_name VARCHAR(100)`; `course_year VARCHAR(100)`; `contact_number VARCHAR(30)`; `activity VARCHAR(150)`; `created_at TIMESTAMP` | Primary key; all listed fields are non-null; index on creation time. |

No foreign keys or relationships are currently defined. Goods and Cash donations use separate tables because their recorded data differs. The existence of a table does not establish a complete stakeholder-approved workflow.

## Goods quantity and dates

Goods quantity uses `DECIMAL(10,2) UNSIGNED`, allowing at most two fractional decimal places in storage; current validation rejects inputs with more than two places and does not silently round them. The positive-value database check is also present.

`expiry_date` and `date_received` use SQL `DATE`, representing calendar dates rather than instants. The current application validation accepts valid ISO dates from `1000-01-01` through `9999-12-31` and rejects future received dates according to the configured application time zone (`Asia/Manila` by default, configurable with `APP_TIME_ZONE`). Past expiry dates are allowed, and expiry earlier than received date is warned about rather than hard-rejected. `date_received` is the business date goods arrived; `created_at` is the database record creation timestamp.

Expiry status is derived from `expiry_date` at read/display time. There is no expiry-status column in the current schema, avoiding a stored value that can become stale as time passes. Dashboard and Inventory use the same reusable helper and rules: before today is expired; today through seven days ahead is expiring soon; later is fresh.

Goods quantities with different units must not be presented as one summed quantity unless approved unit-conversion rules are defined; `pcs`, `kg`, and other units are not directly additive.

## Current state versus policy

The tables, columns, SQL types, constraints, and indexes above are facts from the current schema. The following are project policy recommendations, not features of the schema: keep calendar dates as SQL `DATE`; derive expiry status; preserve Goods/Cash separation unless an approved design change justifies otherwise; and make schema changes through reviewed, documented SQL migrations or a controlled schema update. No migration framework is currently present.
