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

`/volunteers` is now restricted to authenticated active Staff/Admin under CES Portal v2 R1. Authentication was excluded from the original MVP; R1 is a later operational expansion. Route grouping alone is not access control: server verification now protects staff pages and Goods/Cash actions. This improvement does not approve real personal-data collection or production deployment; broader privacy, retention, deployment, and operating controls remain pending.

Retention policy pending CES/school policy confirmation. The MVP has no defined retention duration and no approved delete feature. If durable consent evidence or a retention/deletion workflow is later required, it needs a separate requirements and schema/scope decision.

## CES Portal v2 R1 authentication and authorization

Project-local staff passwords use Argon2id with fresh salts (`memoryCost=19456`, `timeCost=2`, `parallelism=1`, 32-byte hash). Passwords are preserved without trimming and require 12–128 Unicode characters. Canonical usernames are trimmed lowercase ASCII identifiers, 1–64 characters, beginning with an alphanumeric character and allowing dot, underscore, and hyphen. No plaintext password is persisted or logged.

Each successful login generates a random 32-byte opaque token. Only its SHA-256 digest is stored in `staff_sessions`; the raw token is carried in the session cookie. The cookie is HttpOnly, SameSite=Lax, host-only (no Domain), path `/`, and Secure in production. Production requires HTTPS. Sessions expire absolutely after eight hours; logout deletes the database session and clears the cookie. Server checks require an unexpired session and an active account, and unknown roles fail closed. R1 uses no JWT, client-only auth state, or general auth framework.

| Boundary | Current behavior |
|---|---|
| Staff pages | `/dashboard`, `/donations/new`, `/inventory`, `/volunteers`, `/volunteers/poster` require authenticated active `ADMIN` or `STAFF`. |
| Public pages | `/login` and `/volunteer` remain public. |
| Goods/Cash actions | Independently require active staff; derive the actor from the verified session, never submitted actor fields; recheck and lock session/user in the write transaction. |
| Layout/navigation | Layout verification supplements individual page and action checks. Hidden links and route grouping are not security boundaries. |

Login failures use a generic message. Shared database throttling allows five failed attempts per canonical identifier in a 15-minute fixed window; identifier keys are hashed and locking prevents stale concurrent increments. Blocked attempts do not repeatedly flood the audit table. This is identifier-based, not source/IP-aware throttling; source/network-aware controls and cleanup remain future hardening.

Initial Admin creation is an explicit operator-run command with hidden password/confirmation input, no password command arguments, no default credential, and no browser registration/setup endpoint. A serialized bootstrap refuses when any Admin exists, including an inactive Admin, and audits creation. The target accepted exactly one active Admin; repeated bootstrap did not create another. Existing-Admin refusal currently occurs after some interactive prompts, a nonblocking UX note. See [operator guidance](../database/migrations/README.md).

## R1 audit and donation attribution

The application audit trail allowlists `ADMIN_BOOTSTRAPPED`, `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILURE`, `AUTH_LOGOUT`, `GOODS_DONATION_CREATED`, and `CASH_DONATION_CREATED`. Donation success inserts and their audits share one transaction; the actor derives from the verified session and is also stored in `recorded_by`. Legacy donation actors remain NULL. Bootstrap and failed-login audit actors are NULL; failure subjects are also NULL.

Audit metadata is NULL in R1. Passwords, password hashes, raw session tokens, login identifiers, Cash notes, Volunteer contacts, and request bodies are excluded. Logging uses safe codes rather than raw driver errors/submitted payloads. This is an application audit trail, not tamper-proof evidence against a database administrator; R5 audit-management functionality is not implemented.

## Remaining operational limits

R1 materially improves security but is not production approval, penetration-test evidence, certification, or a regulatory-compliance claim. Full Staff account lifecycle (creation, deactivate/reactivate, password reset, role changes, last-Admin protection), source/network-aware throttling, session/throttle cleanup, Volunteer retention and durable consent evidence, deployment hardening, formal backup/restore procedures, and audit retention/review remain pending. Later R2–R6 work, including R4 exact-decimal hardening, is not implemented. The UI remains **SYNTHETIC / LOCAL DEMO ONLY** through R1; operational wording transition is deferred to R6.

## QuickChart Volunteer QR integration

QuickChart's static QR endpoint is called server-side with JSON POST. It requires no provider account or API key. The only application-derived value sent is the validated exact `VOLUNTEER_SIGNUP_URL`, alongside fixed QR rendering options. No Volunteer names, course/year, contact numbers, activity, acknowledgement, database rows, cookies, authorization headers, or application credentials are sent. Volunteer submission actions do not call the provider.

The URL must be nonempty, untrimmed, control-character-free, at most 1024 UTF-8 bytes, absolute `http:` or `https:` with hostname, no credentials, query, or fragment, and exactly `/volunteer` or `/volunteer/`. HTTP and classroom/private/local hostnames and addresses are allowed. Invalid/missing values do not trigger a provider request.

The endpoint is fixed; redirects are rejected. The operation has a five-second timeout and the streamed body is limited to 512 KiB. The server requires a successful PNG response, validates its signature and exact 600×600 single-image dimensions, and decodes pixels using `sharp`. Safe reason codes are logged without the destination or provider error. Only successfully validated images are cached for 24 hours. No image is stored in MySQL or the application filesystem.

The integration remains **SYNTHETIC / LOCAL DEMO ONLY**. Real personal-information collection and public production deployment are not approved. `/volunteers` is protected by R1 staff authorization; broader operational readiness remains pending. The Volunteer acknowledgement is not durable consent evidence. Retention policy remains pending and no delete workflow is approved.

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — OpenStreetMap boundary

The public `/volunteer` page embeds `www.openstreetmap.org` in a browser iframe. Loading it connects the visitor's browser to that third-party service; attribution is shown. Only the configured public venue coordinates enter the map URLs. Full Name, Course / Year, Contact Number, Activity, acknowledgement, Volunteer ID, timestamps, database rows, and credentials do not enter them. The current design requires no API key or billing account. The map does not change the **SYNTHETIC / LOCAL DEMO ONLY** deployment boundary: `/volunteers` is protected by R1, real personal-data deployment remains unapproved, retention is unresolved, acknowledgement is not durable consent evidence, and no delete workflow is approved.
