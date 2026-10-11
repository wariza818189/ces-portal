# CES Portal

**Community Extension Services (CES) Donation and Volunteer Management Portal** is an IT305 — Integrative Programming and Technologies school mini-project. It is intended to help CES staff keep donation and volunteer records organized. It supports record-keeping for CES activities; it does not replace the physical work of receiving, sorting, counting, or distributing donations.

## Problem and purpose

Donation and volunteer information can be difficult to organize when records are handled manually. CES Portal is a small, centralized application for those records. The MVP scope is based on stakeholder-confirmed requirements; implementation status and pending decisions are tracked in the project documentation.

## MVP modules and actors

The stakeholder-confirmed MVP includes Dashboard, Add Donation (Goods and Cash), Inventory, Volunteer Submissions, and public Volunteer Signup. The actors are CES Staff and Student Volunteer. Current implementation status is tracked in [PROJECT_STATUS.md](PROJECT_STATUS.md); the authoritative functional-scope record is [docs/requirements.md](docs/requirements.md).

The MVP, QuickChart Volunteer QR academic integration, and optional OpenStreetMap venue enhancement are implemented and accepted for **SYNTHETIC / LOCAL DEMO ONLY**. The **Post-MVP UI/UX redesign (UI-1 through UI-5) is complete**, with final integrated UI acceptance **PASS WITH NOTES**. The latest redesign feature checkpoint is `a461fe01f648db1af9252a32827fd483cb2c3300`; UI-5 required no source correction. The project is ready for classroom/local demonstration, with detailed acceptance history and remaining test notes in [docs/testing.md](docs/testing.md).

**CES Portal v2 R1 Authentication, Authorization, and Audit Foundation is complete**, accepted **PASS WITH NOTES** on MySQL `8.4.11` (`ces_portal`), and checkpointed at `3c1e9ec9b4d44d8cce8243efe0b548f418fd010f`. This operational expansion follows the original MVP, which excluded authentication. Active staff must sign in for `/dashboard`, `/donations/new`, `/inventory`, `/activities`, `/volunteers`, and `/volunteers/poster`; `/login` and `/volunteer` remain public.

**CES Portal v2 R2 Activity Management is complete**, classified **PASS WITH NOTES — R2 TARGET MYSQL 8.4 ACCEPTANCE COMPLETE**, at source checkpoint `7a0ea4e859b35a0e3b404f2ccecabe93435fcc8e` (`feat: add activity management and volunteer linking`). Active ADMIN/STAFF manage Activities at `/activities`; public `/volunteer` selects ACTIVE managed Activities and stores a nullable relationship plus submission-time Activity-name snapshot. Staff navigation is Dashboard, Donations, Inventory, Activities, Volunteers. R3 has not started.

Real personal-information collection and public production deployment remain **unapproved**. Volunteer acknowledgement is not stored as durable consent evidence; retention, deployment hardening, account lifecycle, and operating procedures remain pending. Demo/synthetic UI wording is intentionally retained through R2; its operational transition is deferred to R6. The latest R2 target snapshot is Goods `1`, Cash `1`, Volunteers `2`, Cash total `0.01`, Activities `1`, retaining one controlled Archived Activity and its linked synthetic Volunteer. The historical R1 snapshot remains in [testing](docs/testing.md). Historical UI-5 zero-row measurements remain in [testing](docs/testing.md); no cause of the intervening state difference is inferred.

## Technology and architecture

- Next.js 16 App Router, React, and TypeScript
- Tailwind CSS
- npm
- Zod validation
- `mysql2/promise` for server-side MySQL access
- MySQL 8.4 in Docker Compose for local development

Pages use Server Components by default. Client Components are used when browser interaction is needed. Internal mutations use Next.js Server Actions, with Zod validation and parameterized SQL. Data is stored in MySQL. An academic external API integration may support an existing workflow; it does not require a separate Express service or an unnecessary internal REST API layer.

## Local setup

