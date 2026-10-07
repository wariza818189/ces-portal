# Architecture

## Current application structure

CES Portal uses Next.js 16 App Router with TypeScript, React, Tailwind CSS, and npm. Route groups organize the staff and public experiences without adding URL prefixes: `(staff)` contains `/dashboard`, `/donations/new`, `/inventory`, `/volunteers`, and `/volunteers/poster`; `(public)` contains `/volunteer`. The root route redirects to `/dashboard`.

Pages and layouts are Server Components by default. Use Client Components only where browser interaction is required; the current Goods form is one example. The internal write path is:

```text
Browser
→ Client form where interaction is needed
→ Next.js Server Action
→ Zod validation
→ parameterized mysql2/promise query
→ MySQL
```

The server action and database connection stay on the server. `mysql2/promise` provides the connection pool and SQL access; Zod validates submitted values on the server. There is no separate Express backend, ORM, Redux, or Axios in the current project. A separate ORM, client-state library, or HTTP client is not justified by the current scope. There is no unnecessary internal REST API layer: internal mutations use Server Actions unless a concrete architectural need justifies another boundary.

When implemented, Inventory and Dashboard expiry labels must use one shared date helper and derive status from `expiry_date`; do not persist status or duplicate classification rules. Goods quantities in different units are not additive and must not be shown as one total.

## Database and local topology

Docker Compose runs MySQL 8.4 as the local database service. The host binds `127.0.0.1:3307` to container port `3306`; a named Docker volume stores database files, and a health check waits for MySQL readiness. The Next.js server connects using environment configuration and `mysql2/promise`. It is not exposed as a browser-to-database connection.

## Boundaries

- **Browser/client boundary:** browser code handles interactive UI only. Database credentials and direct database access remain server-side.
- **Server Action boundary:** internal form mutations receive submitted data, validate it with Zod, execute parameterized SQL, and return a safe result for the UI.
- **Database boundary:** the MySQL schema is defined in `database/schema.sql`; data access uses `mysql2/promise`.

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

The `/volunteer` Server Component reads one public venue name and decimal coordinates from `CES_MAP_*` runtime configuration. A server-only helper validates them and builds an HTTPS `www.openstreetmap.org/export/embed.html` URL with `bbox`, `layer=mapnik`, and marker, plus a larger-map link using the same marker. The browser loads the OpenStreetMap iframe and displays attribution. No Volunteer form field or database value enters either URL; there is no schema or persistence change. No API key or billing account is needed.

These are two distinct external-service patterns: **QuickChart external API integration** is `server → QuickChart API → PNG`; **OpenStreetMap third-party map integration** is `browser → OpenStreetMap iframe → interactive map`. Google Maps was abandoned before commit because its Cloud/billing setup was unsuitable; no Google Maps source entered Git history. Feature commit `104f187dd653d76b9175f4673b0208c23eb05a83` is pushed.

## Post-MVP presentation architecture

UI-1 through UI-4 retain server-first rendering and separate staff/public route-group layouts. The staff layout provides a responsive shell with a 240px sticky desktop sidebar, compact two-column mobile navigation, active-route semantics, a skip link, and shared PageContainer/PageHeader. Route grouping organizes presentation; it does not enforce access control.

Tailwind 4 semantic design tokens in `app/globals.css` provide shared surface, foreground, border, primary, focus, and status colors. Small Card, StatusBadge, and button/link helpers cover the shared presentation needs; a Donation-specific form-style helper keeps Goods/Cash controls consistent. No shadcn or component-framework dependency was added.

Client Components remain limited to interaction such as staff navigation, Donation tabs, and the Goods/Cash/Volunteer forms. Donation panels remain mounted while the inactive panel is hidden, preserving drafts and keyboard tab behavior. Validation, Server Actions, parameterized SQL, and server-side database/provider boundaries are unchanged.

The public Volunteer layout gives the form priority in a ~60/40 desktop form/venue grid and places the complete form before the configured OSM venue card on mobile. The QR poster uses a local CSS module; print selectors are scoped to the poster route and remove staff chrome and screen controls while retaining the QR, direct URL when applicable, and demo warning. The QR stays 600×600 at source, approximately 280px on screen, and 74mm in print. These presentation changes do not alter map configuration or QuickChart behavior.
