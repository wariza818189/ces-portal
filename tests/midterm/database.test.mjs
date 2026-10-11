import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createConnection } from "mysql2/promise";
import { applyMigrations, migrationStatements, AUDIT_CHECK_REPLACEMENT, NOTICE_AUDIT_CHECK_REPLACEMENT } from "../../scripts/lib/migrations.mjs";
const versions = ["001_auth_foundation.sql", "002_activity_management.sql", "003_midterm_notices.sql"];
const sources = await Promise.all(versions.map(v => readFile(new URL(`../../database/migrations/${v}`, import.meta.url), "utf8")));
const hashes = sources.map(sql => createHash("sha256").update(sql).digest("hex"));
test("immutable historical bytes, reviewed 003 identity and narrow SQL permission", () => {
  assert.deepEqual(hashes, ["7c018fd31fabb353545a9dd04cea3bfd4327e88ddab488764fecb2acdfa85d3d", "e2704724d5bae39b2027bf50889001a198fa1d0051023f03b600f89e277b8a81", "5030fb936e85f381a191288ef7a26805ec3a154056e339d161015df04c291967"]);
  assert.deepEqual(sources.map(sql => migrationStatements(sql).length), [10, 5, 2]);
  for (const sql of [AUDIT_CHECK_REPLACEMENT, NOTICE_AUDIT_CHECK_REPLACEMENT]) assert.equal(migrationStatements(sql).length, 1);
  for (const sql of ["DROP TABLE notices", "TRUNCATE notices", "DELETE FROM notices", "ALTER TABLE notices DROP COLUMN title", "ALTER TABLE audit_logs DROP CHECK chk_audit_event", NOTICE_AUDIT_CHECK_REPLACEMENT.replace("'NOTICE_CREATED'", "'UNKNOWN'")]) assert.throws(() => migrationStatements(sql));
});
// Explicit opt-in and private socket only. Never load app .env or use network DBs.
const enabled = process.env.CES_MIDTERM_TEST_DATABASE === process.env.DB_NAME
  && /^ces_midterm_test_[a-z0-9_]+$/.test(process.env.DB_NAME ?? "")
  && /^\/tmp\/ces-midterm-mysql-[A-Za-z0-9]+\/mysql.sock$/.test(process.env.DB_SOCKET ?? "");
