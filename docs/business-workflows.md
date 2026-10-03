# Business Workflows

These descriptions separate intended stakeholder workflows from current implementation. Physical CES operations remain the responsibility of CES participants; the portal records information about those activities.

## Goods Donation

Staff receive, segregate, and count donated goods physically, then record category, quantity, unit, date received, and expiry date in the Goods form. The Phase 2A form and save action are implemented, runtime accepted as PASS WITH NOTES, and checkpointed. Expiry earlier than date received remains allowed; the optional warning is not required for acceptance.

## Cash Donation

Cash Donation is confirmed stakeholder scope and has a separate database table. Physical/event cash is manually counted outside the system; CES Staff records the final counted amount, date received, and notes, and the system stores the record. The confirmed Dashboard includes the running cash donation total. The current page displays a disabled Cash option, so implementation remains incomplete. No additional validation rules are inferred.

## Inventory and expiry

CES Staff Inventory view is confirmed to show recorded goods, filter by category, support useful search where appropriate, sort by expiry date soonest first, and clearly expose expiry status. The page remains a placeholder and is not database-backed. It uses the same reusable derived expiry logic as the Dashboard: before today is expired; today through seven days ahead is expiring soon; later is fresh. Unlike Goods units are never summed into one quantity.

## Dashboard

The confirmed Dashboard metrics are goods record count, running cash donation total, volunteer submission count, and expiry summary (fresh, expiring soon, expired). Current values/content are placeholders, not database-backed. Expiry status uses the shared derived logic described above.

## Volunteer Signup and submissions

The confirmed public flow uses `/volunteer`: Student Volunteer enters `full_name`, `course_year`, `contact_number`, and `activity`; the system stores the submission with `created_at`; CES Staff later views it at `/volunteers` in a read-only view. The form is intended to be mobile-friendly for a poster QR scan. The public route and staff view are currently placeholders; form submission and database-backed viewing are incomplete. The MVP does not require login for the public flow.

## Planned QR poster flow

The confirmed intended poster flow is:

```text
Physical poster → QR code → /volunteer → form → submission → staff view
```

The QR poster/signup workflow is confirmed; integration with an external QR-code generation API is not implemented. QR generation remains a candidate for the IT305 academic/course requirement, not a selected provider. Exact API/provider selection is pending.

## Staff/public boundary and physical work

Staff route group pages are for CES Staff record entry and read-only volunteer submission viewing; the public route group is for Student Volunteer signup. Login/authentication, roles, approvals, and other unapproved workflows are outside the current MVP. Physical sorting, counting, storing, and distributing donations happen outside the portal; the system supports record-keeping only.
