# Business Workflows

These descriptions separate intended stakeholder workflows from current implementation. Physical CES operations remain the responsibility of CES participants; the portal records information about those activities.

## Goods Donation

Staff receive, segregate, and count donated goods physically, then record category, quantity, unit, date received, and expiry date in the Goods form. The Phase 2A form and save action are implemented, runtime accepted as PASS WITH NOTES, and checkpointed. Expiry earlier than date received remains allowed; the optional warning is not required for acceptance.

## Cash Donation

Cash Donation is confirmed stakeholder scope and has a separate database table. Physical/event cash is manually counted outside the system; CES Staff records the final counted amount, date received, and notes, and the system stores the record. The confirmed Dashboard includes the running cash donation total. The Phase 2B form and save action are implemented and runtime accepted as PASS WITH NOTES; its checkpoint is committed and pushed. No additional validation rules are inferred.

## Inventory and expiry

CES Staff Inventory view is confirmed to show recorded goods, filter by category, support useful search where appropriate, sort by expiry date soonest first, and clearly expose expiry status. Its read-only implementation and runtime acceptance are complete (**PASS WITH NOTES**); checkpoint `edc6eeba85bfe057c92159554a8794586ef1f735` is committed and pushed to `origin/main`. It uses the same reusable derived expiry logic as the Dashboard: before today is expired; today through seven days ahead is expiring soon; later is fresh. Unlike Goods units are never summed into one quantity.

## Dashboard

The confirmed Dashboard metrics are goods record count, running cash donation total, volunteer submission count, and expiry summary (fresh, expiring soon, expired). The read-only implementation and runtime acceptance are complete (**PASS**); feature checkpoint `644fceba3822f45d13bad574117c2457cc211b11` is committed and pushed to `origin/main`. Dashboard documentation sync `d0137dd8889dac5b3b43ac8f5d692fc1c6cde7cd` is also committed and pushed; documentation synchronization is complete. Cash total is displayed without a currency identifier because currency has not been explicitly defined. Expiry status uses the shared derived logic described above. No further Dashboard acceptance write is required.

## Volunteer Signup and submissions

The original MVP confirmed public flow used `/volunteer`: Student Volunteer enters `full_name`, `course_year`, `contact_number`, and `activity`; the system stores the submission with `created_at`; CES Staff / CES Coordinator later views it at `/volunteers` in a read-only view. The form is intended to be mobile-friendly for a poster QR scan. Core workflow implementation is **COMPLETE**, runtime accepted (**PASS WITH NOTES**), and checkpointed at `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`) for **SYNTHETIC / LOCAL DEMO ONLY**. Historical acceptance created exactly one controlled synthetic row without a duplicate; later UI-5 and R1 snapshots are recorded separately in [testing](testing.md). No further Volunteer submission is required. Real personal-information collection and public production deployment are not approved.

Before submission, the public form must display: “The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.” Submission requires acknowledgement: “I understand that the information I provide will be used for CES volunteer registration and activity coordination.” This acknowledgement gates submission only; the current schema does not store consent evidence, and no such schema change is approved.

Contact numbers are used for communication related to the selected CES activity and necessary activity coordination. No unrelated promotional use or sharing beyond authorized CES personnel is defined. At original MVP acceptance, all four fields were required and nonblank after trimming; surrounding whitespace is trimmed and meaningful internal text preserved. Enforce the existing schema limits (100, 100, 30, and 150 characters) without truncation. Keep contact numbers as strings, preserving leading zeros. No phone format, minimum length, course list, capitalization, or phone normalization rule is defined. R2 replaces free-text Activity entry with managed selection; the original text field remains in storage as a name snapshot.

`/volunteers` is now restricted to authenticated active Staff/Admin under v2 R1; broader privacy, retention, deployment, and operational-governance work remains pending. Route grouping alone is not access control. The approved local/synthetic boundary remains; no real-data deployment or deletion workflow is approved.

Original MVP runtime acceptance created exactly one synthetic row, verified its ID and `created_at`, and confirmed that the Dashboard Volunteer submission count reflected it. No further acceptance submission is required.

## QuickChart Volunteer Signup QR poster flow — PASS WITH NOTES — SYNTHETIC / LOCAL DEMO ONLY

The implemented poster workflow is:

```text
Physical poster → QuickChart-generated static QR → /volunteer → form → submission → staff view
```

