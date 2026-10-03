# Testing

# Previously Verified Before Account Migration — Historical Evidence

The project handoff records successful pre-migration evidence for:

- Git inspection/audit and diff checks.
- TypeScript no-emit check.
- Goods validation boundary harness.
- `npm run lint` in Codex execution.
- Host production build.

These are historical results from before account migration; they were not rerun during the current documentation pass.

## Current Phase 2A runtime acceptance — PASS WITH NOTES

Runtime acceptance used the integrated browser and the intended local database. One controlled valid Goods Donation row was persisted; no further database write was performed for this documentation sync.

- The actual integrated page rendered, Goods UI was usable, Cash was disabled, and no relevant runtime or console errors were observed.
- Missing required values, quantity `0`, `1.234`, `100000000`, and a future received date were rejected. Invalid attempts created no rows.
- A narrow correction fixed category and unit resetting after server validation failure. Browser testing after the correction confirmed retention of category, quantity, unit, received date, and expiry date.
- Practical keyboard and accessibility checks passed. This was not a full WCAG audit.
- The single controlled valid submission showed browser success. Goods count changed `0 → 1`; Cash and Volunteer counts remained `0`. Exactly one matching row persisted with the expected category, quantity `1.25` without silent rounding, unit, received date, expiry date, and `created_at`.
- Duplicate-safety semantics were confirmed. Successful reset was observed during the one valid submission before the retention correction; after that correction, the success path was reviewed by code inspection rather than creating another acceptance row.
- `npx tsc --noEmit --incremental false`, `npm run lint`, `npm run build -- --webpack`, and `git diff --check` passed.
- Plain Turbopack `npm run build` encountered an environment-specific local-port `Operation not permitted` restriction. The webpack production build passed; no Phase 2A application defect is inferred from that environment restriction.
- Expiry earlier than received is allowed and is not hard rejected solely for that relationship. The optional warning was not observed after a persisted browser submission. The non-hard-rejection behavior was supported by browser behavior plus focused code inspection; the warning is optional and does not block acceptance.

Phase 2A remains **PASS WITH NOTES**. Its checkpoint, `7a06f983cc9abe302c1ca32262d738a3f1c6d9b7` (`feat: complete Goods Donation phase 2A`), has been committed and pushed to `origin/main`. No further Goods acceptance write is needed for Phase 2A. `npm run lint` and `npm run build` are available. `scripts/test-db.mjs` is a database connectivity/row-count check and requires configured local credentials; it is not a UI or migration test. No dedicated unit-test script is currently defined.

# Pending / Planned

## Other planned coverage

- Browser coverage for confirmed Cash, Inventory, Dashboard, Student Volunteer Signup, and read-only Volunteer Submissions features after implementation.
- Accessibility and responsive-layout review across relevant routes and viewport sizes.
- Regression checks for existing routes and behavior after each scoped feature.

## Future external API testing — FUTURE / PLANNED

Only after an external API/provider is selected and implementation is approved, test:

- Successful provider response.
- Provider error/failure behavior.
- Malformed or unexpected response validation.
- Timeout and network failure behavior.
- Secret non-exposure in browser output, logs, screenshots, and errors.
- Graceful user-facing fallback.
