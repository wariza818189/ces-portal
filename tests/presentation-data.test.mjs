import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import { createConnection } from "mysql2/promise";
import { randomBytes } from "node:crypto";
import { batch, legacyBatch, presentationPlan, applyPresentation, rollbackPresentation, verifyManifest } from "../scripts/lib/presentation-data.mjs";
import { createHash } from "node:crypto";
import { main } from "../scripts/presentation-data.mjs";

test("preview is deterministic, fictional, decimal-safe and covers expiry boundaries/statuses", () => {
  const plan = presentationPlan("2026-10-16");
  assert.deepEqual(plan, presentationPlan("2026-10-16"));
  assert.deepEqual(plan.goods.map(row => row.expiry_date), ["2027-01-14", "2026-10-19", "2026-10-16", "2026-10-15"]);
  assert.deepEqual(plan.activities.map(row => row.transitions.at(-1) ?? "DRAFT"), ["ACTIVE", "DRAFT", "CLOSED", "ARCHIVED"]);
  assert.equal(plan.cash.reduce((sum, row) => sum + BigInt(row.amount.replace(".", "")), 0n), 222550n);
  assert.ok(plan.volunteers.every(row => row.contact_number === "00000000000" && row.full_name.endsWith("(fictional)")));
  for (const group of [plan.activities, plan.volunteers, plan.notices, plan.cash]) assert.ok(!JSON.stringify(group).includes("CES-PRESENTATION"));
  for (const date of [undefined, "2026-02-30", "2026-2-01", "1000-01-01", "9999-12-31"]) assert.throws(() => presentationPlan(date));
  assert.equal(presentationPlan("2028-02-29").date, "2028-02-29");
});

test("v1 preview remains byte-compatible in content and unknown versions are refused", async () => {
  const saved = JSON.parse(await readFile(new URL("../docs/deployment/presentation-qa/presentation-plan.json", import.meta.url), "utf8"));
  assert.deepEqual(presentationPlan("2026-10-16", legacyBatch), saved.plan);
  assert.throws(() => presentationPlan("2026-10-16", "unknown"));
  assert.notEqual(presentationPlan("2026-10-16").batch, saved.plan.batch);
});

test("mutation flags fail before connection without a target and explicit batch approval", async () => {
  await assert.rejects(() => main(["--date", "2026-10-16", "--mode", "apply"]));
  await assert.rejects(() => main(["--date", "2026-10-16", "--mode", "rollback"]));
});

