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

## External API integration for IT305

**Status: ACADEMIC REQUIREMENT / IMPLEMENTATION DECISION PENDING**

Teacher guidance calls for meaningful API integration in the IT305 system project. This academic/course requirement is separate from CES stakeholder functional requirements. Integration should support an existing CES workflow. Do not build a separate backend merely to satisfy it; an external API integration does not require an unnecessary internal API layer.

External QR-code generation for a future Volunteer Signup poster workflow is the current candidate. Exact provider selection remains **PENDING** evaluation and approval. No provider has been selected and no integration has been implemented.
