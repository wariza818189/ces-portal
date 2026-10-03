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

## Future external API integration

- API keys and provider credentials must stay server-side.
- Never expose credentials in Client Components, client bundles, commits, documentation, screenshots, or prompts.
- Validate external API responses where applicable.
- When an external API is implemented, use bounded timeouts and handle errors without leaking credentials or sensitive data.

No external provider or credential has been selected or configured.
