# Decisions

Concise record of current technical and scope decisions. Pending items are labeled; this file does not replace the single authoritative current-status tracker, `PROJECT_STATUS.md`.

| Decision | Status and reason |
|---|---|
| Next.js 16 App Router | Current application framework and routing structure. |
| TypeScript | Current application language and strict compiler configuration. |
| Tailwind CSS | Current styling system. |
| MySQL 8.4 via Docker Compose | Local relational database foundation. |
| `mysql2/promise`, without an ORM | Direct server-side SQL access matches the current small project and schema. Use parameterized queries. |
| Server Actions for internal mutations | Keeps internal form writes in the Next.js server boundary without an unnecessary internal REST API layer. |
| Zod for server validation | Validates submitted data at the server boundary. |
| MySQL host port `3307` | Compose maps loopback host `127.0.0.1:3307` to container `3306`. |
| Authentication/login excluded from current MVP | No authentication is implemented or required by the confirmed MVP. Real production deployment would require a separate security decision and controls. |
| No category CRUD table | Current Goods categories are a fixed code constant; no category table or CRUD workflow is present. |
| No expiry-status column | Expiry status is time-derived and should not be persisted as a value that can become stale. |
| Shared expiry classification | Inventory and Dashboard derive expired/expiring soon/fresh from `expiry_date` using one reusable helper; do not duplicate logic. |
| No mixed-unit Goods total | Goods units are not additive without approved conversion rules; use record counts for combined summaries. |
| Goods quantity `DECIMAL(10,2)` | Matches schema precision and validation limit; reject excess precision rather than silently rounding. |
| Volunteer demo deployment boundary | Core Volunteer workflow may be implemented and runtime-tested using synthetic data in a classroom/local demonstration only. Real personal-data collection and production deployment require an approved access-control/deployment design for `/volunteers`; staff route grouping is not protection. Authentication remains outside MVP scope. |
| Volunteer notice and acknowledgement | Show the approved privacy/use notice before public form submission and require the approved acknowledgement. It gates submission only; consent evidence is not stored and no schema change for storage is approved. |
| Volunteer field validation | Require all four fields nonblank after trimming; trim only surrounding whitespace, preserve internal text, enforce schema maxima (100/100/30/150) without truncation, and keep contact number a string. No phone regex, minimum, options list, capitalization, or normalization rules. |
| Volunteer contact use and viewers | Contact number is for communication about the selected CES activity and necessary coordination. Intended viewers: CES Staff / CES Coordinator. No unrelated promotion or sharing beyond authorized CES personnel is defined. |
| Volunteer retention | Retention policy pending CES/school policy confirmation. No duration or delete feature is approved for the MVP. |

## External API integration for IT305

**Status: ACADEMIC REQUIREMENT / IMPLEMENTED — PASS WITH NOTES**

Teacher guidance calls for meaningful API integration in the IT305 system project. This academic/course requirement is separate from CES stakeholder functional requirements. Integration should support an existing CES workflow. Do not build a separate backend merely to satisfy it; an external API integration does not require an unnecessary internal API layer.

QuickChart static QR Code API supports the existing Volunteer Signup poster workflow. This is an academic integration decision, not a new CES stakeholder business requirement. The implementation and runtime acceptance are complete under **SYNTHETIC / LOCAL DEMO ONLY**; feature checkpoint `07c8141792aea8b83ca5b20ed1b19f11507274c6` (`feat: integrate QuickChart Volunteer QR poster`) is committed and pushed to `origin/main`.

| QuickChart static Volunteer QR | Use `https://quickchart.io/qr` with a server-side JSON POST; static PNG rather than dynamic QR or SVG; no provider account or API key; fixed renderer settings; reject redirects; no retry; bounded five-second operation and 512 KiB response; strictly validate/decode via direct `sharp` dependency; cache successful QR results for 24 hours with `unstable_cache` under the current non-Cache-Components architecture; read the exact validated destination from server-only `VOLUNTEER_SIGNUP_URL`; show the direct link when provider generation is unavailable. This flow sends no Volunteer personal data and does not use the database. |

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — venue-map decision

| Decision | Rationale and boundary |
|---|---|
| OpenStreetMap third-party map integration | Show one configured public CES/demo venue on `/volunteer` through an HTTPS OpenStreetMap browser iframe with attribution and larger-map link. Accepted venue: Assumption College of Davao. The venue is independent of Volunteer Activity and sends no Volunteer PII. No API key, billing, database/schema, or persistence change. Google Maps was abandoned before commit because its Cloud/billing setup was unsuitable for this classroom enhancement; no Google Maps source entered Git history. Feature commit `104f187dd653d76b9175f4673b0208c23eb05a83` is pushed; acceptance **PASS WITH NOTES** under **SYNTHETIC / LOCAL DEMO ONLY**. |

## Post-MVP UI/UX redesign — lightweight UI system

| Decision | Rationale and boundary |
|---|---|
| Custom lightweight UI system instead of adopting shadcn/component-library dependency | The existing Tailwind 4 stack was sufficient for semantic tokens and a small set of PageContainer/PageHeader, Card, StatusBadge, button/link, and Donation form helpers. This preserves Server Component architecture and avoids unnecessary dependencies and abstractions. Responsive behavior, keyboard interaction, and focus styles are handled directly, with practical accessibility smoke testing. Separate staff/public presentation layouts and poster-scoped print CSS preserve the existing functional and deployment boundaries. |
