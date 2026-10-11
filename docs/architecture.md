# Architecture

## Current application structure

CES Portal uses Next.js 16 App Router with TypeScript, React, Tailwind CSS, and npm. Route groups organize the staff and public experiences without adding URL prefixes: `(staff)` contains `/dashboard`, `/donations/new`, `/inventory`, `/activities`, `/volunteers`, and `/volunteers/poster`; `(public)` contains `/login` and `/volunteer`. The root route redirects to `/dashboard`.

Pages and layouts are Server Components by default. Use Client Components only where browser interaction is required; the current Goods form is one example. The authenticated Goods/Cash write path is:

```text
Authenticated browser
→ Next.js Server Action
→ session + role verification
→ Zod validation
→ transaction + authorization recheck
→ parameterized donation + audit inserts
→ MySQL commit
```

The server action and database connection stay on the server. `mysql2/promise` provides the connection pool and SQL access; Zod validates submitted values on the server. There is no separate Express backend, ORM, Redux, or Axios in the current project. A separate ORM, client-state library, or HTTP client is not justified by the current scope. There is no unnecessary internal REST API layer: internal mutations use Server Actions unless a concrete architectural need justifies another boundary.

Inventory and Dashboard expiry labels use one shared date helper and derive status from `expiry_date`; do not persist status or duplicate classification rules. Goods quantities in different units are not additive and must not be shown as one total.

## CES Portal v2 R1 server authentication

R1 is an operational expansion after the original MVP. Its authentication flow is:

```text
Browser
→ login Server Action
→ Argon2id verification
→ staff_sessions (SHA-256 token digest)
→ opaque HttpOnly cookie
→ server-side session verification
→ authorized staff page/action
```

Project-local credentials and opaque database-backed sessions support active `ADMIN` and `STAFF` accounts. Sessions expire absolutely after eight hours. Logout deletes the server-side session and clears the cookie. Login throttling uses shared database buckets, canonical identifier keys, and locking. No JWT, client-only auth state, or general auth framework is used.

The staff layout and each staff page verify the session before protected data/UI access. Goods/Cash actions independently require active staff and recheck/lock session and user inside the write transaction. The actor comes from the verified session, never a submitted actor ID. Donation and success audit either commit together or roll back together. `/volunteer` remains public; R2 now verifies the selected managed Activity and persists its relationship and name snapshot. See [security](security.md) for policy and remaining limits.

## Database and local topology

Docker Compose runs MySQL 8.4 as the local database service. The host binds `127.0.0.1:3307` to container port `3306`; a named Docker volume stores database files, and a health check waits for MySQL readiness. The Next.js server connects using environment configuration and `mysql2/promise`. It is not exposed as a browser-to-database connection.

## Boundaries

- **Browser/client boundary:** browser code handles interactive UI only. Database credentials and direct database access remain server-side.
- **Server Action boundary:** Goods/Cash mutations independently authorize active staff, validate with Zod, recheck authorization in the transaction, and commit donation plus audit with parameterized SQL. Public Volunteer signup validates a managed Activity ID and verifies current ACTIVE status inside its transaction; actions return safe UI results.
- **Database boundary:** `database/schema.sql` defines a fresh R2 installation; existing installations evolve through numbered/checksummed additive migrations. Auth/support tables, nullable donation actors, checkpoint tracking, and migration reruns are described in [database design](database-design.md). Data access uses `mysql2/promise`; migrations are operator-run, never automatic startup behavior.

## External API Integration Boundary

An external API may be integrated to support an approved existing CES workflow and the IT305 academic/course requirement. External API integration does not require replacing Server Actions or creating a separate backend. A future flow may be:

```text
Next.js server-side code
→ approved external API
→ validated response
→ existing application workflow
```

The Volunteer Signup poster uses the QuickChart static QR Code API. The request flow is:

```text
Server Component
→ server-only QR helper
→ QuickChart JSON POST
→ validated PNG
→ poster
```

The helper reads server-only `VOLUNTEER_SIGNUP_URL`, validates it, and sends only that exact destination plus fixed rendering options. It rejects redirects, bounds the operation and response, validates and decodes the PNG with `sharp`, and caches only successful images for 24 hours using `unstable_cache` and a destination/settings digest. The poster has safe missing-configuration and provider-failure states. This flow does not access MySQL or add an internal REST/API layer.

## POST-MVP ACADEMIC / DEMO ENHANCEMENT — OpenStreetMap

