# Security

## Environment and secrets

- `.env.local` holds local Next.js/database configuration; `.env.docker` holds local Compose database initialization values. Both are secret-bearing local files and must not be committed, printed, pasted into prompts, or included in screenshots.
- `.env.example` and `.env.docker.example` are safe templates with placeholders. Keep real credentials out of templates and documentation.
- Review output before sharing it to ensure credentials and submitted personal data are absent.

## Database access and input

Database access stays server-side in `mysql2/promise`; browser components must not receive database credentials or connect directly to MySQL. Use parameterized SQL for all submitted values. Validate mutations on the server, currently with Zod, even when browser controls also validate input.

## Local Docker exposure

The Compose MySQL port is bound to `127.0.0.1:3307`, limiting host exposure to loopback for local development. Do not broaden the binding or alter Docker/database state without explicit scope and review.

## Volunteer collection and access boundary

Volunteer core workflow may be implemented and runtime-tested for a classroom/local demonstration using synthetic data only. This does not approve collection of real personal information or public production deployment.

The public `/volunteer` form must show this approved notice before submission: “The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.” Require acknowledgement with: “I understand that the information I provide will be used for CES volunteer registration and activity coordination.” The acknowledgement gates submission only. The current schema has no consent-evidence field; no schema change to store consent evidence is approved.

Contact numbers may be used for communication related to the selected CES activity and necessary activity coordination. Do not define unrelated promotional use or sharing outside authorized CES personnel. Volunteer Submissions are intended for CES Staff / CES Coordinator.

Staff pages are organized under a route group, but route grouping is not access control. Authentication is currently absent; `/volunteers` must not be described or treated as protected. It may be used only within the approved local/synthetic demonstration boundary. Real-data operation and production deployment require an approved access-control/deployment design. Authentication remains outside the current MVP and must not be added without a scope decision.

Retention policy pending CES/school policy confirmation. The MVP has no defined retention duration and no approved delete feature. If durable consent evidence or a retention/deletion workflow is later required, it needs a separate requirements and schema/scope decision.

## QuickChart Volunteer QR integration

QuickChart's static QR endpoint is called server-side with JSON POST. It requires no provider account or API key. The only application-derived value sent is the validated exact `VOLUNTEER_SIGNUP_URL`, alongside fixed QR rendering options. No Volunteer names, course/year, contact numbers, activity, acknowledgement, database rows, cookies, authorization headers, or application credentials are sent. Volunteer submission actions do not call the provider.

The URL must be nonempty, untrimmed, control-character-free, at most 1024 UTF-8 bytes, absolute `http:` or `https:` with hostname, no credentials, query, or fragment, and exactly `/volunteer` or `/volunteer/`. HTTP and classroom/private/local hostnames and addresses are allowed. Invalid/missing values do not trigger a provider request.

The endpoint is fixed; redirects are rejected. The operation has a five-second timeout and the streamed body is limited to 512 KiB. The server requires a successful PNG response, validates its signature and exact 600×600 single-image dimensions, and decodes pixels using `sharp`. Safe reason codes are logged without the destination or provider error. Only successfully validated images are cached for 24 hours. No image is stored in MySQL or the application filesystem.

The integration remains **SYNTHETIC / LOCAL DEMO ONLY**. Real personal-information collection and public production deployment are not approved. `/volunteers` remains unauthenticated/unprotected; authentication remains outside the MVP. The Volunteer acknowledgement is not durable consent evidence. Retention policy remains pending and no delete workflow is approved.

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — OpenStreetMap boundary

The public `/volunteer` page embeds `www.openstreetmap.org` in a browser iframe. Loading it connects the visitor's browser to that third-party service; attribution is shown. Only the configured public venue coordinates enter the map URLs. Full Name, Course / Year, Contact Number, Activity, acknowledgement, Volunteer ID, timestamps, database rows, and credentials do not enter them. The current design requires no API key or billing account. The map does not change the **SYNTHETIC / LOCAL DEMO ONLY** deployment boundary: `/volunteers` is unprotected, real personal-data deployment remains unapproved, retention is unresolved, acknowledgement is not durable consent evidence, and no delete workflow is approved.
