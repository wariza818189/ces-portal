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

The confirmed public flow uses `/volunteer`: Student Volunteer enters `full_name`, `course_year`, `contact_number`, and `activity`; the system stores the submission with `created_at`; CES Staff / CES Coordinator later views it at `/volunteers` in a read-only view. The form is intended to be mobile-friendly for a poster QR scan. Core workflow implementation and runtime testing are approved for a classroom/local demonstration using synthetic data only. Real personal-information collection and public production deployment are not approved.

Before submission, the public form must display: “The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.” Submission requires acknowledgement: “I understand that the information I provide will be used for CES volunteer registration and activity coordination.” This acknowledgement gates submission only; the current schema does not store consent evidence, and no such schema change is approved.

Contact numbers are used for communication related to the selected CES activity and necessary activity coordination. No unrelated promotional use or sharing beyond authorized CES personnel is defined. All four fields are required and nonblank after trimming; surrounding whitespace is trimmed and meaningful internal text preserved. Enforce the existing schema limits (100, 100, 30, and 150 characters) without truncation. Keep contact numbers as strings, preserving leading zeros. No phone format, minimum length, course/activity list, capitalization, or phone normalization rule is defined.

Although intended viewers are CES Staff / CES Coordinator, `/volunteers` has no authentication/access enforcement and is not protected by its staff route group. It is suitable only for the approved local/synthetic demonstration boundary. Real-data operation requires an approved access-control/deployment design. Authentication remains outside the MVP. Retention policy pending CES/school policy confirmation; no deletion feature is approved.

## Planned QR poster flow

The confirmed intended poster flow is:

```text
Physical poster → QR code → /volunteer → form → submission → staff view
```

The QR poster/signup workflow is confirmed; integration with an external QR-code generation API is not implemented. QR generation remains a candidate for the IT305 academic/course requirement, not a selected provider. Exact API/provider selection is pending and remains separate from the core Volunteer workflow.

## Staff/public boundary and physical work

Staff route group pages are for CES Staff record entry and read-only volunteer submission viewing; the public route group is for Student Volunteer signup. Login/authentication, roles, approvals, and other unapproved workflows are outside the current MVP. Physical sorting, counting, storing, and distributing donations happen outside the portal; the system supports record-keeping only.
