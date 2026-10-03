# CES Portal

**Community Extension Services (CES) Donation and Volunteer Management Portal** is an IT305 — Integrative Programming and Technologies school mini-project. It is intended to help CES staff keep donation and volunteer records organized. It supports record-keeping for CES activities; it does not replace the physical work of receiving, sorting, counting, or distributing donations.

## Problem and purpose

Donation and volunteer information can be difficult to organize when records are handled manually. CES Portal is being developed as a small, centralized application for those records. The MVP scope is based on stakeholder-confirmed requirements; some modules remain placeholders or are still being implemented.

## MVP modules and actors

The stakeholder-confirmed MVP includes Dashboard, Add Donation (Goods and Cash), Inventory, Volunteer Submissions, and public Volunteer Signup. The actors are CES Staff and Student Volunteer. Current implementation status is tracked in [PROJECT_STATUS.md](PROJECT_STATUS.md); the authoritative functional-scope record is [docs/requirements.md](docs/requirements.md).

Goods Donation implementation corrections are complete, with Phase 2A runtime acceptance pending. Cash Donation, database-backed Inventory and Dashboard, Volunteer Signup, and the read-only staff submission view are confirmed requirements but are not yet implemented. The QR poster flow supports Volunteer Signup; an external QR generation API is only a candidate for the IT305 academic integration requirement, and no provider is selected or integration implemented.

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
2. Copy `.env.example` to `.env.local` and set local database connection values. Copy `.env.docker.example` to `.env.docker` and set local-only MySQL container values. These files contain secrets and must not be committed or pasted into logs or documentation. Do not use real credentials in examples.
3. Start the local MySQL service with `docker compose --env-file .env.docker up -d`.
4. Apply `database/schema.sql` to the configured local database using a MySQL client.
5. Start Next.js with `npm run dev` and open `http://localhost:3000`.

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

This is a school mini-project for IT305, not a claim of a production-ready CES service. Authentication and real-production readiness are not established.
