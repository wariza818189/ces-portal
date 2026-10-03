<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## CES project instructions

- Repository documentation is the source of truth for stable project context: `PROJECT_STATUS.md` tracks current state, `docs/requirements.md` defines confirmed functional scope, and `docs/codex-workflow.md` defines the working process.
- Treat task prompts as delta instructions by default; read the repository sources first instead of requiring prompts to repeat stable architecture, Git/database safety, scope, or verification rules. Read additional documentation only when relevant to the task.
- If a task materially conflicts with documented state or scope, stop and report the conflict rather than guessing.
- Before substantial work, read `PROJECT_STATUS.md`, `docs/requirements.md`, and `docs/codex-workflow.md`.
- Inspect branch, HEAD, and Git status before editing. Preserve existing unfinished work and the approved scope.
- Distinguish stakeholder-confirmed requirements from academic/course requirements and pending decisions. Stop on unexpected scope expansion.
- Never inspect or expose real secret files or credentials for ordinary development work. Protect Git, database, and Docker state; do not casually destroy or reset them.
- Use parameterized SQL and keep database access server-side. Do not introduce an internal API layer without architectural justification.
- Do not select or implement an external API without approved scope. External API selection or architecture-changing integrations require a scoped plan and approval.
- Run appropriate checks, review the diff, and report exact changes and verification results.
- Stage explicit intended paths; never use `git add .`.
- Never commit or push unless explicitly authorized.
