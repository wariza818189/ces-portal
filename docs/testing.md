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

## Current Phase 2B runtime acceptance — PASS WITH NOTES

- The integrated browser tested `http://localhost:3001/donations/new` because port `3000` was occupied by an older local server. This was an environment/process note, not an application defect.
- Goods was selected initially, its fields rendered, it remained usable, and its unsaved draft survived tab switching. No Goods record was submitted.
- Cash showed Amount, Date Received, optional Notes, and Save Cash Donation. Cash and Goods drafts survived tab switching. Pending state showed `Saving...` and disabled the controls. The inactive panel was excluded from normal keyboard navigation.
- Missing required values, amount `0`, `1.234`, `10000000000`, future received date, and notes longer than 255 characters were rejected. These invalid attempts created no Cash rows. Entered Cash values remained after server validation failures.
- Practical keyboard and accessibility acceptance passed, including tab navigation, field labels, error associations, and perceptible status feedback. This was not a full WCAG audit. No relevant runtime or console errors were observed.
- Exactly one valid Cash Donation submission was made: amount `125.25`, date `2026-10-03`, entered notes `  Phase 2B cash acceptance 2026-10-03  `. Browser success message: `Cash donation saved successfully.` Cash fields reset after success.
- Counts before/after were Goods `1 → 1`, Cash `0 → 1`, Volunteers `0 → 0`. Exactly one matching row persisted with generated ID `1`, exact amount `125.25`, date `2026-10-03`, notes `Phase 2B cash acceptance 2026-10-03`, and `created_at`; no duplicate was found.
- The live schema matched `amount DECIMAL(12,2) UNSIGNED NOT NULL`, `date_received DATE NOT NULL`, nullable `notes VARCHAR(255)`, generated ID and timestamp, and the enforced `amount > 0` check.
- Amount validation harness covered accepted `0.01`, `1`, `1.2`, `1.23`, `125.25`, `9999999999.99`, whitespace trimming and normalization; it rejected empty, zero, negative, excess precision (including `1.230`), over-maximum, scientific notation, commas, currency symbols, and malformed decimals. Date, notes and focused Goods regression checks passed. Total: 48 checks.
- TypeScript, lint, webpack production build, and `git diff --check` passed. No additional database write was performed during this documentation sync.
- Duplicate safety: code separates INSERT from `/dashboard` revalidation; a refresh failure after persistence still returns saved success and says not to resubmit. Runtime evidence showed one submission, a `+1` Cash count delta, and exactly one matching row.

Phase 2B checkpoint is pending review. No further Cash acceptance write is needed.

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