The original OSM enhancement read a configured demonstration venue independently of Volunteer Activity. R2 now gives the selected managed Activity's stored public venue/location authority: venue plus coordinates renders its map, venue alone renders text without an iframe, and no venue renders no Activity map. Only without selection may validated `CES_MAP_*` values render as **Configured CES demonstration venue**.

A server-only helper builds HTTPS `www.openstreetmap.org/export/embed.html` URLs with public coordinates, `bbox`, `layer=mapnik`, and marker, plus a matching larger-map link. The browser loads the iframe with attribution. No Volunteer PII, acknowledgement, session/token, or staff actor enters URLs. No geocoding, API key, or billing is required.

These are two distinct external-service patterns: **QuickChart external API integration** is `server → QuickChart API → PNG`; **OpenStreetMap third-party map integration** is `browser → OpenStreetMap iframe → interactive map`. Google Maps was abandoned before commit because its Cloud/billing setup was unsuitable; no Google Maps source entered Git history. Feature commit `104f187dd653d76b9175f4673b0208c23eb05a83` is pushed.

## Post-MVP presentation architecture

UI-1 through UI-4 retain server-first rendering and separate staff/public route-group layouts. The staff layout provides a responsive shell with a 240px sticky desktop sidebar, compact two-column mobile navigation, active-route semantics, a skip link, and shared PageContainer/PageHeader. Route grouping itself organizes presentation; R1 now provides real server-side authorization in the staff layout, individual pages, and Goods/Cash actions.

Tailwind 4 semantic design tokens in `app/globals.css` provide shared surface, foreground, border, primary, focus, and status colors. Small Card, StatusBadge, and button/link helpers cover the shared presentation needs; a Donation-specific form-style helper keeps Goods/Cash controls consistent. No shadcn or component-framework dependency was added.

Client Components remain limited to interaction such as staff navigation, Donation tabs, login/logout, and the Goods/Cash/Volunteer and Activity forms. Donation panels remain mounted while the inactive panel is hidden, preserving drafts and keyboard tab behavior. Validation, Server Actions, parameterized SQL, and server-side database/provider boundaries are unchanged.

The public Volunteer layout gives the form priority in a ~60/40 desktop form/venue grid and places the complete form before the Activity venue/demonstration card on mobile. The QR poster uses a local CSS module; print selectors are scoped to the poster route and remove staff chrome and screen controls while retaining the QR, direct URL when applicable, and demo warning. The QR stays 600×600 at source, approximately 280px on screen, and 74mm in print. These presentation changes do not alter map configuration or QuickChart behavior.

## CES Portal v2 R2 managed Activity domain

Protected `/activities` provides managed records, explicit lifecycle transitions, Draft/Active editing, terminal Archived state, optimistic revision protection, and no hard delete. Both active ADMIN/STAFF manage records without creator-only restrictions. Staff navigation has five links: Dashboard, Donations, Inventory, Activities, Volunteers. Desktop sidebar and visible two-column mobile navigation remain; five links occupy three rows on narrow screens without a hamburger. Poster stays under Volunteers.

Staff write flow:

```text
Authenticated browser
→ Activity Server Action
→ staff authorization and validation
→ transaction + staff reauthorization
→ Activity FOR UPDATE for edit/status mutation
→ revision/state verification
→ Activity mutation + revision increment when updating
→ Activity success audit
→ commit
```

Create inserts the Draft Activity and success audit in one transaction. Edit/status mutation locks the Activity and rejects stale revisions or invalid states before writing. Actors derive from verified sessions. Public registration follows:

```text
Public browser
→ managed Activity ID
→ server validation
→ transaction
→ Activity FOR SHARE
→ require current ACTIVE status
→ canonical Activity ID/name
→ Volunteer insert with Activity ID + name snapshot
→ commit
```

The shared lock prevents stale page selection from bypassing closure. Public projection contains only Activity ID, name, date, venue, and coordinates; staff actors, audit metadata, and revision are not exposed. Dates are informational: past/future ACTIVE Activities remain eligible. No Active Activity means no signup/free-text fallback. Historical Volunteer rows retain NULL links and stored text; renaming an Activity preserves linked Volunteer name snapshots. Date, venue, and coordinates are not snapshotted in Volunteer rows.

QuickChart architecture remains unchanged with generic `/volunteer` QR. Dashboard counts linked and unlinked Volunteers without Activity metrics. Migration 002 and its narrowly recognized audit CHECK successor are described in [database design](database-design.md). R3–R6 functionality is not implemented.
