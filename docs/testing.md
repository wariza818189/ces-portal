# Testing

The latest acceptance is [Post-MVP UI/UX redesign — final integrated UI acceptance](#post-mvp-uiux-redesign--final-integrated-ui-acceptance). Earlier sections record historical results, including controlled rows and cash total `125.25`; they do not assert that those rows are still present. UI-5 operator snapshots measured zero rows and cash total `0.00`. The documentation does not infer why the local database state changed.

# Previously Verified Before Account Migration — Historical Evidence

The project handoff records successful pre-migration evidence for:

- Git inspection/audit and diff checks.
- TypeScript no-emit check.
- Goods validation boundary harness.
- `npm run lint` in Codex execution.
- Host production build.

These are historical results from before account migration; they were not rerun during the current documentation pass.

## Historical Phase 2A runtime acceptance — PASS WITH NOTES

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

## Historical Phase 2B runtime acceptance — PASS WITH NOTES

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

Phase 2B remains **PASS WITH NOTES**. Its checkpoint, `e2ed677d31960f47d28afb4d691b8608f330ce26` (`feat: complete Cash Donation phase 2B`), has been committed and pushed to `origin/main`. No further Phase 2B database write is required.

## Historical Inventory runtime acceptance — PASS WITH NOTES

- Integrated browser acceptance passed. At a 1280px desktop viewport, the Inventory table was usable. At a 375px narrow viewport, the labelled-card layout was usable without horizontal overflow.
- The Goods record present during that historical acceptance displayed category Canned, quantity/unit `1.25 pcs`, date received `2026-10-01`, expiry `2026-12-01`, and status Fresh. Application date during acceptance was `2026-10-03`.
- All and Canned filters showed the row. Rice showed a clear no-match state. Invalid category input safely resolved to All.
- Practical keyboard operation of the filter passed, with no obvious keyboard trap. No relevant browser console or runtime errors were observed. This was practical accessibility testing, not a full WCAG audit.
- Goods and Cash forms still rendered during regression checks; neither form was submitted. No runtime correction was required.
- Database read acceptance passed. Counts remained Goods `1 → 1`, Cash `1 → 1`, Volunteers `0 → 0`; zero database writes were performed.
- Expiry helper harness: 27 checks passed. Mocked Inventory renderer harness: 10 checks passed. TypeScript, lint, webpack production build, and `git diff --check` passed.
- The application used port `3002` because other development servers occupied lower ports. This was an environment note, not an application issue.

Inventory runtime acceptance is **PASS WITH NOTES**. Its feature checkpoint, `edc6eeba85bfe057c92159554a8794586ef1f735` (`feat: complete Inventory`), is committed and pushed to `origin/main`. Documentation synchronization is complete. No further database write is required for Inventory acceptance.

## Historical Dashboard runtime acceptance — PASS

- Dashboard displayed Goods Records `1`, Cash Donation Total `125.25`, Volunteer Submissions `0`, Fresh `1`, Expiring soon `0`, and Expired `0`. Application date was `2026-10-03`; no currency identifier was shown.
- Desktop at 1280px and narrow at 375px passed without horizontal overflow. Practical keyboard checks passed; no relevant browser console/runtime errors were observed.
- Inventory regression passed. Goods and Cash forms rendered, and neither was submitted.
- Database counts remained Goods `1 → 1`, Cash `1 → 1`, Volunteers `0 → 0`; Cash total stayed `125.25`. Zero database writes were performed; no runtime correction was required.
- The focused formatting, aggregation, empty-result, and malformed-result harness passed 114 checks. TypeScript, lint, webpack production build, and `git diff --check` passed.

Dashboard implementation and runtime acceptance are complete (**PASS**). Its feature checkpoint, `644fceba3822f45d13bad574117c2457cc211b11` (`feat: complete Dashboard`), is committed and pushed to `origin/main`. Dashboard documentation sync `d0137dd8889dac5b3b43ac8f5d692fc1c6cde7cd` (`docs: sync Dashboard completion status`) is committed and pushed to `origin/main`; documentation synchronization is complete. No further database write is required for Dashboard acceptance.

# Historical Volunteer core workflow acceptance — PASS WITH NOTES — SYNTHETIC / LOCAL DEMO ONLY

Volunteer acceptance is restricted to **SYNTHETIC / LOCAL DEMO ONLY**. It does not approve real personal-data collection or public production deployment. The built-in integrated browser was unavailable; actual working-tree application testing used temporary headless Firefox, an environment/tooling note rather than an application defect.

- The public `/volunteer` form displayed the synthetic/local-only warning, approved privacy/use notice, four required fields (Full Name, Course / Year, Contact Number, Activity), and required acknowledgement. Acknowledgement gates submission only and is not stored.
- Focused validation covered required/non-string values, blank-after-trim rejection, trimming surrounding whitespace while preserving internal whitespace, Unicode-aware character counting, and limits of 100 / 100 / 30 / 150 characters. Leading zeroes were preserved. No phone regex or normalization was added.
- Browser invalid attempts for missing values, missing acknowledgement, blank Full Name, and Full Name above 100 characters were rejected with no rows. The browser rejected missing required values/acknowledgement natively; server validation rejected blank and over-limit values. Submitted values and acknowledgement were retained after server failure.
- Successful submission reset the four fields and acknowledgement, showed `Volunteer submission saved successfully.`, and disabled controls while pending. Keyboard traversal reached all four fields, acknowledgement, and submit button. Practical accessibility checks passed; this was not a full WCAG audit.
- Exactly one controlled synthetic row was created: `Synthetic Volunteer Acceptance`, `BSIT 3 - DEMO`, `00000000000`, `CES Volunteer Demo Activity`; generated ID `1`, `created_at` `2026-10-03 13:15:52`. Exactly one matching row was verified during that acceptance, with no duplicate.
- Counts changed Goods `1 → 1`, Cash `1 → 1`, Volunteers `0 → 1`; Cash total stayed `125.25`. Dashboard showed Volunteer Submissions `1`. `/volunteers` displayed the row and timestamp at desktop 1280px and narrow 375px without horizontal overflow. Dashboard, Inventory, and Goods/Cash form rendering regressions passed; neither donation form was submitted.
- Live Volunteer schema matched the expected `utf8mb4` `VARCHAR(100/100/30/150)` fields and generated ID/timestamp. The 141 focused checks, TypeScript, lint, webpack production build, and `git diff --check` passed. No relevant browser console/runtime errors were observed.
- Save/refresh behavior was checked: the action inserts only the four approved fields; after successful persistence, `/volunteers` and `/dashboard` are revalidated, and refresh failure retains success with do-not-resubmit wording. Logging omits submitted data and raw errors.

Volunteer core workflow implementation is **COMPLETE** and runtime acceptance is **PASS WITH NOTES**. Feature checkpoint `fedd5337a9ea2e448bad9aff1d8650f0003b3e82` (`feat: complete Volunteer core workflow`) is committed. Historical acceptance created one controlled synthetic row: Volunteers changed `0 → 1`, Dashboard Volunteer Submissions correctly became `1`, and no duplicate was found. The evidence remains documented; UI-5 measured zero Volunteer rows. No further Volunteer acceptance submission is required. Real-data operation remains blocked pending an approved access-control/deployment design for `/volunteers`; the route remains unauthenticated/unprotected and authentication is outside MVP scope. Acknowledgement is not stored as consent evidence. Retention policy is pending CES/school policy confirmation; no delete workflow exists.

## Final integrated system test — PASS WITH NOTES — SYNTHETIC / LOCAL DEMO ONLY

This system-level regression followed the individual module and QuickChart feature acceptance above. Baseline was `aebfd1bda9b337a63dc33b22980a05c8f56dd83d`; `HEAD` equaled `origin/main` and Git was clean before testing.

- TypeScript and lint passed. The webpack production build passed through the established elevated path after the sandbox TypeScript subprocess restriction. The read-only `node --env-file=.env.local scripts/test-db.mjs` check passed, `ces-mysql` was healthy, and `git diff --check` passed.
- Integrated browser regression passed for `/dashboard`, `/donations/new`, `/inventory`, `/volunteer`, `/volunteers`, and `/volunteers/poster`. Goods and Cash forms were tested with invalid inputs only; Volunteer Signup used a whitespace-only invalid attempt. Values were retained after validation errors. No valid submission was made.
- Dashboard metrics matched the database; Inventory data/status and category filters passed; the existing synthetic Volunteer row and poster link rendered. The poster's provider-unavailable fallback passed with a local mock and displayed the configured direct URL. No new live QuickChart request was made; exact decoded QR correctness is recorded in the earlier QuickChart acceptance above.
- Staff navigation and direct public signup access passed. Desktop and approximately 375px layouts had no horizontal overflow across the six routes. Keyboard traversal and donation tab arrow behavior passed; this was not a WCAG audit.
- No relevant console/runtime errors were observed. Rapid test navigation canceled speculative RSC/prefetch requests and one route request; no other internal application request failed.
- Database before/after was unchanged: Goods `1 → 1`, Cash `1 → 1`, Volunteers `1 → 1`, Cash total `125.25 → 125.25`. Zero database writes.
- Notes: the sandbox blocked DB/Docker access and a TypeScript subprocess; elevated checks succeeded. Physical phone scan and printing were not tested. One Goods row prevented runtime comparison of expiry ordering across multiple rows. The public Volunteer warning clearly communicates synthetic/local use and that real collection/deployment is not approved, though it did not use the poster's exact uppercase label at that historical acceptance. UI-3/UI-5 subsequently verified the exact uppercase public demo label.
- Git remained clean after testing; no application, dependency, schema, or database files changed.

Overall final integrated system-test classification: **PASS WITH NOTES**. No blocking functional defect was found. MVP implementation and system testing are complete for classroom/academic handoff under **SYNTHETIC / LOCAL DEMO ONLY**. Production readiness and real personal-data use are not approved.

## QuickChart Volunteer QR API acceptance — PASS WITH NOTES — SYNTHETIC / LOCAL DEMO ONLY

The static QuickChart integration supports the existing Volunteer Signup poster workflow as the IT305 academic requirement. It does not add a CES stakeholder requirement. No Volunteer form was submitted and no database write occurred.

- Live provider acceptance made a controlled server-side JSON POST to `https://quickchart.io/qr`. QuickChart returned a PNG that passed content-type, signature, size, dimensions, and strict pixel decoding checks. The poster rendered the QR and the direct fallback URL exactly matched the configured target.
- Offline local `jsQR` decoding of the returned image produced exactly `http://localhost:3012/volunteer`. No online decoder was used.
- 126 temporary focused assertions passed for URL configuration validation, mocked provider success/failures, timeout and body cancellation, response bounds/validation, safe reason-code logging, outbound payload, and cache identity/reuse/failure behavior.
- Browser acceptance passed at desktop and approximately 375px: no horizontal overflow, QR visible, direct URL readable and wrapping, and demo warning legible. Print-media checks retained QR, URL, and warning while hiding poster controls and staff navigation. Physical printing was not performed.
- Graceful missing-configuration and mocked provider-unavailable pages passed in a browser. Missing/invalid configuration did not call the provider. Volunteer submission actions were not involved.
- Regression rendering passed for `/volunteer`, `/volunteers` with its existing synthetic row, Dashboard Volunteer Submissions `1`, Inventory, and Goods/Cash donation forms. No form was submitted.
- Database counts and total before/after were unchanged: Goods `1 → 1`, Cash `1 → 1`, Volunteers `1 → 1`, Cash total `125.25 → 125.25`. Zero database writes.
- TypeScript (`npx tsc --noEmit --incremental false`), lint, webpack production build, and `git diff --check` passed. A sandbox build attempt failed in the TypeScript subprocess; the successful webpack production build used the established outside-sandbox path.
- One mistaken build from the repository allowed Next.js to load `.env.local` internally. The file contents were not inspected, printed, modified, copied, or included in evidence. Successful build and live acceptance then used a secret-free temporary copy/process environment. This is an environment note, not a security incident.
- Physical phone scan remains unverified because no second device or confirmed phone-reachable URL was available. The exact decoded payload establishes technical QR correctness; a future demonstration should set `VOLUNTEER_SIGNUP_URL` to a phone-reachable host.

Acceptance classification: **PASS WITH NOTES**. Scope remains **SYNTHETIC / LOCAL DEMO ONLY**. Real personal-information collection and public production deployment are not approved; `/volunteers` remains unauthenticated/unprotected, acknowledgement is not stored as durable consent evidence, and retention remains pending. Feature checkpoint `07c8141792aea8b83ca5b20ed1b19f11507274c6` (`feat: integrate QuickChart Volunteer QR poster`) is committed and pushed to `origin/main`; documentation synchronization is complete.

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — OpenStreetMap venue acceptance

Acceptance classification: **PASS WITH NOTES**. The feature commit is `104f187dd653d76b9175f4673b0208c23eb05a83`, pushed to `origin/main`. Implementation acceptance recorded **367 focused helper/component assertions** and **140 browser assertions** in the technical OSM provider test. Prior responsive evidence passed at **1280px** and **375px** without horizontal overflow; the map is **320px** high and venue text, attribution, and form remained usable.

The operator manually viewed the live configured `/volunteer` page in Firefox and confirmed the heading, **Assumption College of Davao**, OSM tiles, campus-area marker, larger-map link, attribution, and Volunteer form. Codex did not perform a new browser visual inspection during finalization; browser-tool availability remained a nonblocking note. Codex verified local rendered HTML: venue name, HTTPS `www.openstreetmap.org/export/embed.html` with `bbox`, `layer=mapnik`, marker `7.08819,125.6242`, a larger-map URL with the same coordinates and no credentials, form fields, and attribution. Source review confirmed configuration-only URLs, no Volunteer field/ID/timestamp in URLs, no API key, no Google Maps implementation, and no package, schema, persistence, or QuickChart change.

Finalization passed `npx tsc --noEmit --incremental false`, `npm run lint`, `npm run build -- --webpack`, and Git diff checks. The webpack build ran in a secret-free isolated copy through the established elevated path after the sandbox blocked its TypeScript subprocess. Read-only HTTP checks returned 200 for `/dashboard`, `/donations/new`, `/inventory`, `/volunteer`, `/volunteers`, and `/volunteers/poster`; the poster used an empty QR destination to avoid a live QuickChart call. No form was submitted. Read-only database before/after: Goods `1 → 1`, Cash `1 → 1`, Volunteers `1 → 1`, Cash total `125.25 → 125.25`. **Zero database writes.** This does not change the **SYNTHETIC / LOCAL DEMO ONLY** boundary.

## POST-MVP UI/UX REDESIGN — FINAL INTEGRATED UI ACCEPTANCE

**Classification: PASS WITH NOTES — FINAL INTEGRATED UI ACCEPTANCE COMPLETE** (2026-10-08). UI-5 was acceptance-only: no defect required correction, no source/feature commit was required, and the working tree/index remained clean at `a461fe01f648db1af9252a32827fd483cb2c3300` with HEAD equal to `origin/main`.

### Accepted implementation checkpoints

All five feature checkpoints were committed and pushed to `origin/main` before UI-5:

| Phase | Commit | Message / accepted scope |
|---|---|---|
| UI-1 | `72393c737d4d398f63cea52d4702eec8572f8d8c` | `feat: add CES UI foundations and staff shell` — semantic Tailwind 4 tokens, responsive staff shell, PageContainer/PageHeader, active routes, skip link, and rendered poster print-shell verification. |
| UI-2A | `d43a50604d6e1c9b1b473016c1b6faf361e71f48` | `feat: redesign read-only staff pages` — Dashboard, Inventory, Volunteer Submissions, Card, StatusBadge, and button/link styles; functional/query/data behavior unchanged. |
| UI-2B | `8b06d91467f439aa5af5b5261a76e04a39190694` | `feat: redesign donation workspace` — Goods/Cash tabs and form presentation; mounted panels, keyboard operation, drafts, exact decimal validation, reset/revision behavior, pending protection, and Server Actions preserved; zero database writes during redesign acceptance. |
| UI-3 | `d50b85ae7626fe36eaa58f36af415cd39ba599fd` | `feat: redesign public volunteer experience` — wider form-first public layout, ~60/40 desktop form/venue composition, form-before-map mobile order, and OSM venue card; privacy, acknowledgement, validation/actions, map configuration/helper, and independence preserved; zero database writes. |
| UI-4 | `a461fe01f648db1af9252a32827fd483cb2c3300` | `feat: polish volunteer QR poster` — hierarchy, controls, fallbacks, responsive layout, and rendered A4 print; QR dimensions, QuickChart behavior, direct URL, and warning preserved. |

### Runtime and responsive matrix

Temporary headless Firefox 157 performed browser checks. Five routes used the operator-started actual local application at `http://127.0.0.1:3000`; the poster used a secret-free isolated production copy with local QR fixtures/mocked responses to avoid live QuickChart generation. Temporary scripts, reports, screenshots, and PDFs stayed outside the repository; no project tooling dependency was added.

| Route | HTTP/render result | Responsive widths checked |
|---|---|---|
| `/dashboard` | 200; actual DB summary | 1440, 1280, 1024, 768, 375px |
| `/donations/new` | 200; Goods/Cash workspace | 1440, 1280, 1024, 768, 375px |
| `/inventory` | 200; actual empty state/filter | 1440, 1280, 1024, 768, 375px |
| `/volunteers` | 200; actual empty state | 1440, 1280, 1024, 768, 375px |
| `/volunteer` | 200; actual configured public experience | 1440, 1280, 1024, 768, 375px |
| `/volunteers/poster` | 200; isolated mocked QR success | 1440, 1280, 1024, 768, 375px |

All **30 route/width checks passed** without unexpected horizontal overflow, clipped content/controls, or severe breakpoint regressions. No application console or hydration errors were observed. Slate/navy styling, hierarchy, surfaces, controls, and semantic feedback remained coherent; staff/public shell separation passed.

- **Staff shell:** 240px sticky desktop sidebar with independent scrolling, responsive content area, two-column mobile navigation, four targets at least 44px, one correct active route with `aria-current="page"` (poster activates Volunteers). Skip link was the first practical keyboard target, became visible, and activated `main-content`; exactly one main landmark per page.
- **Dashboard:** actual Goods Records `0`, Cash Donation Total `0.00`, Volunteer Submissions `0`, Fresh `0`, Expiring soon `0`, Expired `0`. Balanced metrics, exact cash formatting, and text-labelled statuses passed; no fake trends/charts.
- **Inventory:** All, valid category, invalid-category fallback, empty state, and keyboard-operated GET filtering passed. Earlier isolated synthetic UI fixture evidence for populated tables/cards and the distinct no-match state was reused after confirming the relevant page source was unchanged. Fixture data was not database data; no real records were inserted.
- **Volunteer Submissions:** actual empty state, demo warning, read-only wording, and poster secondary action passed; required `prefetch={false}` was preserved. Earlier isolated synthetic long-content/card/table evidence remained valid against unchanged page source, including textual contacts, wrapping, and timestamps. No approval/edit/delete controls were introduced.

### Form and privacy regressions

- **Donation tabs/drafts:** both panels remained mounted; the inactive panel was hidden. ArrowLeft, ArrowRight, Home, End, ARIA selection/control associations, and visible focus passed. Synthetic unsaved Goods and Cash drafts survived repeated tab switches.
- **Goods invalid-only:** eight browser cases rejected: blank quantity, `0`, negative, `1.230`, nonnumeric input, above maximum, future Date Received, and out-of-range Date Received. Inline feedback, error associations, and retained state passed.
- **Cash invalid-only:** ten browser cases rejected: blank, `0`, negative, `1.230`, scientific notation, commas, currency symbol, above maximum, future Date Received, and over-limit Notes. Feedback and state retention passed. No valid Donation submission occurred.
- **Public Volunteer:** desktop form/venue widths were ~60/40; complete mobile form preceded venue. Seven invalid-only cases covered all blank, whitespace-only required input, all four over-limit fields, and unchecked acknowledgement. Associated feedback and typed-value retention passed; Contact Number `000012345` retained its leading zeros after rerender/errors. No valid Volunteer submission occurred.
- **Exact information-use notice verified:** “The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.”
- **Exact acknowledgement verified:** “I understand that the information I provide will be used for CES volunteer registration and activity coordination.” The native checkbox remained required. Source review confirmed acknowledgement is gating-only and unpersisted; **SYNTHETIC / LOCAL DEMO ONLY** wording remained unchanged.

### OpenStreetMap and QR regressions

- **OSM configured state:** Assumption College of Davao, live tiles, campus-area marker, 320px map, larger-map link, attribution, and third-party disclosure were visible. Isolated missing map configuration rendered the page/form with neutral unavailable text, no iframe, and no fake map link.
- **Volunteer/map independence:** iframe `src` and larger-map URL were identical before/after changing all unsaved Volunteer fields and acknowledgement, and after invalid feedback. No Volunteer information entered OSM URLs. Configuration/helper behavior and provider architecture were unchanged.
- **Poster screen:** QR success and temporary-unavailable fallback passed at 1280, 768, and 375px, with controls separate from the centered poster, readable hierarchy, full QR, wrapping URL, and readable warning. Dimensions remained 600×600 source and approximately 280px screen width.
- **Poster print:** fresh Firefox WebDriver BiDi print-to-PDF used A4 portrait, scale 1, 10mm browser margins, no shrink-to-fit, and backgrounds disabled. Success prints from 1280/768/375px and a temporary-unavailable print each remained one page. Poppler rasterization and visual inspection confirmed no clipping/split QR/split warning, no shell/sidebar/mobile navigation/skip link/context header/Back/print guidance, and retained text, applicable direct URL, and warning. PDF QR area measured 74mm square.
- **QR decode:** the accepted cached/local success fixture and rasterized printed QR decoded offline exactly to its configured synthetic URL, `http://127.0.0.1:3023/volunteer`. This was a presentation/decode regression, not a new live QuickChart provider acceptance. No live QuickChart request or browser-side QuickChart call occurred.

### Reflow and practical accessibility

Automated Firefox shortcuts did not change actual browser zoom. Dashboard, Donations, public Volunteer, and poster screen instead passed **practical equivalent reflow testing** at 640 CSS pixels with DPR 2, representing a 1280-pixel viewport at 200% scale. Content reflowed without critical horizontal scrolling, overlaps, or inaccessible controls. This is equivalent compact/reflow evidence, **not formal 200% browser-zoom or WCAG conformance**.

Keyboard smoke passed staff navigation, skip link, Inventory filtering, Donation tabs/form controls (including native date-input segments), Volunteer fields, acknowledgement/submit, OSM external link, iframe entry/exit, and poster Back/URL links. Visible focus passed on application controls/links and no obvious keyboard trap was found. Headings, labels, text-labelled statuses, warnings, and semantic tables were preserved; populated table/card evidence was reused as identified above. **This was practical accessibility smoke testing, not a formal WCAG audit.**

### Static checks and database integrity

`npx tsc --noEmit --incremental false`, `npm run lint`, `npm run build -- --webpack`, and `git diff --check` passed. The production build used the established secret-free isolated/elevated process; secret-bearing files were not inspected or copied.

Docker socket access was denied. No sudo or DB privilege elevation was used. The operator supplied fresh read-only snapshots before interactive acceptance and after it finished, using the established local Node count/total command; runtime configuration was consumed normally without exposing secrets.

| Measurement | Before | After |
|---|---|---|
| Goods | `0` | `0` |
| Cash | `0` | `0` |
| Volunteers | `0` | `0` |
| Cash total | `0.00` | `0.00` |

**Before == after; ZERO DATABASE WRITES.** No valid acceptance submissions, seed records, or schema changes occurred. These are current UI-5 measurements, separate from earlier historical controlled-row tests. No reason for the local database-state difference is inferred. UI-5 ended with a clean working tree/index and no source correction or feature commit.

### Remaining notes and deployment boundary

Physical printer output and second-device phone QR scanning remain untested. Populated states used prior isolated synthetic UI fixtures; zoom evidence was equivalent reflow rather than actual browser zoom, and accessibility was practical smoke testing. These notes do not block academic/classroom demo readiness.

The project remains **SYNTHETIC / LOCAL DEMO ONLY**: real personal-information collection and public production deployment are unapproved; `/volunteers` remains unauthenticated/unprotected, authentication is outside MVP, acknowledgement is not durable consent evidence, and retention policy awaits CES/school confirmation. UI polish does not change these boundaries.

## Ongoing regression coverage

Repeat relevant route, responsive, keyboard, and behavior checks after future authorized changes. Optional operator follow-ups remain physical printing and second-device scanning with a phone-reachable demo URL.
