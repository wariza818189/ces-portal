# Testing

# Previously Verified Before Account Migration — Historical Evidence

The project handoff records successful pre-migration evidence for:

- Git inspection/audit and diff checks.
- TypeScript no-emit check.
- Goods validation boundary harness.
- `npm run lint` in Codex execution.
- Host production build.

These are historical results from before account migration; they were not rerun during the current documentation pass.

# Verified During Current Documentation / Repository Inspection

- Read-only inspection confirmed the branch, HEAD, remote baseline, documentation, App Router paths, schema/database helper, package scripts, and preserved Phase 2A dirty paths.
- No lint, build, TypeScript check, browser test, validation harness, or database operation was run during this documentation correction pass.

# Pending / Planned

## Phase 2A runtime acceptance

Before the Phase 2A checkpoint, complete and record evidence for:

- Localhost browser verification of the Goods donation page and submit flow.
- Invalid-input UI behavior and server-side rejection.
- Form input retention after validation/save errors and clearing after success.
- Keyboard navigation, labels, focus, error announcements, and accessibility behavior.
- One controlled valid Goods Donation insert against the intended local database.
- Direct MySQL inspection confirming the persisted row and expected table row-count change.
- Duplicate-safety confirmation: an uncertain save must not be resubmitted blindly; verify the existing result first.
- Final diff review before the Phase 2A checkpoint commit (which requires authorization).
- Phase 2A feature checkpoint commit after acceptance (requires authorization).

`npm run lint` and `npm run build` are available. `scripts/test-db.mjs` is a database connectivity/row-count check and requires configured local credentials; it is not a UI or migration test. No dedicated unit-test script is currently defined.

## Other planned coverage

- Validation cases for valid and invalid category, quantity greater than zero and at most `99999999.99`, two-decimal precision with no silent rounding, units, dates from `1000-01-01` through `9999-12-31`, future received-date rejection in `Asia/Manila` application time, allowed past expiry dates, and expiry-before-received warning behavior.
- Database persistence and error-path checks.
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
