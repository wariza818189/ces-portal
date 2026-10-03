# Security

## Environment and secrets

- `.env.local` holds local Next.js/database configuration; `.env.docker` holds local Compose database initialization values. Both are secret-bearing local files and must not be committed, printed, pasted into prompts, or included in screenshots.
- `.env.example` and `.env.docker.example` are safe templates with placeholders. Keep real credentials out of templates and documentation.
- Review output before sharing it to ensure credentials and submitted personal data are absent.

## Database access and input

Database access stays server-side in `mysql2/promise`; browser components must not receive database credentials or connect directly to MySQL. Use parameterized SQL for all submitted values. Validate mutations on the server, currently with Zod, even when browser controls also validate input.

## Local Docker exposure

The Compose MySQL port is bound to `127.0.0.1:3307`, limiting host exposure to loopback for local development. Do not broaden the binding or alter Docker/database state without explicit scope and review.

## Public and staff routes

The `/volunteer` route is intended to be public, but it currently shows placeholder content and has no implemented submission flow. Staff pages are organized under a staff route group, but route grouping is not access control. Authentication is currently absent; staff routes must not be treated as protected. Authentication and access-control review are required before real production deployment.

## Future external API integration

- API keys and provider credentials must stay server-side.
- Never expose credentials in Client Components, client bundles, commits, documentation, screenshots, or prompts.
- Validate external API responses where applicable.
- When an external API is implemented, use bounded timeouts and handle errors without leaking credentials or sensitive data.

No external provider or credential has been selected or configured.
