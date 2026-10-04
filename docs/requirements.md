# Requirements

This document is the authoritative functional-scope record. It separates CES stakeholder-confirmed requirements from the IT305 academic/course requirement and pending decisions. A database table or placeholder page alone does not confirm a functional requirement.

# Stakeholder-Confirmed Requirements

## Problem and purpose

CES needs an organized way to record donation and volunteer information. The portal supports the software record-keeping around CES work; it does not perform or replace physical receiving, sorting, counting, storage, or distribution.

## Actors

- **CES Staff** record donations and use staff Dashboard, Inventory, and Volunteer Submissions views.
- **Student Volunteer** submits the confirmed public Volunteer Signup fields.

## Confirmed MVP modules and workflows

- **Goods Donation:** staff record goods after they have been segregated and counted. The completed Phase 2A form captures category, quantity, unit, date received, and expiry date; runtime acceptance is complete and classified PASS WITH NOTES.
- **Cash Donation:** confirmed workflow is physical/event cash collection, manual cash/coin counting outside the system, staff entry of final counted amount, date received, and notes, then system storage. The Dashboard includes a running cash donation total. The Phase 2B form and save action are implemented and runtime accepted as PASS WITH NOTES; its checkpoint is committed and pushed. No additional Cash validation rules are asserted here.
- **Inventory:** CES Staff view recorded goods, filter by category, search usefully where appropriate, sort by expiry date soonest first, and clearly see expiry status. Read-only implementation and runtime acceptance are complete (**PASS WITH NOTES**); checkpoint `edc6eeba85bfe057c92159554a8794586ef1f735` is committed and pushed to `origin/main`. No free-text search was appropriate for the confirmed Goods fields in this implementation.
- **Dashboard:** show goods record count, running cash donation total, volunteer submission count, and expiry summary of fresh, expiring soon, and expired. Read-only implementation and runtime acceptance are complete (**PASS**); feature checkpoint `644fceba3822f45d13bad574117c2457cc211b11` is committed and pushed to `origin/main`. Dashboard documentation sync `d0137dd8889dac5b3b43ac8f5d692fc1c6cde7cd` is committed and pushed; documentation synchronization is complete. The Cash total is displayed without a currency identifier because currency has not been explicitly defined. No further Dashboard acceptance write is required.
- **Volunteer Signup:** Student Volunteer uses public `/volunteer` to submit `full_name`, `course_year`, `contact_number`, and `activity`; the submission has `created_at`. The form is intended to be mobile-friendly for poster QR scans. Core workflow implementation is **COMPLETE**, runtime accepted (**PASS WITH NOTES**), and checkpointed at `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`) for **SYNTHETIC / LOCAL DEMO ONLY**. Exactly one controlled synthetic acceptance row remains locally; no duplicate exists and no further acceptance submission is required. This does not approve real personal-information collection or public production deployment. No login is required by the stakeholder-approved MVP.
- **Volunteer Submissions:** CES Staff / CES Coordinator use `/volunteers` to view submissions in a read-only view. The staff route has no authentication/access enforcement and is suitable only within the approved local/synthetic demonstration boundary. Real-data operation requires an approved access-control/deployment design.

These are confirmed stakeholder requirements; their confirmation does not imply their implementation is complete.

For Volunteer implementation, all four fields are required and trimmed only around the outside. Maximum lengths matching the database are Full Name 100, Course / Year 100, Contact Number 30, and Activity 150 characters; values are rejected rather than truncated. Contact numbers remain strings. The approved use notice and required acknowledgement appear before submission; acknowledgement is not persisted as consent evidence.

## Confirmed Goods fields and validation

The Phase 2A implementation currently captures:

- Category: `Canned`, `Rice`, `Noodles`, or `Other`.
- Quantity: greater than zero and no greater than `99999999.99`, with at most two decimal places and no silent rounding.
- Unit: `pcs`, `packs`, `boxes`, `kg`, or `sacks`.
- Date received and expiry date: required valid calendar dates in `YYYY-MM-DD` form, from `1000-01-01` through `9999-12-31`.
- Date received cannot be in the future according to the application time zone (`Asia/Manila` by default, configurable with `APP_TIME_ZONE`).
- Past expiry dates are allowed. An expiry date earlier than the received date is accepted with a warning; the record is not rejected for that condition.

These Goods fields and rules are implemented and runtime accepted in Phase 2A. Confirmed requirements elsewhere in this document remain in scope even where implementation is incomplete; only items explicitly labeled pending are unresolved.

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

The **QuickChart static QR Code API** at `https://quickchart.io/qr` is implemented for the Volunteer Signup poster workflow. This provider choice is an academic implementation decision that supports an existing CES workflow; it does not add a stakeholder business requirement. Runtime acceptance is **PASS WITH NOTES** under the existing **SYNTHETIC / LOCAL DEMO ONLY** boundary. A phone scan remains unverified because no phone-reachable demo URL and second device were available. Feature checkpoint `07c8141792aea8b83ca5b20ed1b19f11507274c6` (`feat: integrate QuickChart Volunteer QR poster`) is committed and pushed to `origin/main`; implementation and documentation synchronization are complete.

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — configured venue map

The accepted classroom enhancement shows one configured public CES/demo venue on `/volunteer`, currently **Assumption College of Davao**, using OpenStreetMap. It is independent of the Volunteer Activity field and adds no Volunteer data collection or database/schema change. This is separate from stakeholder-confirmed MVP scope and from the QuickChart external API integration. The map is a third-party browser iframe integration and requires no API key or billing account. Feature commit `104f187dd653d76b9175f4673b0208c23eb05a83` is pushed and acceptance is **PASS WITH NOTES** under **SYNTHETIC / LOCAL DEMO ONLY**.

# Pending / Future Decisions

- Retention policy pending CES/school policy confirmation. No retention duration or software deletion workflow is defined in this MVP.
- Real-data operation pending an approved access-control/deployment design for the staff submissions route. Staff route grouping does not provide protection; authentication remains outside MVP scope.
- OSA scope requires a separate stakeholder interview.
- Define only implementation details not specified by confirmed workflows; do not add unapproved validation or features.
- Any stakeholder scope change must be formally approved and recorded before implementation.
