import test from "node:test";
import assert from "node:assert/strict";
import { createPool, createConnection } from "mysql2/promise";
import { createHash } from "node:crypto";
import { databaseConfiguration } from "../../scripts/lib/database.mjs";
import { applyMigrations } from "../../scripts/lib/migrations.mjs";
import { bootstrapAdmin } from "../../scripts/bootstrap-admin.mjs";
import { hashPassword } from "../../lib/auth/passwords.mjs";
import { authenticateCredentials } from "@/lib/auth/login";
import { getCurrentUser, requireRole } from "@/lib/auth/session";
import { login, logout } from "@/lib/actions/auth";
import { withRequest, requests } from "./framework.mjs";

const enabled = process.env.CES_R1_TEST_DATABASE === process.env.DB_NAME && /^ces_r1_test_[a-z0-9_]+$/.test(process.env.DB_NAME ?? "");
const suite = enabled ? test : test.skip;

suite("R1 integration against explicitly selected disposable MySQL", async (t) => {
  const { createGoodsDonation, createCashDonation } = await import("@/lib/actions/donations");
  const configuration = { ...databaseConfiguration(), bigNumberStrings: false };
  const pool = createPool({ ...configuration, connectionLimit: 8 });
  const connection = await createConnection(configuration);
  const password = "Synthetic R1 password";
  let adminId, staffId, staffToken;
  const counts = async () => { const row = (await connection.query("SELECT (SELECT COUNT(*) FROM goods_donations) AS goods, (SELECT COUNT(*) FROM cash_donations) AS cash, (SELECT COUNT(*) FROM audit_logs WHERE event_type IN ('GOODS_DONATION_CREATED','CASH_DONATION_CREATED')) AS donationAudits"))[0][0]; return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)])); };
  const form = (values) => { const form = new FormData(); for (const [key, value] of Object.entries(values)) form.set(key, value); return form; };
  const initial = { status: "idle", message: "", fieldErrors: {} };
  try {
    await t.test("legacy rows preserved and migration rerun verified", async () => {
      await applyMigrations(connection);
      const [[goods]] = await connection.query("SELECT CAST(quantity AS CHAR) AS quantity, recorded_by FROM goods_donations WHERE id = 1");
      const [[cash]] = await connection.query("SELECT CAST(amount AS CHAR) AS amount, recorded_by FROM cash_donations WHERE id = 1");
      const [[volunteer]] = await connection.query("SELECT activity, contact_number FROM volunteers WHERE id = 1");
      assert.deepEqual(goods, { quantity: "1.25", recorded_by: null });
      assert.deepEqual(cash, { amount: "125.25", recorded_by: null });
      assert.deepEqual(volunteer, { activity: "Historical free text", contact_number: "00000000000" });
      const [[migration]] = await connection.query("SELECT status, completed_statements, LENGTH(checksum) AS checksumLength FROM schema_migrations WHERE version = '001_auth_foundation.sql'");
      assert.equal(migration.status, "APPLIED"); assert.equal(migration.completed_statements, 10); assert.equal(migration.checksumLength, 64);
    });
    await t.test("bootstrap race creates exactly one Admin and one null-actor audit", async () => {
      const other = await createConnection(configuration);
      try {
        const results = await Promise.allSettled([
          bootstrapAdmin(connection, "Synthetic Admin", " R1.Admin ", password),
          bootstrapAdmin(other, "Synthetic Admin 2", "r1.admin2", password),
        ]);
        assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
        const [[admin]] = await connection.query("SELECT CAST(id AS CHAR) AS id FROM users WHERE role = 'ADMIN'");
        adminId = admin.id;
        await assert.rejects(() => bootstrapAdmin(connection, "Another Admin", "another.admin", password));
        const [[audit]] = await connection.query("SELECT COUNT(*) AS count, SUM(actor_user_id IS NULL) AS anonymous FROM audit_logs WHERE event_type = 'ADMIN_BOOTSTRAPPED'");
        assert.equal(Number(audit.count), 1); assert.equal(Number(audit.anonymous), 1);
      } finally { await other.end(); }
      await connection.execute("INSERT INTO users (name,username,password_hash,role,is_active) VALUES (?, ?, ?, 'STAFF', 1)", ["Synthetic Staff", "r1.staff", await hashPassword(password)]);
      const [[staff]] = await connection.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id"); staffId = staff.id;
    });
    await t.test("invalid credentials, inactive accounts, canonicalization, and input bounds", async () => {
      for (const values of [["r1.staff", "wrong-password-12"], ["unknown.user", password], ["", ""], ["a".repeat(65), password], ["r1.staff", "a".repeat(129)]]) assert.equal(await authenticateCredentials(pool, ...values), null);
      await connection.execute("UPDATE users SET is_active = 0 WHERE id = ?", [staffId]);
      assert.equal(await authenticateCredentials(pool, "r1.staff", password), null);
      await connection.execute("UPDATE users SET is_active = 1 WHERE id = ?", [staffId]);
      staffToken = await authenticateCredentials(pool, " R1.STAFF ", password);
      assert.equal(typeof staffToken, "string");
    });
    await t.test("fresh opaque tokens, digest storage, expiry and safe user DTO", async () => {
      const otherToken = await authenticateCredentials(pool, "r1.staff", password);
      assert.ok(otherToken !== staffToken, "Logins must create different opaque tokens.");
      const digest = createHash("sha256").update(staffToken).digest();
      const [[session]] = await connection.execute("SELECT token_hash, TIMESTAMPDIFF(SECOND,created_at,expires_at) AS duration FROM staff_sessions WHERE token_hash = ?", [digest]);
      assert.ok(session.token_hash.equals(digest), "Only the expected token digest is stored."); assert.equal(session.duration, 28800);
      const user = await withRequest(staffToken, () => getCurrentUser());
      assert.deepEqual(Object.keys(user).sort(), ["id", "name", "role", "username"]);
      assert.equal(user.id, staffId); assert.equal(user.role, "STAFF");
      assert.equal(await withRequest(null, () => getCurrentUser()), null);
      assert.equal(await withRequest("f".repeat(64), () => getCurrentUser()), null);
      const secondDigest = createHash("sha256").update(otherToken).digest();
      await connection.execute("UPDATE staff_sessions SET created_at = DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 9 HOUR), expires_at = DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 1 HOUR) WHERE token_hash = ?", [secondDigest]);
      assert.equal(await withRequest(otherToken, () => getCurrentUser()), null);
      await connection.execute("UPDATE users SET is_active = 0 WHERE id = ?", [staffId]);
      assert.equal(await withRequest(staffToken, () => getCurrentUser()), null);
      await connection.execute("UPDATE users SET is_active = 1 WHERE id = ?", [staffId]);
    });
    await t.test("roles: Staff capability accepted, Admin-only rejected, Admin accepted", async () => {
      assert.equal((await withRequest(staffToken, () => requireRole("STAFF", "ADMIN"))).id, staffId);
      await assert.rejects(() => withRequest(staffToken, () => requireRole("ADMIN")));
      const [[admin]] = await connection.execute("SELECT username FROM users WHERE id = ?", [adminId]);
      const adminToken = await authenticateCredentials(pool, admin.username, password);
      assert.equal((await withRequest(adminToken, () => requireRole("ADMIN"))).id, adminId);
    });
    await t.test("direct unauthenticated Goods/Cash action calls write zero domain rows", async () => {
      const before = await counts();
      for (const token of [null, "f".repeat(64)]) {
        const goods = await withRequest(token, () => createGoodsDonation(initial, form({ category: "Canned", quantity: "1.25", unit: "pcs", dateReceived: "2026-10-01", expiryDate: "2026-12-01", user_id: adminId, role: "ADMIN" })));
        const cash = await withRequest(token, () => createCashDonation(initial, form({ amount: "5.25", dateReceived: "2026-10-01", notes: "Synthetic private note", user_id: adminId })));
        assert.equal(goods.status, "error"); assert.equal(cash.status, "error");
        assert.match(goods.message, /sign in/); assert.match(cash.message, /sign in/);
      }
      assert.deepEqual(await counts(), before);
    });
    await t.test("authorized donation actor, exact existing values, and successful audit commit", async () => {
      const before = await counts();
      const goods = await withRequest(staffToken, () => createGoodsDonation(initial, form({ category: "Canned", quantity: "1.25", unit: "pcs", dateReceived: "2026-10-01", expiryDate: "2026-12-01", recorded_by: adminId })));
      const cash = await withRequest(staffToken, () => createCashDonation(initial, form({ amount: "5.25", dateReceived: "2026-10-01", notes: "Synthetic private note", recorded_by: adminId })), { refreshFails: true });
      assert.equal(goods.status, "success"); assert.equal(cash.status, "success"); assert.match(cash.message, /do not resubmit/);
      const after = await counts(); assert.equal(after.goods, before.goods + 1); assert.equal(after.cash, before.cash + 1); assert.equal(after.donationAudits, before.donationAudits + 2);
      for (const [table, event] of [["goods_donations", "GOODS_DONATION_CREATED"], ["cash_donations", "CASH_DONATION_CREATED"]]) {
        const [[record]] = await connection.query(`SELECT CAST(d.recorded_by AS CHAR) AS actor, CAST(a.actor_user_id AS CHAR) AS auditActor FROM ${table} d JOIN audit_logs a ON a.entity_id = d.id AND a.event_type = '${event}' ORDER BY d.id DESC LIMIT 1`);
        assert.equal(record.actor, staffId); assert.equal(record.auditActor, staffId);
      }
    });
    await t.test("audit failure rolls back Goods and Cash on the same transaction", async () => {
      // Wrap only the application's acquired connections; inject an audit SQL
      // failure after the real INSERT, without schema mutations or test triggers.
      const { db } = await import("@/lib/db");
      const original = db.getConnection.bind(db);
      db.getConnection = async () => {
        const real = await original();
        return new Proxy(real, { get(target, property) {
          if (property === "execute") return (sql, values) => {
            if (sql.includes("INSERT INTO audit_logs")) throw new Error("Injected audit failure.");
            return target.execute(sql, values);
          };
          const value = Reflect.get(target, property); return typeof value === "function" ? value.bind(target) : value;
        } });
      };
      const before = await counts();
      try {
        for (const action of [createGoodsDonation, createCashDonation]) {
          const result = await withRequest(staffToken, () => action(initial, form({ category: "Rice", quantity: "2.00", unit: "kg", dateReceived: "2026-10-01", expiryDate: "2026-12-01", amount: "10.25", notes: "rollback" })));
          assert.equal(result.status, "error");
        }
        assert.deepEqual(await counts(), before);
      } finally { db.getConnection = original; }
    });
    await t.test("ten concurrent failed requests count exactly five failures; fixed window recovers", async () => {
      const results = await Promise.all(Array.from({ length: 10 }, () => authenticateCredentials(pool, "concurrent.unknown", password)));
      assert.ok(results.every(result => result === null));
      const key = createHash("sha256").update("ces-login-v1:concurrent.unknown").digest();
      const [[bucket]] = await connection.execute("SELECT failures FROM auth_rate_limits WHERE identifier_hash = ?", [key]); assert.equal(bucket.failures, 5);
      await connection.execute("UPDATE auth_rate_limits SET window_started_at = DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 16 MINUTE) WHERE identifier_hash = ?", [key]);
      assert.equal(await authenticateCredentials(pool, "concurrent.unknown", password), null);
      const [[reset]] = await connection.execute("SELECT failures FROM auth_rate_limits WHERE identifier_hash = ?", [key]); assert.equal(reset.failures, 1);
      for (let attempt = 0; attempt < 5; attempt++) await authenticateCredentials(pool, "r1.staff", "wrong-password-12");
      assert.equal(await authenticateCredentials(pool, "r1.staff", password), null);
      await connection.execute("UPDATE auth_rate_limits SET window_started_at = DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 16 MINUTE) WHERE identifier_hash = ?", [createHash("sha256").update("ces-login-v1:r1.staff").digest()]);
    });
    await t.test("login action generic error, cookie properties, safe redirect and logout invalidation", async () => {
      for (const username of ["r1.staff", "other.unknown", ""]) {
        const result = await withRequest(null, () => login({ message: "" }, form({ username, password: "wrong-password-12" })));
        assert.equal(result.message, "Unable to sign in with those credentials.");
      }
      let loginToken;
      await withRequest(null, async () => {
        await assert.rejects(() => login({ message: "" }, form({ username: "r1.staff", password, next: "//attacker.test" })), error => error.destination === "/dashboard");
        const writes = requests.getStore().writes;
        assert.equal(writes.length, 1); const cookie = writes[0]; loginToken = cookie.value;
        assert.equal(cookie.options.httpOnly, true); assert.equal(cookie.options.sameSite, "lax"); assert.equal(cookie.options.path, "/"); assert.equal(cookie.options.maxAge, 28800); assert.equal("domain" in cookie.options, false);
      });
      await withRequest(loginToken, async () => {
        await assert.rejects(() => logout(), error => error.destination === "/login");
        assert.equal(requests.getStore().writes[0].options.maxAge, 0);
      });
      assert.equal(await withRequest(loginToken, () => getCurrentUser()), null);
    });
    await t.test("audit contains no password, hashes, session tokens, notes, contacts or request bodies", async () => {
      const [audits] = await connection.query("SELECT actor_user_id,event_type,entity_type,entity_id,outcome,reason_code,metadata FROM audit_logs");
      const encoded = JSON.stringify(audits);
      for (const forbidden of [password, staffToken, "$argon2", "Synthetic private note", "00000000000", "concurrent.unknown", "other.unknown", "password_hash", "request_body"]) assert.ok(!encoded.includes(forbidden), "Audit contained a forbidden value/type.");
      for (const audit of audits) { assert.equal(audit.metadata, null); if (audit.event_type === "AUTH_LOGIN_FAILURE") { assert.equal(audit.actor_user_id, null); assert.equal(audit.entity_id, null); } }
    });
  } finally {
    await connection.end(); await pool.end();
    const { db } = await import("@/lib/db"); await db.end();
  }
});