(enabled ? test : test.skip)("isolated MySQL Notice parity, upgrade, recovery and fail-closed drift", async t => {
  const operator = await createConnection({ socketPath: process.env.DB_SOCKET, user: "root" });
  const target = await createConnection({ socketPath: process.env.DB_SOCKET, user: "root", database: process.env.DB_NAME });
  const legacy = await readFile(new URL("../r1/legacy-schema.sql", import.meta.url), "utf8");
  const latest = await readFile(new URL("../../database/schema.sql", import.meta.url), "utf8");
  let sequence = 0;
  const executeSql = async (c, sql) => { for (const s of sql.replace(/^\s*--.*$/gm, "").split(";").map(x => x.trim()).filter(Boolean)) await c.query(s); };
  const directory = async (count = 3) => {
    const dir = await mkdtemp(join(tmpdir(), "ces-midterm-chain-"));
    for (let i = 0; i < count; i++) await writeFile(join(dir, versions[i]), sources[i]);
    return dir;
  };
  const newSchema = async (fresh = false) => {
    const name = `ces_midterm_test_case_${process.pid}_${++sequence}`;
    await operator.query(`CREATE DATABASE \`${name}\``);
    const c = await createConnection({ socketPath: process.env.DB_SOCKET, user: "root", database: name });
    await executeSql(c, fresh ? latest : legacy);
    return c;
  };
  const withSchema = async (fresh, fn) => { const c = await newSchema(fresh); try { await fn(c); } finally { await c.end(); } };
  const structure = async c => {
    const results = [];
    for (const sql of [
      "SELECT COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT,EXTRA,COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='notices' ORDER BY ORDINAL_POSITION",
      "SELECT INDEX_NAME,SEQ_IN_INDEX,COLUMN_NAME,NON_UNIQUE,COLLATION,SUB_PART,INDEX_TYPE,IS_VISIBLE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='notices' ORDER BY INDEX_NAME,SEQ_IN_INDEX",
      "SELECT k.CONSTRAINT_NAME,k.COLUMN_NAME,k.REFERENCED_TABLE_NAME,k.REFERENCED_COLUMN_NAME,r.DELETE_RULE,r.UPDATE_RULE FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA AND r.TABLE_NAME=k.TABLE_NAME AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME WHERE k.CONSTRAINT_SCHEMA=DATABASE() AND k.TABLE_NAME='notices' ORDER BY k.CONSTRAINT_NAME,k.ORDINAL_POSITION",
      "SELECT t.TABLE_NAME,t.CONSTRAINT_NAME,t.ENFORCED,c.CHECK_CLAUSE FROM information_schema.TABLE_CONSTRAINTS t JOIN information_schema.CHECK_CONSTRAINTS c ON c.CONSTRAINT_SCHEMA=t.CONSTRAINT_SCHEMA AND c.CONSTRAINT_NAME=t.CONSTRAINT_NAME WHERE t.TABLE_SCHEMA=DATABASE() AND ((t.TABLE_NAME='notices' AND t.CONSTRAINT_TYPE='CHECK') OR (t.TABLE_NAME='audit_logs' AND t.CONSTRAINT_NAME='chk_audit_event')) ORDER BY t.TABLE_NAME,t.CONSTRAINT_NAME"
    ]) results.push((await c.query(sql))[0]);
    return results;
  };
  try {
    const [[selected]] = await target.query("SELECT DATABASE() AS name, VERSION() AS version");
    assert.equal(selected.name, process.env.CES_MIDTERM_TEST_DATABASE);
    assert.equal((await target.query("SHOW TABLES"))[0].length, 0, "target must be empty; no cleanup permitted");
    t.diagnostic(`MySQL ${selected.version}; private socket; fresh ${selected.name}`);
    await executeSql(target, legacy);
    const r2dir = await directory(2);
    await applyMigrations(target, r2dir);
    await t.test("accepted R2 upgrade and unchanged APPLIED rerun; exact Notice structure", async () => {
      await applyMigrations(target); await applyMigrations(target);
      const [rows] = await target.query("SELECT version,status,completed_statements FROM schema_migrations ORDER BY version");
      assert.deepEqual(rows.map(r => [r.version, r.status, r.completed_statements]), versions.map((v, i) => [v, "APPLIED", [10, 5, 2][i]]));
      const info = await structure(target);
      assert.equal(info[0].length, 7); assert.equal(info[1].length, 4); assert.equal(info[2].length, 1); assert.equal(info[3].length, 4);
    });
    await t.test("fresh latest vs 001→002→003 parity from live information_schema", () => withSchema(true, async c => {
      assert.deepEqual(await structure(c), await structure(target));
      await applyMigrations(c); await applyMigrations(c);
      assert.deepEqual(await structure(c), await structure(target));
    }));
    for (const stop of [1, 2]) await t.test(`DDL committed before checkpoint ${stop} recovers exact CREATE/CHECK`, () => withSchema(false, async c => {
      await applyMigrations(c, r2dir);
      let failed = false;
      const proxy = new Proxy(c, { get(target, key) {
        if (key === "execute") return async (sql, args) => {
          if (!failed && sql.startsWith("UPDATE schema_migrations SET completed_statements") && args[0] === stop && args[1] === versions[2]) { failed = true; throw Error("Injected checkpoint interruption"); }
          return target.execute(sql, args);
        };
        const value = target[key]; return typeof value === "function" ? value.bind(target) : value;
      } });
      await assert.rejects(() => applyMigrations(proxy), /Injected/); assert.ok(failed);
      await applyMigrations(c); await applyMigrations(c); assert.deepEqual(await structure(c), await structure(target));
    }));
    for (const [version, stop] of [[versions[0], 10], [versions[1], 1], [versions[2], 1]]) await t.test(`fresh latest adoption interruption at ${version} resumes`, () => withSchema(true, async c => {
      let failed = false;
      const proxy = new Proxy(c, { get(target, key) {
        if (key === "execute") return async (sql, args) => {
          if (!failed && sql.startsWith("UPDATE schema_migrations SET completed_statements") && args[0] === stop && args[1] === version) { failed = true; throw Error("Injected adoption interruption"); }
          return target.execute(sql, args);
        };
        const value = target[key]; return typeof value === "function" ? value.bind(target) : value;
      } });
      await assert.rejects(() => applyMigrations(proxy), /Injected/); assert.ok(failed);
      await applyMigrations(c); await applyMigrations(c);
      assert.deepEqual(await structure(c), await structure(target));
    }));
    await t.test("checkpointed Notice CREATE missing fails without recreating table", () => withSchema(false, async c => {
      await applyMigrations(c, r2dir);
      await c.execute("INSERT INTO schema_migrations(version,checksum,status,completed_statements) VALUES(?,?,'APPLYING',1)", [versions[2], hashes[2]]);
      await assert.rejects(() => applyMigrations(c), /table is missing/);
      assert.equal((await c.query("SHOW TABLES LIKE 'notices'"))[0].length, 0);
    }));
    await t.test("Notice drift after CREATE-before-checkpoint interruption fails", () => withSchema(false, async c => {
      await applyMigrations(c, r2dir);
      await c.query(migrationStatements(sources[2])[0]);
      await c.execute("INSERT INTO schema_migrations(version,checksum,status) VALUES(?,?,'APPLYING')", [versions[2], hashes[2]]);
      await c.query("ALTER TABLE notices MODIFY title VARCHAR(121) NOT NULL");
      await assert.rejects(() => applyMigrations(c));
    }));
    const noticeDrifts = [
      "ALTER TABLE notices MODIFY title VARCHAR(121) NOT NULL",
      "ALTER TABLE notices ALTER revision SET DEFAULT 2",
      "ALTER TABLE notices DROP INDEX idx_notices_updated",
      "ALTER TABLE notices ADD INDEX unexpected (title)",
      "ALTER TABLE notices DROP CHECK chk_notices_title",
      "ALTER TABLE notices DROP CHECK chk_notices_revision, ADD CONSTRAINT chk_notices_revision CHECK(revision >= 0)",
      "ALTER TABLE notices DROP FOREIGN KEY fk_notices_created_by",
      "ALTER TABLE notices DROP FOREIGN KEY fk_notices_created_by; ALTER TABLE notices ADD CONSTRAINT fk_notices_created_by FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT",
      "ALTER TABLE notices ALTER INDEX idx_notices_updated INVISIBLE"
    ];
    await t.test("APPLIED Notice column/default/index/CHECK/FK drift fails closed", async () => {
      for (const alter of noticeDrifts) await withSchema(true, async c => { await applyMigrations(c); await executeSql(c, alter); await assert.rejects(() => applyMigrations(c)); });
    });
    await t.test("existing CREATE before first checkpoint must match", () => withSchema(false, async c => {
      await applyMigrations(c, r2dir);
      await c.query(migrationStatements(sources[2])[0].replace("VARCHAR(120)", "VARCHAR(121)"));
      await assert.rejects(() => applyMigrations(c));
    }));
    await t.test("audit unknown/missing/extra/reordered/unenforced states fail closed", async () => {
      const final = NOTICE_AUDIT_CHECK_REPLACEMENT;
      for (const alter of ["ALTER TABLE audit_logs DROP CHECK chk_audit_event", final.replace("'NOTICE_UPDATED'", "'UNKNOWN'"), final.replace(", 'NOTICE_UPDATED'", ""), final.replace("'NOTICE_DELETED'", "'NOTICE_DELETED', 'UNKNOWN'"), final.replace("'NOTICE_CREATED', 'NOTICE_UPDATED'", "'NOTICE_UPDATED', 'NOTICE_CREATED'"), "ALTER TABLE audit_logs ALTER CHECK chk_audit_event NOT ENFORCED", AUDIT_CHECK_REPLACEMENT]) await withSchema(true, async c => { await applyMigrations(c); await executeSql(c, alter); await assert.rejects(() => applyMigrations(c)); });
    });
    await t.test("R1→MIDTERM out of order is rejected", () => withSchema(false, async c => {
      const dir = await directory(1); await applyMigrations(c, dir);
      await c.query(migrationStatements(sources[2])[0]); await c.query(NOTICE_AUDIT_CHECK_REPLACEMENT);
      await assert.rejects(() => applyMigrations(c));
    }));
    await t.test("historical/003 file checksum drift, recorded checksum drift and duplicate number reject", async () => {
      for (let i = 0; i < 3; i++) await withSchema(false, async c => {
        const dir = await directory(); await writeFile(join(dir, versions[i]), sources[i] + "\n-- drift");
        await assert.rejects(() => applyMigrations(c, dir), /chain/);
      });
      await withSchema(true, async c => { await applyMigrations(c); await c.execute("UPDATE schema_migrations SET checksum=? WHERE version=?", ["0".repeat(64), versions[2]]); await assert.rejects(() => applyMigrations(c), /checksum/); });
      await withSchema(false, async c => { const dir = await directory(); await writeFile(join(dir, "003_duplicate.sql"), sources[2]); await assert.rejects(() => applyMigrations(c, dir), /Duplicate/); });
    });
    await t.test("unknown/destructive successors and missing predecessor fail closed", async () => {
      for (const sql of [NOTICE_AUDIT_CHECK_REPLACEMENT, "ALTER TABLE audit_logs DROP CHECK chk_audit_event", NOTICE_AUDIT_CHECK_REPLACEMENT.replace("'NOTICE_DELETED'", "'ARBITRARY'")]) await withSchema(false, async c => { const dir = await directory(); await writeFile(join(dir, "004_unknown.sql"), sql + ";"); await assert.rejects(() => applyMigrations(c, dir)); });
      await withSchema(false, async c => { const dir = await mkdtemp(join(tmpdir(), "ces-midterm-no-predecessor-")); await writeFile(join(dir, versions[2]), sources[2]); await assert.rejects(() => applyMigrations(c, dir), /chain/); });
    });
  } finally { await target.end(); await operator.end(); }
});
