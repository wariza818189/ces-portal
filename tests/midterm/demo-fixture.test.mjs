import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seedMidtermStaff } from "../../scripts/seed-midterm-demo.mjs";
import { verifyPassword } from "../../lib/auth/passwords.mjs";
const password = "Synthetic fixture password";
const tables = ["users", "staff_sessions", "auth_rate_limits", "audit_logs", "goods_donations", "cash_donations", "activities", "volunteers", "notices"];
function fake(options = {}) {
  const calls = [];
  return { calls,
    async execute(sql, values) {
      calls.push({ sql, values });
      if (sql.startsWith("SELECT DATABASE")) return [[{ db_name: options.database ?? "ces_portal_midterm_demo" }]];
      if (sql.includes("FROM schema_migrations")) return [options.migration ?? [{ status: "APPLIED", completed_statements: 2 }]];
      if (sql.includes("information_schema")) return [(options.tables ?? tables).map(name => ({ name }))];
      if (sql.includes("WHERE username")) return [options.duplicate ? [{ id: "7" }] : []];
      if (sql.startsWith("INSERT")) { if (options.insertFails || options.insertFailureCode) throw Object.assign(new Error("Synthetic insertion failure"), { code: options.insertFailureCode }); return [{ affectedRows: options.affectedRows ?? 1 }]; }
      if (sql.includes("LAST_INSERT_ID")) return [[{ id: options.id ?? "9007199254740993" }]];
      throw new Error("Unexpected query");
    },
    async beginTransaction() { calls.push({ sql: "BEGIN" }); },
    async commit() { calls.push({ sql: "COMMIT" }); if (options.commitFails) throw new Error("Synthetic commit failure"); },
    async rollback() { calls.push({ sql: "ROLLBACK" }); },
  };
}
test("fixture refuses every nonexact live database before writes", async () => {
  for (const database of ["ces_portal", "ces_midterm_test_fake", "ces_portal_midterm_demo_extra", "CES_PORTAL_MIDTERM_DEMO", null, ""]) {
    const c = fake({ database: database === null ? "" : database });
    await assert.rejects(() => seedMidtermStaff(c, "Synthetic Staff", "staff", password));
    assert.equal(c.calls.length, 1);
  }
});
test("fixture requires exact applied migration and all application tables", async () => {
  for (const options of [{ migration: [] }, { migration: [{ status: "APPLYING", completed_statements: 2 }] }, { migration: [{ status: "APPLIED", completed_statements: 1 }] }, { tables: tables.slice(0, -1) }]) {
    const c = fake(options); await assert.rejects(() => seedMidtermStaff(c, "Synthetic Staff", "staff", password));
    assert.ok(!c.calls.some(call => call.sql === "BEGIN" || call.sql.startsWith("INSERT")));
  }
});
test("fixture validates name, canonical username and password before transaction", async () => {
  for (const inputs of [["", "staff", password], [" ", "staff", password], ["x".repeat(101), "staff", password], ["Synthetic", "bad username", password], ["Synthetic", "x".repeat(65), password], ["Synthetic", "staff", "short"], ["Synthetic", "staff", "x".repeat(129)]]) {
    const c = fake(); await assert.rejects(() => seedMidtermStaff(c, ...inputs));
    assert.ok(!c.calls.some(call => call.sql === "BEGIN" || call.sql.startsWith("INSERT")));
  }
});
test("exact demo guard accepts bound active STAFF insert with real Argon2id and safe string ID", async () => {
  const c = fake(); const id = await seedMidtermStaff(c, " Synthetic Staff ", " DEMO.Staff ", password);
  assert.equal(id, "9007199254740993");
  const insert = c.calls.find(call => call.sql.startsWith("INSERT"));
  assert.match(insert.sql, /VALUES \(\?, \?, \?, 'STAFF', 1/);
  assert.equal(insert.values[0], "Synthetic Staff"); assert.equal(insert.values[1], "demo.staff");
  assert.match(insert.values[2], /^\$argon2id\$/); assert.notEqual(insert.values[2], password);
  assert.equal(await verifyPassword(insert.values[2], password), true);
  assert.equal(c.calls.at(-1).sql, "COMMIT");
  assert.ok(!c.calls.some(call => /audit_logs|UPDATE users|DELETE|GRANT|CREATE TABLE/.test(call.sql)));
});
test("duplicate username refused without overwrite and rolled back", async () => {
  const c = fake({ duplicate: true }); await assert.rejects(() => seedMidtermStaff(c, "Synthetic", "staff", password), /already exists/);
  assert.ok(!c.calls.some(call => call.sql.startsWith("INSERT"))); assert.equal(c.calls.at(-1).sql, "ROLLBACK");
});
test("insert, unique-race, affected-row, identity and commit failures roll back without retry", async () => {
  for (const options of [{ insertFails: true }, { insertFailureCode: "ER_DUP_ENTRY" }, { affectedRows: 0 }, { affectedRows: 2 }, { id: "0" }, { id: "18446744073709551616" }, { id: 1 }, { commitFails: true }]) {
    const c = fake(options); await assert.rejects(() => seedMidtermStaff(c, "Synthetic", "staff", password));
    assert.equal(c.calls.at(-1).sql, "ROLLBACK"); assert.equal(c.calls.filter(call => call.sql.startsWith("INSERT")).length, 1);
  }
});
test("operator command hides and confirms passwords, rejects arguments and invents no audit event", async () => {
  const source = await readFile(new URL("../../scripts/seed-midterm-demo.mjs", import.meta.url), "utf8");
  assert.match(source, /process.argv.length !== 2/); assert.match(source, /process.stdin.isTTY/); assert.match(source, /process.stdout.isTTY/);
  assert.match(source, /hiddenPassword/); assert.match(source, /password !== confirmation/);
  assert.ok(!source.includes("STAFF_CREATED")); assert.ok(!source.includes("writeAudit"));
  assert.ok(!/console\.(?:log|error)\([^;]*(?:hash|password|token)/.test(source));
});