const socket = process.env.CES_PRESENTATION_TEST_SOCKET;
test("isolated MySQL seed, journal rerun, drift/referral guards, rollback and failure atomicity", { skip: !/^\/tmp\/ces-presentation-mysql-[A-Za-z0-9]+\/mysql.sock$/.test(socket ?? "") }, async t => {
  const root = await createConnection({ socketPath: socket, user: "root", dateStrings: true, supportBigNumbers: true, bigNumberStrings: true });
  let connection;
  const suffix = randomBytes(4).toString("hex");
  const database = `ces_presentation_test_${suffix}`;
  const username = `presentation_${suffix}`;
  try {
    const [existing] = await root.execute("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?", [database]);
    assert.equal(existing.length, 0, "test requires a fresh private schema; never reset one");
    await root.query(`CREATE DATABASE ${database}`);
    await root.query(`USE ${database}`);
    const schema = await readFile(new URL("../database/schema.sql", import.meta.url), "utf8");
    for (const sql of schema.split(";").map(sql => sql.trim()).filter(Boolean)) await root.query(sql);
    await root.query("CREATE TABLE schema_migrations (version VARCHAR(100), status VARCHAR(20), completed_statements INT)");
    for (const row of [["001_auth_foundation.sql", 10], ["002_activity_management.sql", 5], ["003_midterm_notices.sql", 2]]) await root.execute("INSERT INTO schema_migrations VALUES (?, 'APPLIED', ?)", row);
    const { hashPassword } = await import("../lib/auth/passwords.mjs");
    await root.execute("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'ADMIN')", ["Synthetic QA Admin", "qa.admin", await hashPassword("Synthetic QA login 123!")]);
    await root.query("INSERT INTO goods_donations(category, quantity, unit, date_received, expiry_date) VALUES ('Rice', 3, 'kg', '2026-10-01', '2027-01-01')");
    await root.query("CREATE USER ?@'localhost' IDENTIFIED BY ?", [username, "Synthetic operator only 123!"]);
    await root.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${database}.* TO ?@'localhost'`, [username]);
    Object.assign(process.env, { DB_HOST: "localhost", DB_PORT: "3306", DB_USER: username, DB_PASSWORD: "Synthetic operator only 123!", DB_NAME: database, DB_SOCKET: socket });
    delete process.env.DB_SSL_MODE;
    connection = await createConnection({ socketPath: socket, user: username, password: process.env.DB_PASSWORD, database, dateStrings: true, supportBigNumbers: true, bigNumberStrings: true });
    const directory = await mkdtemp("/tmp/ces-presentation-journal-");
    const manifestPath = `${directory}/batch.json`;
    const args = mode => ["--date", "2026-10-16", "--mode", mode, "--host", "localhost", "--port", "3306", "--database", database, "--actor", "1", "--manifest", manifestPath, "--approve", `${mode}:${batch}`];
    const count = async () => (await root.query("SELECT (SELECT COUNT(*) FROM goods_donations) goods, (SELECT COUNT(*) FROM cash_donations) cash, (SELECT COUNT(*) FROM activities) activities, (SELECT COUNT(*) FROM volunteers) volunteers, (SELECT COUNT(*) FROM notices) notices, (SELECT COUNT(*) FROM audit_logs) audits"))[0][0];
    let manifest;
    await t.test("apply inserts only planned records and follows audited Activity transitions", async () => {
      await main(args("apply"));
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      assert.equal(manifest.status, "applied"); assert.equal(manifest.rows.length, 15);
      const counts = await count();
      assert.deepEqual([Number(counts.goods), Number(counts.cash), Number(counts.activities), Number(counts.volunteers), Number(counts.notices)], [5, 2, 4, 3, 2]);
      const [activities] = await root.query("SELECT status, revision FROM activities ORDER BY id");
      assert.deepEqual(activities.map(row => [row.status, row.revision]), [["ACTIVE", 2], ["DRAFT", 1], ["CLOSED", 3], ["ARCHIVED", 2]]);
      const [[cash]] = await root.query("SELECT CAST(SUM(amount) AS CHAR) total FROM cash_donations"); assert.equal(cash.total, "2225.50");
      const [linked] = await root.query("SELECT v.activity, a.name FROM volunteers v JOIN activities a ON a.id=v.activity_id");
      assert.ok(linked.length === 3 && linked.every(row => row.activity === row.name));
    });
    await t.test("repeated apply is read-only and lost-journal collision refuses duplication", async () => {
      const before = await count(); await main(args("apply")); assert.deepEqual(await count(), before);
      await assert.rejects(() => applyPresentation(connection, presentationPlan("2026-10-16"), "1", async () => {}));
      assert.deepEqual(await count(), before);
    });
    await t.test("uncertain journal, mismatched target and unverified network fail closed without writes", async () => {
      const before = await count();
      const saved = await readFile(manifestPath, "utf8");
      await writeFile(manifestPath, JSON.stringify({ ...manifest, status: "prepared" }));
      await assert.rejects(() => main(args("apply")), /Uncertain journal state/);
      await writeFile(manifestPath, saved);
      const wrongTarget = args("apply"); wrongTarget[wrongTarget.indexOf("--host") + 1] = "wrong.invalid";
      await assert.rejects(() => main(wrongTarget), /does not match/);
      const networkTarget = args("apply"); networkTarget[networkTarget.indexOf("--host") + 1] = "synthetic.invalid";
      process.env.DB_HOST = "synthetic.invalid"; delete process.env.DB_SOCKET;
      try { await assert.rejects(() => main(networkTarget), /Network targets require verified TLS/); }
      finally { process.env.DB_HOST = "localhost"; process.env.DB_SOCKET = socket; }
      assert.deepEqual(await count(), before);
      await assert.rejects(() => verifyManifest(connection, { ...manifest, batch: legacyBatch }));
      await assert.rejects(() => verifyManifest(connection, { ...manifest, rows: manifest.rows.map((row, i) => i === 0 ? { ...row, snapshot: { ...row.snapshot, quantity: "999.00" } } : row) }));
      const wrongVersion = args("apply"); wrongVersion.push("--batch", legacyBatch);
      wrongVersion[wrongVersion.indexOf("--approve") + 1] = `apply:${legacyBatch}`;
      await assert.rejects(() => main(wrongVersion), /does not match/);
    });
    await t.test("changed rows and additional linked signups each block rollback before any deletion", async () => {
      const notice = manifest.rows.find(row => row.table === "notices");
      await root.execute("UPDATE notices SET message = 'Changed synthetic text' WHERE id = ?", [notice.id]);
      const before = await count(); await assert.rejects(() => main(args("rollback"))); assert.deepEqual(await count(), before);
      await root.execute("UPDATE notices SET message = ?, updated_at = ? WHERE id = ?", [notice.snapshot.message, notice.snapshot.updated_at, notice.id]);
      const activity = manifest.rows.find(row => row.table === "activities");
      await root.execute("INSERT INTO volunteers(full_name,course_year,contact_number,activity,activity_id) VALUES('Synthetic later signup','Fictional year','000',?,?)", [activity.snapshot.name, activity.id]);
      const [[later]] = await root.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) id");
      const withSignup = await count(); await assert.rejects(() => main(args("rollback"))); assert.deepEqual(await count(), withSignup);
      await root.execute("DELETE FROM volunteers WHERE id = ?", [later.id]);
    });
    await t.test("rollback removes only manifest rows, retains baseline/users/audits and repeats safely", async () => {
      const auditBefore = Number((await count()).audits);
      await main(args("rollback"));
      const counts = await count(); assert.deepEqual([Number(counts.goods), Number(counts.cash), Number(counts.activities), Number(counts.volunteers), Number(counts.notices)], [1, 0, 0, 0, 0]);
      assert.equal(Number(counts.audits), auditBefore + 2);
      assert.equal(Number((await root.query("SELECT COUNT(*) total FROM users"))[0][0].total), 1);
      await main(args("rollback")); assert.deepEqual(await count(), counts);
      await assert.rejects(() => main(args("apply")));
    });
    await t.test("journal failure rolls back all inserts and audit events", async () => {
      const before = await count();
      await assert.rejects(() => applyPresentation(connection, presentationPlan("2026-10-16"), "1", async () => { throw new Error("Synthetic journal failure"); }));
      assert.deepEqual(await count(), before);
      await assert.rejects(() => rollbackPresentation(connection, { ...manifest, rows: [] }, "1", async () => {}));
      assert.deepEqual(await count(), before);
    });
    await t.test("every domain refuses an existing display-name/tuple collision before inserting", async () => {
      const plan = presentationPlan("2026-10-16");
      const cases = [
        ["INSERT INTO goods_donations(category,quantity,unit,date_received,expiry_date) VALUES(?,?,?,?,?)", [plan.goods[0].category, plan.goods[0].quantity, plan.goods[0].unit, plan.goods[0].date_received, plan.goods[0].expiry_date], "goods_donations"],
        ["INSERT INTO cash_donations(amount,date_received,notes) VALUES(?,?,?)", [plan.cash[0].amount, plan.cash[0].date_received, plan.cash[0].notes], "cash_donations"],
        ["INSERT INTO activities(name,activity_date,created_by) VALUES(?,?,1)", [plan.activities[0].name, plan.date], "activities"],
        ["INSERT INTO volunteers(full_name,course_year,contact_number,activity) VALUES(?,'Synthetic','000','Historical')", [plan.volunteers[0].full_name], "volunteers"],
        ["INSERT INTO notices(title,message,created_by) VALUES(?,'Synthetic collision',1)", [plan.notices[0].title], "notices"],
      ];
      for (const [sql, params, table] of cases) {
        await root.execute(sql, params); const [[row]] = await root.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) id");
        const before = await count();
        await assert.rejects(() => applyPresentation(connection, plan, "1", async () => {}), /planned record already exists/);
        assert.deepEqual(await count(), before);
        await root.execute(`DELETE FROM ${table} WHERE id = ?`, [row.id]);
      }
    });
    await t.test("legacy journal rerun/rollback remains valid; v2 refuses remaining v1 data", async () => {
      const plan = presentationPlan("2026-10-01", legacyBatch);
      const rows = await applyPresentation(connection, plan, "1", async () => {});
      const path = `${directory}/legacy.json`;
      const oldJournal = { batch: legacyBatch, date: plan.date, actor: "1", target: manifest.target, status: "applied", planHash: createHash("sha256").update(JSON.stringify(plan)).digest("hex"), rows };
      await writeFile(path, JSON.stringify(oldJournal));
      const oldArgs = mode => ["--date", plan.date, "--batch", legacyBatch, "--mode", mode, "--host", "localhost", "--port", "3306", "--database", database, "--actor", "1", "--manifest", path, "--approve", `${mode}:${legacyBatch}`];
      const before = await count(); await main(oldArgs("apply")); assert.deepEqual(await count(), before);
      await assert.rejects(() => applyPresentation(connection, presentationPlan("2026-10-16"), "1", async () => {}), /Legacy v1 records remain/);
      assert.deepEqual(await count(), before);
      await main(oldArgs("rollback"));
      assert.equal(Number((await count()).goods), 1);
      const freshLegacy = oldArgs("apply"); freshLegacy[freshLegacy.indexOf("--manifest") + 1] = `${directory}/retired.json`;
      await assert.rejects(() => main(freshLegacy), /v1 batch is retired/);
    });
  } finally { if (connection) await connection.end(); await root.end(); }
});
