import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
if (!process.env.DB_NAME) Object.assign(process.env, { DB_HOST: "markup.invalid", DB_PORT: "1", DB_USER: "synthetic", DB_PASSWORD: "synthetic-only", DB_NAME: "ces_midterm_test_markup" });
// Delay application imports until the earlier CRUD suite has installed its
// private pool. Static markup must not capture a process-global DB prematurely.
let StaffNavigation, NoticeForm, DeleteNoticeControl, SharedPage, AdminPage, db, withRequest, readDeletionFeedback;
async function initialize() {
  ({ StaffNavigation } = await import("@/components/layout/staff-navigation"));
  ({ NoticeForm } = await import("@/components/notices/notice-form"));
  ({ DeleteNoticeControl, readDeletionFeedback } = await import("@/components/notices/delete-notice-control"));
  ({ default: SharedPage } = await import("@/app/(staff)/notices/page"));
  ({ default: AdminPage } = await import("@/app/(staff)/admin/notices/page"));
  ({ db } = await import("@/lib/db"));
  ({ withRequest } = await import("../r1/framework.mjs"));
}
const notice = { id: "1", title: "<script>literal</script>", message: "Line one\n  Line two <b>literal</b>", revision: 3, created_at: "2026-10-14 01:00:00", updated_at: "2026-10-14 02:00:00" };
const render = component => renderToStaticMarkup(component);
const source = name => readFile(new URL(`../../${name}`, import.meta.url), "utf8");
async function page(role, query = {}, records = [notice], management = false) {
  const execute = db.execute; let loads = 0;
  db.execute = async sql => {
    if (sql.includes("FROM staff_sessions")) return [[{ id: "1", name: "Synthetic", username: "demo", role }]];
    if (sql.includes("FROM notices")) { loads++; if (records === null) throw new Error("Synthetic read failure"); return [records]; }
    throw new Error("Unexpected query");
  };
  try {
    const element = await withRequest(role ? "a".repeat(64) : null, () => (management ? AdminPage : SharedPage)({ searchParams: Promise.resolve(query) }));
    return { html: render(element), loads };
  } catch (error) { return { error, loads }; } finally { db.execute = execute; }
}
test("six ordered primary links retain two-column mobile navigation and precise Notice roots", async () => {
  await initialize();
  const html = render(createElement(StaffNavigation));
  assert.equal((html.match(/<a /g) ?? []).length, 6);
  assert.match(html, /grid-cols-2/); assert.match(html, /lg:grid-cols-1/);
  let previous = -1;
  for (const label of ["Dashboard", "Donations", "Inventory", "Activities", "Notices", "Volunteers"]) { const index = html.indexOf(`>${label}</a>`); assert.ok(index > previous); previous = index; }
  assert.match(html, /href="\/notices"/);
  const text = await source("components/layout/staff-navigation.tsx");
  assert.match(text, /\["\/notices", "\/admin\/notices"\]/); assert.ok(!text.includes('startsWith("/admin")'));
});
test("Notice create/edit markup has associated labels, textarea, hints, required fields and hidden revisions", async () => {
  await initialize();
  for (const record of [undefined, notice]) {
    const html = render(createElement(NoticeForm, { notice: record }));
    for (const name of ["title", "message"]) { assert.match(html, new RegExp(`name="${name}"`)); assert.match(html, new RegExp(`for="(?:create|edit-1)-${name}"`)); }
    assert.match(html, /<textarea/); assert.match(html, /required=""/); assert.match(html, /aria-invalid="false"/); assert.match(html, /aria-describedby/);
    assert.match(html, /Maximum 120 characters/); assert.match(html, /Maximum 2000 characters/); assert.ok(!html.includes("maxLength") && !html.includes("maxlength"));
    if (record) { assert.match(html, /type="hidden" name="id" value="1"/); assert.match(html, /name="revision" value="3"/); assert.match(html, /Close editor/); assert.match(html, /Save Notice/); }
    else assert.match(html, /Create Notice/);
  }
  const text = await source("components/notices/notice-form.tsx");
  assert.match(text, /useActionState/); assert.match(text, /disabled=\{pending\}/); assert.match(text, /Saving\.\.\./); assert.match(text, /\$\{id\}-error/);
  assert.ok(!text.includes("maxLength"));
});
test("delete control displays escaped title/revision, hidden tokens and mandatory native confirmation", async () => {
  await initialize();
  const html = render(createElement(DeleteNoticeControl, { notice }));
  assert.match(html, /type="checkbox"/); assert.match(html, /required=""/); assert.match(html, /I confirm that I want to delete this Notice/);
  assert.match(html, /revision 3/); assert.match(html, /&lt;script&gt;/); assert.match(html, /name="id" value="1"/); assert.match(html, /name="revision" value="3"/);
  assert.match(html, /<button[^>]*disabled=""/); assert.match(html, /focus-visible:outline-focus/);
  const text = await source("components/notices/delete-notice-control.tsx"); assert.match(text, /Deleting\.\.\./); assert.match(text, /form.get\("confirm"\)/);
});
test("shared page allows ADMIN management link and only exact scalar STAFF denial", async () => {
  await initialize();
  const admin = await page("ADMIN", { access: "admin-required" }); assert.match(admin.html, /Manage Notices/); assert.ok(!admin.html.includes("Access denied."));
  const staff = await page("STAFF", { access: "admin-required" }); assert.match(staff.html, /Access denied. Only ADMIN can manage CES Staff Notices./); assert.ok(!staff.html.includes("Manage Notices"));
  for (const access of [undefined, "arbitrary reflected text", ["admin-required"], ["admin-required", "admin-required"]]) {
    const result = await page("STAFF", { access }); assert.ok(!result.html.includes("Access denied.") && !result.html.includes("arbitrary reflected text"));
  }
});
test("feed escapes plain text, preserves newlines, UTC labels, synthetic context and distinct empty/failure states", async () => {
  await initialize();
  const { html } = await page("STAFF"); assert.match(html, /&lt;script&gt;/); assert.match(html, /&lt;b&gt;/); assert.match(html, /whitespace-pre-wrap/); assert.match(html, /wrap-anywhere/);
  assert.match(html, /Created \(UTC\)/); assert.match(html, /Updated \(UTC\)/); assert.match(html, /SYNTHETIC \/ LOCAL DEMO ONLY/);
  for (const name of ["app/(staff)/notices/page.tsx", "app/(staff)/admin/notices/page.tsx"]) assert.ok(!(await source(name)).includes("dangerouslySetInnerHTML"));
  assert.match((await page("STAFF", {}, [])).html, /No Notices recorded/);
  assert.match((await page("STAFF", {}, null)).html, /Unable to load Notices/);
});
test("both anonymous pages use login flow; STAFF management redirects before list query or controls", async () => {
  await initialize();
  for (const management of [false, true]) { const result = await page(null, {}, [notice], management); assert.match(result.error.destination, /^\/login\?next=/); assert.equal(result.loads, 0); }
  const result = await page("STAFF", {}, [notice], true); assert.equal(result.error.destination, "/notices?access=admin-required"); assert.equal(result.loads, 0);
  const text = await source("app/(staff)/admin/notices/page.tsx"); assert.ok(text.indexOf('redirect("/notices?access=admin-required")') < text.indexOf("await listNotices()"));
});
test("ADMIN edit selection accepts exact schema IDs and fails safely for duplicate, malformed or absent IDs", async () => {
  await initialize();
  const valid = await page("ADMIN", { edit: "1" }, [notice], true); assert.match(valid.html, /Save Notice/);
  for (const edit of [["1", "1"], "01", "0", "2", "18446744073709551616"]) { const result = await page("ADMIN", { edit }, [notice], true); assert.match(result.html, /Notice not found or invalid edit request/); assert.ok(!result.html.includes("Save Notice")); }
  assert.ok(!(await page("ADMIN", {}, [notice], true)).html.includes("Save Notice"));
});
test("STAFF access restriction ignores padded admin-required values", async () => {
  await initialize();
  // I-check ang STAFF role gamit ang " admin-required " (may spaces sa gilid)
  const result = await page("STAFF", { access: " admin-required " });
  
  // Siguraduhing HINDI lumabas ang access-denied banner
  assert.ok(!result.html.includes("Access denied."));
  assert.ok(!result.html.includes("Only ADMIN can manage CES Staff Notices."));
});