The QuickChart static QR Code API is the selected provider. Its integration is implemented and runtime accepted as **PASS WITH NOTES**; it supports the IT305 academic external API requirement and the existing Volunteer Signup workflow, rather than adding a CES stakeholder business requirement. `/volunteers/poster` provides the printable poster, and server-only `VOLUNTEER_SIGNUP_URL` supplies the signup destination. Technical acceptance locally decoded the QR payload exactly. A second-device scan remains a nonblocking note because no phone-reachable destination and second device were available. This workflow remains **SYNTHETIC / LOCAL DEMO ONLY**; real personal-information collection and public production deployment are not approved.

## Staff/public boundary and physical work

Staff route group pages are for CES Staff record entry and read-only volunteer submission viewing; the public route group is for Student Volunteer signup. Authentication and roles were outside the original MVP. The later v2 R1 operational expansion now requires active Staff/Admin sign-in for staff pages; approvals and other future workflows remain unimplemented. Physical sorting, counting, storing, and distributing donations happen outside the portal; the system supports record-keeping only.

## CES Portal v2 R1 staff sign-in and donation attribution

Staff use `/login` with project-local credentials, then access the protected workspace. Goods/Cash saves derive `recorded_by` from the verified session and commit an application audit event in the same transaction. Legacy donations retain a NULL actor. Sign Out revokes that browser session. `/volunteer` remains publicly reachable without staff login; `/volunteers/poster` requires staff authentication to prepare the QR poster.

At R1 completion, Staff account-management screens, Activity Management, Donation Records, Distribution, and CSV export were not added. R2 later added Activity Management only. The demo/synthetic wording remains through R1; the operational wording transition is deferred to R6.

## Historical POST-MVP ACADEMIC / DEMO ENHANCEMENT — venue display

The original OSM enhancement showed one configured CES/demo venue, **Assumption College of Davao**, independently of free-text Activity. It sent no form values to OSM and added no signup/assignment workflow. UI-3 later placed the complete form before the venue card on mobile. R2's current Activity-aware venue behavior follows below; the historical acceptance remains in [testing](testing.md#post-mvp-academic--demo-enhancement--openstreetmap-venue-acceptance).

## CES Portal v2 R2 staff Activity workflow

Active ADMIN/STAFF use protected `/activities` to create a Draft, edit Draft/Active details, explicitly activate registration, close/reopen, and archive. Allowed lifecycle:

```text
DRAFT → ACTIVE
DRAFT → ARCHIVED
ACTIVE → CLOSED
CLOSED → ACTIVE
CLOSED → ARCHIVED
ARCHIVED → terminal
```

Activities start DRAFT. ACTIVE details remain editable; CLOSED/ARCHIVED details are read-only. ARCHIVED is terminal and there is no hard delete. Dates are informational and never automatically open/close registration; duplicate names are allowed. Revision checks reject stale edits. Actor and authorization come from the verified session, and each successful mutation commits with its Activity audit.

## Current public managed Volunteer workflow

Student Volunteer opens public `/volunteer`, selects an ACTIVE managed Activity, supplies Full Name, Course / Year, and Contact Number, acknowledges the unchanged use notice, and submits. Past/future ACTIVE Activities remain eligible. The server validates the ID and locks/reads the current Activity `FOR SHARE`, requires ACTIVE, and stores the canonical Activity ID and submission-time name snapshot in the same transaction. A stale page cannot bypass closure; the browser supplies no trusted Activity name.

When no ACTIVE Activity exists, the page displays `No CES volunteer activities are currently open for registration.` There is no free-text fallback. Historical rows retain stored text with NULL links and display **Historical / unlinked** in protected `/volunteers`. Rename preserves linked Volunteers' original names; only the Activity name is snapshotted, not date/venue/coordinates. Access wording now reads **Access is restricted to authenticated active CES staff.** The broader synthetic/demo warning remains.

## Current venue, navigation, QR, and Dashboard behavior

Selected managed Activity venue/location is authoritative: venue plus coordinates shows its OSM map; venue alone shows text without a broken iframe; no venue means no Activity map. Without selection, valid configured `CES_MAP_*` values may show **Configured CES demonstration venue**. Map URLs receive public coordinates/map parameters only, never Volunteer PII, acknowledgement, session/token, or staff actor. No geocoding, API key, or billing is required.

Staff navigation is Dashboard, Donations, Inventory, Activities, Volunteers. Desktop sidebar and visible two-column mobile navigation remain, with five links spanning three narrow-screen rows and no hamburger. Poster remains a Volunteers subaction and QR stays generic `/volunteer`; no per-Activity QR. Dashboard has no Activity count/status metric; Volunteer count includes linked and unlinked rows. R3 Donation Records has not started. **SYNTHETIC / LOCAL DEMO ONLY**, unapproved real-data/public deployment, and unresolved retention/consent evidence remain.