1. Install Node.js and npm, then install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set local database connection values and `VOLUNTEER_SIGNUP_URL` to the absolute demo signup URL ending in `/volunteer` (or `/volunteer/`). For a phone-scan demonstration, configure a phone-reachable host. Copy `.env.docker.example` to `.env.docker` and set local-only MySQL container values. These files contain secrets and must not be committed or pasted into logs or documentation. Do not use real credentials in examples.
3. Start the local MySQL service with `docker compose --env-file .env.docker up -d`.
4. Confirm the intended local target and a verified backup before schema changes. Follow the fresh/existing installation paths below.
5. Bootstrap the initial Admin explicitly in an interactive terminal (hidden password entry, no default credential):

   ```bash
   node --env-file=.env.local scripts/bootstrap-admin.mjs
   ```

   This is initial setup only; it refuses if any Admin already exists. There is no browser registration/setup endpoint.
6. Start Next.js with `npm run dev`, open `http://localhost:3000/login`, and sign in. Public Volunteer Signup remains at `/volunteer`.

### Fresh installation

Apply `database/schema.sql` using your operator MySQL client, then run the migration runner below to verify the current R2 structures and record the Migration 001/002 checksums before bootstrap.

### Existing installation

Preserve the business tables and records; run the numbered migrations (001 and 002) instead of reapplying the fresh schema:

```bash
node --env-file=.env.local scripts/migrate.mjs --database ces_portal
```

The explicit database argument must match `DB_NAME`. See [migration and bootstrap guidance](database/migrations/README.md) for privileges, rerun/checkpoint recovery, and isolated test setup. The app does not migrate automatically.

Compose binds host port `3307` to container port `3306` on loopback (`127.0.0.1`). The named volume persists local database data. Database setup and project safety guidance are in [docs/security.md](docs/security.md) and [docs/database-design.md](docs/database-design.md).

## Development commands

```bash
npm run dev       # development server
npm run lint      # ESLint
npm run build     # production build
npm run start     # serve a production build
```

`node scripts/test-db.mjs` checks database connectivity and reports table row counts; it requires configured local database access. See [docs/testing.md](docs/testing.md) for verified and pending checks.

## Project workflow

Git checkpoints preserve completed work; inspect branch, HEAD, and working-tree changes before editing. Commit and push only when explicitly authorized. The team uses AI-assisted development with ChatGPT for planning and review and Codex CLI/Desktop tools for repository work, following scoped prompts, human review, and targeted verification. See [docs/codex-workflow.md](docs/codex-workflow.md).

## Documentation

- [Project status](PROJECT_STATUS.md) — the single authoritative current-status tracker
- [Requirements](docs/requirements.md) — stakeholder-confirmed scope, academic requirement, and pending decisions
- [Architecture](docs/architecture.md)
- [Database design](docs/database-design.md)
- [Business workflows](docs/business-workflows.md)
- [Security](docs/security.md)
- [Testing](docs/testing.md)
- [Decisions](docs/decisions.md)
- [Codex workflow](docs/codex-workflow.md)
- [Agent instructions](AGENTS.md)

This is a school mini-project for IT305, not a claim of a production-ready CES service. R1 staff authentication is established; production readiness and real-data use remain unapproved.

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — venue map

The original OSM enhancement used a configured demonstration venue independent of Volunteer Activity (checkpoint `104f187dd653d76b9175f4673b0208c23eb05a83`, **PASS WITH NOTES**). Current R2 uses the selected managed Activity's stored venue/location: coordinates with venue show its OSM map, venue alone shows text, and no venue shows no Activity map. Without selection, valid `CES_MAP_VENUE_NAME`, `CES_MAP_LATITUDE`, and `CES_MAP_LONGITUDE` configuration may appear as **Configured CES demonstration venue**. It is not the location of a managed Activity. OSM receives public coordinates/map parameters only, requires no geocoding, API key, or billing, and shows attribution. QuickChart QR remains generic `/volunteer`. The **SYNTHETIC / LOCAL DEMO ONLY** boundary remains.
