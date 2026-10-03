# Requirements

This document is the authoritative functional-scope record. It separates CES stakeholder-confirmed requirements from the IT305 academic/course requirement and pending decisions. A database table or placeholder page alone does not confirm a functional requirement.

# Stakeholder-Confirmed Requirements

## Problem and purpose

CES needs an organized way to record donation and volunteer information. The portal supports the software record-keeping around CES work; it does not perform or replace physical receiving, sorting, counting, storage, or distribution.

## Actors

- **CES Staff** record donations and use staff Dashboard, Inventory, and Volunteer Submissions views.
- **Student Volunteer** submits the confirmed public Volunteer Signup fields.

## Confirmed MVP modules and workflows

- **Goods Donation:** staff record goods after they have been segregated and counted. The current Phase 2A form captures category, quantity, unit, date received, and expiry date. Its runtime acceptance remains pending.
- **Cash Donation:** confirmed workflow is physical/event cash collection, manual cash/coin counting outside the system, staff entry of final counted amount, date received, and notes, then system storage. The Dashboard includes a running cash donation total. The current Cash option is disabled; implementation is incomplete. No additional Cash validation rules are asserted here.
- **Inventory:** CES Staff view recorded goods, filter by category, search usefully where appropriate, sort by expiry date soonest first, and clearly see expiry status. The current page is a placeholder; implementation is incomplete.
- **Dashboard:** show goods record count, running cash donation total, volunteer submission count, and expiry summary of fresh, expiring soon, and expired. The current page is a placeholder; implementation is incomplete.
- **Volunteer Signup:** Student Volunteer uses public `/volunteer` to submit `full_name`, `course_year`, `contact_number`, and `activity`; the submission has `created_at`. The current route is informational placeholder content; implementation is incomplete. The form is intended to be mobile-friendly for poster QR scans. No login is required by the stakeholder-approved MVP.
- **Volunteer Submissions:** CES Staff use `/volunteers` to view submissions in a read-only view. The current staff page is a placeholder; implementation is incomplete.

These are confirmed stakeholder requirements; their confirmation does not imply their implementation is complete.

## Confirmed Goods fields and validation

The Phase 2A implementation currently captures:

- Category: `Canned`, `Rice`, `Noodles`, or `Other`.
- Quantity: greater than zero and no greater than `99999999.99`, with at most two decimal places and no silent rounding.
- Unit: `pcs`, `packs`, `boxes`, `kg`, or `sacks`.
- Date received and expiry date: required valid calendar dates in `YYYY-MM-DD` form, from `1000-01-01` through `9999-12-31`.
- Date received cannot be in the future according to the application time zone (`Asia/Manila` by default, configurable with `APP_TIME_ZONE`).
- Past expiry dates are allowed. An expiry date earlier than the received date is accepted with a warning; the record is not rejected for that condition.

These Goods fields and rules are part of the implementation currently under Phase 2A runtime acceptance. Confirmed requirements elsewhere in this document remain in scope even where implementation is incomplete; only items explicitly labeled pending are unresolved.

## Date and expiry rules

Goods dates are stored as SQL `DATE` calendar dates. `created_at` records when the database row was created and is distinct from the business date `date_received`. Expiry status is derived from `expiry_date` relative to today and must not be stored as a mutable database column. Inventory and Dashboard use the same centralized reusable helper:

- `expiry_date < today` → **expired**
- `today <= expiry_date <= today + 7 days` → **expiring soon**
- `expiry_date > today + 7 days` → **fresh**

Goods with unlike units must not be combined into one summed quantity. Use record-count wording for combined Goods summaries.

## Explicit MVP exclusions and boundaries

- Physical CES donation operations remain outside the software workflow.
- Authentication/login, users table, roles, admin/super-admin, and multi-office permissions are outside the current MVP.
- OSA module and OSA scheduling are outside the MVP; OSA remains pending a separate stakeholder interview.
- Calendar/scheduling, volunteer approval/rejection, ranking, attendance, and assignment management are outside the current MVP.
- SMS, email, AI features, barcode scanning, automated coin counting, and physical stock counting are outside the current MVP.
- Unrelated reporting, unnecessary analytics, and edit/delete workflows are outside the current MVP unless formally approved later.
- These exclusions do not remove the confirmed QR poster to Volunteer Signup workflow. An external QR API/provider is an academic implementation decision, not a stakeholder functional requirement.

# Academic / Course Requirement

Teacher guidance for the IT305 — Integrative Programming and Technologies system project calls for meaningful API integration. This is an academic/course requirement, not a CES stakeholder business requirement. Integration should support existing CES functionality and should not add unrelated complexity.

Candidate: an external QR-code generation service supporting a future Volunteer Signup poster workflow. This candidate is **PENDING**, not a confirmed provider or implementation. Exact provider and implementation approach remain undecided.

# Pending / Future Decisions

- Resolve consent/privacy details with stakeholders before collecting volunteer information.
- OSA scope requires a separate stakeholder interview.
- Define only implementation details not specified by confirmed workflows; do not add unapproved validation or features.
- Evaluate and select an external QR API/provider only after a scoped plan and approval.
- Any stakeholder scope change must be formally approved and recorded before implementation.
