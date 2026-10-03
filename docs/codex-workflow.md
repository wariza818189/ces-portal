# Codex Workflow

## 1. Purpose

This workflow keeps CES Portal work scoped, reviewable, and safe for a school mini-project. `PROJECT_STATUS.md` is the single authoritative current-status tracker. `docs/requirements.md` owns functional scope; this file owns the AI-assisted development process.

## 2. Cost-First Model Strategy

Use the least expensive model that can reliably perform the task. The project handoff routing baseline is:

| Model | Task routing baseline |
|---|---|
| GPT-6 Luna | Low/Medium for mechanical Git/status work; Medium for documentation and tracker/requirements synchronization; High only for unusually ambiguous documentation or audit work. |
| GPT-6.1 Sol | Medium for normal implementation and database-write, validation-sensitive, or security-sensitive features; High for difficult debugging, architecture ambiguity, or complex refactors; higher reasoning levels only exceptionally. |
| GPT-6 Astra | Exceptional escalation only. |

These are project workflow guidelines, not a guarantee of availability. Verify the actual model and reasoning options at task time. Do not silently substitute models; if the required option is unavailable, state that and use an appropriate approved alternative.

## 3. Prompt Design

**Delta-only prompts are the default.** Repository documentation is the source of truth for stable project context. Prompts should point to `AGENTS.md`, `PROJECT_STATUS.md`, and the relevant requirements, design, and testing documents instead of repeating stable architecture, Git/database safety, scope rules, or project history.

A normal task prompt should mainly specify:

- Goal.
- Task-specific scope.
- New or locked decisions.
- Task-specific protections not already documented.
- Acceptance criteria.
- Requested report.

Read the repository sources first and consult only additional documents relevant to the task. Long self-contained prompts remain appropriate when repository documentation is missing or stale, a critical one-off constraint is not documented, or work is being transferred to an environment that cannot read the repository documentation. Separate confirmed CES requirements from academic/course requirements and pending decisions.

## 4. Standard Compact Prompt Template

```text
Goal: <one concrete outcome>
Context: <relevant status and requirement source>
Scope: <files/features allowed>
Protect: <dirty files, data, secrets, or boundaries>
Decisions: <confirmed facts; list unresolved items as PENDING>
Verify: <specific checks; do not claim unrun checks>
Report: <files changed, results, remaining decisions>
```

## 5. Implementation Workflow

Use this sequence:

```text
inspect → plan → approval → implement → targeted verification → diff review → review → checkpoint → documentation sync → next feature
```

Before editing, read `PROJECT_STATUS.md`, `docs/requirements.md`, and this workflow, then inspect branch, HEAD, and status. Preserve unrelated or unfinished work. Confirm scope before implementation. Run only relevant checks, inspect the resulting diff, report exact changes and evidence, and update documentation when verified status changes. A checkpoint commit and any push require explicit authorization. External API selection or architecture-changing integrations require a scoped plan and approval before implementation.

## 6. Failure Handling

Stop when the repository differs materially from the expected baseline, a task expands beyond approved scope, a check could damage data, or a required decision is unresolved. Report the concrete blocker and safe next step. Do not reset, clean, restore, force, or overwrite user changes to make the task proceed. On failed checks, report the command and relevant output; do not claim success.

## 7. Verification Efficiency

Choose checks that cover the change: lint/build for application edits, focused validation or browser checks for form behavior, and controlled database verification only when authorized and safely configured. Read-only inspection is preferred before stateful checks. Avoid rerunning unchanged checks without reason. Never perform a database write against a shared or uncertain database.

## 8. Token / Usage Efficiency

Use compact prompts and read only relevant files. Ask for structured reports, summarize verified facts once, and reuse the status tracker rather than creating competing summaries. Batch independent read-only inspection; keep edits and stateful operations sequential. Avoid repeated broad repository dumps.

## 9. Reporting Standard

Report baseline, exact changed files, concise rationale, checks actually run and their results, remaining risks or pending decisions, and final Git state. Distinguish implementation from runtime acceptance. Do not claim a test, milestone, API choice, or requirement is complete without evidence.

## 10. Documentation Roles

- `README.md`: teacher/evaluator-facing project introduction, safe setup, and navigation.
- `AGENTS.md`: short, stable instructions for repository agents.
- `PROJECT_STATUS.md`: single authoritative current-status tracker.
- `docs/requirements.md`: stakeholder-confirmed requirements, academic/course requirement, and pending decisions.
- `docs/architecture.md`, `docs/database-design.md`, `docs/business-workflows.md`, `docs/security.md`, and `docs/testing.md`: verified design facts and clearly labeled plans.
- `docs/decisions.md`: concise technical/scope decision log.
- This file: AI-assisted development workflow.

## 11. CES Development Principle

Build only confirmed CES scope, preserve the distinction between stakeholder needs and course requirements, and keep physical CES work separate from software record-keeping. The IT305 academic/course requirement for meaningful API integration should support existing CES functionality and not create unrelated features. No unnecessary internal API layer does not mean no external API integration: an approved external provider may be called from server-side Next.js code while internal mutations continue to use Server Actions.

## 12. Updating This Workflow

Update this document when the team changes its working process or tool roles. Verify model names, availability, and approval behavior against current project tooling before documenting them. Keep project status in `PROJECT_STATUS.md`, functional scope in `docs/requirements.md`, and unresolved decisions explicitly pending.

### Tool roles

- **ChatGPT:** clarify goals, help frame prompts, discuss requirements, and review plans or reported results.
- **Codex CLI:** perform scoped repository inspection and implementation in the terminal workflow, with tool approvals respected.
- **Codex Desktop:** coordinate repository tasks, review diffs, and work through approval-gated changes.
- **Codex Desktop Browser:** inspect browser-visible behavior and perform scoped UI verification when authorized.

Tool availability, model routing, and approval boundaries are determined by the current environment and user authorization. Do not infer permission to write externally, alter persistent data, commit, or push from tool availability.

### Safety boundaries

- **Git:** inspect state first; preserve dirty changes; never commit or push without explicit authorization.
- **Database:** use parameterized SQL; avoid destructive or uncontrolled writes; only perform controlled verification against the intended local database.
- **Secrets:** never print, commit, screenshot, or paste real credentials into prompts or documents.
- **Testing:** run appropriate, scoped checks and report only results actually observed.
