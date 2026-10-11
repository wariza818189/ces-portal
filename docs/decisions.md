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
| Authentication/login excluded from original MVP | Historical scope decision: authentication was not required or implemented in the stakeholder-confirmed MVP. CES Portal v2 R1 later adds the separate operational expansion described below; real-data deployment remains unapproved. |
| No category CRUD table | Current Goods categories are a fixed code constant; no category table or CRUD workflow is present. |
| No expiry-status column | Expiry status is time-derived and should not be persisted as a value that can become stale. |
| Shared expiry classification | Inventory and Dashboard derive expired/expiring soon/fresh from `expiry_date` using one reusable helper; do not duplicate logic. |
| No mixed-unit Goods total | Goods units are not additive without approved conversion rules; use record counts for combined summaries. |
| Goods quantity `DECIMAL(10,2)` | Matches schema precision and validation limit; reject excess precision rather than silently rounding. |
| Volunteer demo deployment boundary | Core Volunteer workflow may be implemented and runtime-tested using synthetic data in a classroom/local demonstration only. Real personal-data collection and production deployment remain unapproved. R1 now protects `/volunteers` through server-side active-staff authorization; privacy, retention, deployment, and operational governance remain pending. Route grouping alone is not protection. |
| Volunteer notice and acknowledgement | Show the approved privacy/use notice before public form submission and require the approved acknowledgement. It gates submission only; consent evidence is not stored and no schema change for storage is approved. |
| Original MVP Volunteer field validation | Historical free-text Activity flow: require all four fields nonblank after trimming; trim only surrounding whitespace, preserve internal text, enforce schema maxima (100/100/30/150) without truncation, and keep contact number a string. No phone regex, minimum, options list, capitalization, or normalization rules. |
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
| Original OpenStreetMap third-party map integration | Historical accepted enhancement: show one configured public CES/demo venue on `/volunteer` through an HTTPS OpenStreetMap browser iframe with attribution and larger-map link. Accepted venue: Assumption College of Davao. The venue is independent of Volunteer Activity and sends no Volunteer PII. No API key, billing, database/schema, or persistence change. Google Maps was abandoned before commit because its Cloud/billing setup was unsuitable for this classroom enhancement; no Google Maps source entered Git history. Feature commit `104f187dd653d76b9175f4673b0208c23eb05a83` is pushed; acceptance **PASS WITH NOTES** under **SYNTHETIC / LOCAL DEMO ONLY**. |

## Post-MVP UI/UX redesign — lightweight UI system

| Decision | Rationale and boundary |
|---|---|
| Custom lightweight UI system instead of adopting shadcn/component-library dependency | The existing Tailwind 4 stack was sufficient for semantic tokens and a small set of PageContainer/PageHeader, Card, StatusBadge, button/link, and Donation form helpers. This preserves Server Component architecture and avoids unnecessary dependencies and abstractions. Responsive behavior, keyboard interaction, and focus styles are handled directly, with practical accessibility smoke testing. Separate staff/public presentation layouts and poster-scoped print CSS preserve the existing functional and deployment boundaries. |

## CES Portal v2 R1 — operational expansion decisions

R1 follows the original MVP and does not retroactively change its stakeholder scope. The source checkpoint is `3c1e9ec9b4d44d8cce8243efe0b548f418fd010f` (`feat: add staff authentication and audit foundation`), accepted **PASS WITH NOTES** on actual MySQL 8.4.11. See [R1 testing](testing.md#ces-portal-v2-r1--authentication-authorization-and-audit-foundation).

| Decision | Rationale and boundary |
|---|---|
| Project-local credentials + opaque database-backed sessions instead of JWT/Auth.js | Fits direct MySQL access and the two current roles, permits immediate session revocation, and avoids unnecessary account/provider/JWT infrastructure. The project accepts responsibility for explicit security implementation and testing. |
| Argon2id password hashing | Fresh salted hashes use the shared approved cost for real, dummy, bootstrap, and test hashes. No default credentials or plaintext password persistence. |
| Server-side authorization | Layout/navigation and route grouping alone are not security boundaries. Staff pages and Goods/Cash actions independently verify active accounts and allowed roles; donation transactions recheck authorization and derive the actor from the session. |
| Transactional donation audit and attribution | Donation plus success audit share one transaction. `recorded_by` records new verified staff actors; legacy actors remain NULL. Sensitive payloads are excluded from the application audit trail. |
| Numbered/checksummed additive migrations | Operational schema evolution uses serialized execution and statement checkpoints because MySQL DDL implicitly commits. Unchanged reruns verify/resume; no destructive reset or historical actor backfill. |
| Demo wording retained through R1 | R1 does not approve real-data production deployment. Operational wording transition is deferred to R6; later modules and R4 exact-decimal hardening remain pending. |

## CES Portal v2 R2 — Activity Management decisions

R2 is a later operational expansion, preserving the original stakeholder-confirmed free-text Activity MVP history. Source checkpoint `7a0ea4e859b35a0e3b404f2ccecabe93435fcc8e` (`feat: add activity management and volunteer linking`) is accepted **PASS WITH NOTES — R2 TARGET MYSQL 8.4 ACCEPTANCE COMPLETE** on actual MySQL 8.4.11. See [R2 testing](testing.md#ces-portal-v2-r2--activity-management).

| Decision | Rationale and boundary |
|---|---|
| Explicit managed Activity lifecycle | Create DRAFT; DRAFT → ACTIVE/ARCHIVED; ACTIVE → CLOSED; CLOSED → ACTIVE/ARCHIVED; ARCHIVED terminal. Draft/Active details editable; Closed/Archived read-only. No hard delete. |
| Status-only registration eligibility | Only ACTIVE is eligible. Date is informational; past/future ACTIVE records remain selectable and no automatic opening/closure occurs. No free-text fallback. |
| Duplicate Activity names allowed | IDs are canonical; names are descriptive rather than unique identifiers. |
| Both ADMIN/STAFF manage Activities | Active authenticated roles may create/edit/transition without creator-only restrictions or a new role. Actor derives from verified session. Account lifecycle remains pending. |
| Nullable Activity relationship + immutable name snapshot | Legacy `activity` text remains with NULL `activity_id`; no automatic historical matching/backfill. New submissions store server-derived canonical ID/name. Later rename preserves submission-time text. Only name is snapshotted. |
| Shared/exclusive locking + revision token | Signup holds `FOR SHARE` through current ACTIVE verification and insert; staff mutation uses `FOR UPDATE`, reauthorization, state/revision checks, and increment. Prevent closure races and stale edits. |
| Transactional Activity audit | Mutation and allowlisted success audit commit together; update/status metadata is restricted and excludes Volunteer PII. This is not a tamper-proof trail. |
| Activity-aware OSM | Selected Activity venue/location is authoritative; venue-only text and no-venue cases omit iframe. Configured map appears only without selection as demonstration context. No Volunteer PII or staff actor enters map URLs. |
| Generic QR preserved | QuickChart continues to target `/volunteer`; no per-Activity QR. |
| Existing Dashboard metrics preserved | No Activity count/status metric. Volunteer count includes historical unlinked and managed linked rows. |
| Narrow Migration-002 audit CHECK successor | Exact known CHECK replacement only, with chain checksums/checkpoints/serialization and DATE/DECIMAL/default/schema verification. Arbitrary destructive SQL remains rejected. |
| Operational boundaries preserved | R2 is not real-data/public deployment approval. R3–R6 and account lifecycle/governance/hardening remain pending; currency must be decided before operational Cash reporting/export. |
