import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createConnection, createPool } from "mysql2/promise";
import { applyMigrations } from "../../scripts/lib/migrations.mjs";
import { withRequest } from "../r1/framework.mjs";

const enabled = process.env.CES_MIDTERM_TEST_DATABASE === process.env.DB_NAME
  && /^ces_midterm_test_[a-z0-9_]+$/.test(process.env.DB_NAME ?? "")
  && /^\/tmp\/ces-midterm-mysql-[A-Za-z0-9]+\/mysql.sock$/.test(process.env.DB_SOCKET ?? "");
const initial = { status: "idle", message: "", fieldErrors: {} };
const form = values => { const f = new FormData(); for (const [key, value] of Object.entries(values)) f.set(key, String(value)); return f; };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

(enabled ? test : test.skip)("isolated Notice direct actions, RBAC, transactions and real row locks", async t => {
  const cfg = { socketPath: process.env.DB_SOCKET, user: "root" };
  const operator = await createConnection(cfg);
  const name = `ces_midterm_test_crud_${process.pid}`;
  await operator.query(`CREATE DATABASE \`${name}\``);
  const c = await createConnection({ ...cfg, database: name });
  let db;
  try {
    const [[selected]] = await c.query("SELECT DATABASE() AS name, VERSION() AS version");
    assert.equal(selected.name, name);
    assert.equal((await c.query("SHOW TABLES"))[0].length, 0);
    t.diagnostic(`MySQL ${selected.version}; new private socket-only schema ${name}`);
    const schema = await readFile(new URL("../../database/schema.sql", import.meta.url), "utf8");
    for (const sql of schema.replace(/^\s*--.*$/gm, "").split(";").map(s => s.trim()).filter(Boolean)) await c.query(sql);
    await applyMigrations(c);
    globalThis.mysqlPool = createPool({ ...cfg, database: name, connectionLimit: 5 });
    db = (await import("@/lib/db")).db;
    const actions = await import("@/lib/actions/notices");
    const { listNotices, lockNotice } = await import("@/lib/notices");
    const { requireNoticeAdmin, NoticeAuthorizationError } = await import("@/lib/auth/notice-authorization");
    const actors = {};
    // Synthetic support fixtures only; no provisioning command or demo account.
    for (const [label, role, active, expired] of [["admin", "ADMIN", 1, false], ["staff", "STAFF", 1, false], ["inactive", "ADMIN", 0, false], ["expired", "ADMIN", 1, true]]) {
      await c.execute("INSERT INTO users(name,username,password_hash,role,is_active) VALUES(?,?,?,?,?)",
        [`Synthetic ${label}`, `p2.${label}`, "Synthetic unused hash; no login exercised", role, active]);
      const [[row]] = await c.execute("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
      const token = randomBytes(32).toString("hex");
      const times = expired
        ? "DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 2 HOUR), DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 1 HOUR)"
        : "UTC_TIMESTAMP(3), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 1 HOUR)";
      await c.execute(`INSERT INTO staff_sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,${times})`, [createHash("sha256").update(token).digest(), row.id]);
      actors[label] = { id: row.id, token };
    }
    const call = (action, values, token = actors.admin.token, options = {}) => withRequest(token, () => action(initial, values instanceof FormData ? values : form(values)), options);
    const counts = async () => (await c.query("SELECT (SELECT COUNT(*) FROM notices) AS notices, (SELECT COUNT(*) FROM audit_logs WHERE entity_type='NOTICE') AS audits"))[0][0];
    const row = async id => (await c.execute("SELECT CAST(id AS CHAR) AS id,title,message,CAST(created_by AS CHAR) AS created_by,revision,DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%s.%f') AS created_at,DATE_FORMAT(updated_at,'%Y-%m-%d %H:%i:%s.%f') AS updated_at FROM notices WHERE id=?", [id]))[0][0];
    const create = async (title = "Synthetic Notice", message = "Synthetic body") => {
      const result = await call(actions.createNotice, { title, message });
      assert.equal(result.status, "success", result.message); return result.id;
    };
    const wrapConnections = overrides => {
      const original = db.getConnection.bind(db);
      db.getConnection = async () => {
        const conn = await original();
        return new Proxy(conn, { get(target, key) {
          if (Object.hasOwn(overrides, key)) return (...args) => overrides[key](target, ...args);
          const value = target[key]; return typeof value === "function" ? value.bind(target) : value;
        } });
      };
      return () => { db.getConnection = original; };
    };
    await t.test("ADMIN guard allows only active ADMIN and protects direct locked helper", async () => {
      assert.equal((await withRequest(actors.admin.token, () => requireNoticeAdmin())).id, actors.admin.id);
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await assert.rejects(() => withRequest(actors.staff.token, () => lockNotice(conn, "1")), NoticeAuthorizationError);
        await conn.rollback();
      } finally { conn.release(); }
    });
    await t.test("STAFF/anonymous/expired/inactive/invalid sessions deny all direct mutations before validation", async () => {
      const before = await counts();
      for (const token of [actors.staff.token, null, actors.expired.token, actors.inactive.token, "f".repeat(64), "malformed"]) {
        for (const action of Object.values(actions)) {
          const result = await call(action, {}, token);
          assert.equal(result.status, "error"); assert.match(result.message, /Access denied/); assert.deepEqual(result.fieldErrors, {});
        }
      }
      assert.deepEqual(await counts(), before);
    });
    await t.test("unknown/malformed roles from session query fail closed for reads and all actions", async () => {
      const before = await counts(); const original = db.execute.bind(db);
      try {
        for (const role of ["UNKNOWN", "admin", null, 1]) {
          db.execute = async (sql, args) => {
            const [rows, fields] = await original(sql, args);
            return [sql.includes("FROM staff_sessions") ? rows.map(r => ({ ...r, role })) : rows, fields];
          };
          await assert.rejects(() => withRequest(actors.admin.token, listNotices));
          for (const action of Object.values(actions)) assert.match((await call(action, {})).message, /Access denied/);
        }
      } finally { db.execute = original; }
      assert.deepEqual(await counts(), before);
    });
    await t.test("validation rejects duplicate/missing/file fields before connection acquisition", async () => {
      const before = await counts(); const original = db.getConnection;
      db.getConnection = () => { throw new Error("Validation must precede connection acquisition"); };
      try {
        for (const [action, values] of [[actions.createNotice, { title: "Synthetic", message: "Body" }], [actions.editNotice, { title: "Synthetic", message: "Body", id: "1", revision: "1" }], [actions.deleteNotice, { id: "1", revision: "1" }]]) {
          for (const field of Object.keys(values)) for (const kind of ["duplicate", "file", "missing"]) {
            const f = form(values);
            if (kind === "duplicate") f.append(field, values[field]);
            if (kind === "file") f.set(field, new Blob(["Fixture"]), "fixture.txt");
            if (kind === "missing") f.delete(field);
            const result = await call(action, f); assert.equal(result.status, "error"); assert.ok(result.fieldErrors[field]);
          }
        }
        for (const id of ["01", "18446744073709551616", "9007199254740993 "]) assert.ok((await call(actions.deleteNotice, { id, revision: "1" })).fieldErrors.id);
      } finally { db.getConnection = original; }
      assert.deepEqual(await counts(), before);
    });
    await t.test("CREATE parameterizes SQL text and uses session actor; protected feed returns only validated DTO", async () => {
      const title = "'); DELETE FROM notices; --", message = '\" OR 1=1 --\n<b>Literal plain text</b>';
      const result = await call(actions.createNotice, { title, message, created_by: actors.staff.id, actor_id: actors.staff.id, role: "STAFF", created_at: "forged", updated_at: "forged" });
      assert.equal(result.status, "success"); assert.equal(result.revision, 1); assert.equal(typeof result.id, "string");
      const stored = await row(result.id); assert.equal(stored.title, title); assert.equal(stored.message, message); assert.equal(stored.created_by, actors.admin.id);
      const [[audit]] = await c.execute("SELECT CAST(actor_user_id AS CHAR) AS actor,metadata FROM audit_logs WHERE event_type='NOTICE_CREATED' AND entity_id=?", [result.id]);
      assert.deepEqual(audit, { actor: actors.admin.id, metadata: null });
      const before = await counts();
      for (const token of [actors.admin.token, actors.staff.token]) {
        const notices = await withRequest(token, listNotices); assert.ok(notices.some(n => n.id === result.id));
        for (const notice of notices) { assert.deepEqual(Object.keys(notice).sort(), ["created_at", "id", "message", "revision", "title", "updated_at"]); assert.match(notice.created_at, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/); }
      }
      for (const token of [null, actors.expired.token, actors.inactive.token, "f".repeat(64)]) await assert.rejects(() => withRequest(token, listNotices));
      assert.deepEqual(await counts(), before);
    });
    await t.test("UPDATE changes only actual fields, increments once, audits names only; no-op writes nothing", async () => {
      const id = await create(); const original = await row(id), before = await counts(); const paths = [];
      const noop = await call(actions.editNotice, { id, revision: "1", title: " Synthetic Notice ", message: "Synthetic body" }, actors.admin.token, { refreshPaths: paths });
      assert.equal(noop.status, "success"); assert.equal(noop.revision, 1); assert.deepEqual(await row(id), original); assert.deepEqual(await counts(), before); assert.deepEqual(paths, []);
      assert.equal((await call(actions.editNotice, { id, revision: "1", title: "Edited", message: "Synthetic body" })).revision, 2);
      const [[audit]] = await c.execute("SELECT metadata FROM audit_logs WHERE event_type='NOTICE_UPDATED' AND entity_id=?", [id]);
      assert.deepEqual(audit.metadata, { changed_fields: ["title"], previous_revision: 1, new_revision: 2 });
      const edited = await row(id); assert.equal(edited.created_at, original.created_at); assert.equal(edited.created_by, original.created_by);
      const stale = await call(actions.editNotice, { id, revision: "1", title: "Stale", message: "Stale" }); assert.match(stale.message, /changed since/); assert.deepEqual(await row(id), edited);
      assert.equal((await call(actions.editNotice, { id, revision: "2", title: "Edited twice", message: "Updated body" })).revision, 3);
      const [[last]] = await c.execute("SELECT metadata FROM audit_logs WHERE event_type='NOTICE_UPDATED' AND entity_id=? ORDER BY id DESC LIMIT 1", [id]);
      assert.deepEqual(last.metadata, { changed_fields: ["title", "message"], previous_revision: 2, new_revision: 3 });
    });
    await t.test("DELETE physically removes matched row, retains minimal audit; missing/stale fail", async () => {
      const id = await create();
      await call(actions.editNotice, { id, revision: "1", title: "Newer", message: "Synthetic body" });
      const before = await counts(); assert.match((await call(actions.deleteNotice, { id, revision: "1" })).message, /changed since/); assert.ok(await row(id)); assert.deepEqual(await counts(), before);
      assert.equal((await call(actions.deleteNotice, { id, revision: "2" })).status, "success"); assert.equal(await row(id), undefined);
      const [[audit]] = await c.execute("SELECT metadata FROM audit_logs WHERE event_type='NOTICE_DELETED' AND entity_id=?", [id]); assert.deepEqual(audit.metadata, { previous_revision: 2 });
      const after = await counts(); assert.match((await call(actions.deleteNotice, { id, revision: "2" })).message, /not found/);
      assert.match((await call(actions.editNotice, { id, revision: "2", title: "Missing", message: "Body" })).message, /not found/); assert.deepEqual(await counts(), after);
    });
    await t.test("audit insertion failure rolls back CREATE, UPDATE and DELETE", async () => {
      const id = await create("Rollback fixture"), original = await row(id), before = await counts();
      const restore = wrapConnections({ execute: (conn, sql, args) => { if (sql.includes("INSERT INTO audit_logs")) throw Error("Injected audit failure"); return conn.execute(sql, args); } });
      try {
        for (const [action, values] of [[actions.createNotice, { title: "Failed", message: "Body" }], [actions.editNotice, { id, revision: "1", title: "Failed", message: "Body" }], [actions.deleteNotice, { id, revision: "1" }]]) {
          const result = await call(action, values); assert.equal(result.status, "error"); assert.match(result.message, /couldn't confirm/);
          assert.deepEqual(await counts(), before); assert.deepEqual(await row(id), original);
        }
      } finally { restore(); }
    });
    await t.test("large UINT64 ID stays a string through locked reads, update, audit and delete; max revision allows no-op/delete", async () => {
      const id = "9007199254740993";
      await c.execute("INSERT INTO notices(id,title,message,created_by,revision) VALUES(?,?,?,?,?)", [id, "Large ID", "Synthetic body", actors.admin.id, 4294967294]);
      const bindings = [];
      const restore = wrapConnections({ execute: (conn, sql, args) => { if (/FROM notices|UPDATE notices|INTO audit_logs/.test(sql)) bindings.push([sql, args]); return conn.execute(sql, args); } });
      try {
        assert.equal((await call(actions.editNotice, { id, revision: "4294967294", title: "Last edit", message: "Synthetic body" })).revision, 4294967295);
        const before = await counts(), original = await row(id);
        assert.equal((await call(actions.editNotice, { id, revision: "4294967295", title: "Last edit", message: "Synthetic body" })).status, "success");
        assert.match((await call(actions.editNotice, { id, revision: "4294967295", title: "Overflow", message: "Synthetic body" })).message, /revision limit/);
        assert.deepEqual(await counts(), before); assert.deepEqual(await row(id), original);
        assert.equal((await call(actions.deleteNotice, { id, revision: "4294967295" })).status, "success");
        for (const [sql, args] of bindings) {
          if (sql.includes("FOR UPDATE") || sql.startsWith("DELETE")) assert.equal(args[0], id);
          if (sql.startsWith("UPDATE")) assert.equal(args[2], id);
          if (sql.includes("INTO audit_logs")) assert.equal(args[3], id);
        }
        assert.equal(await row(id), undefined);
      } finally { restore(); }
    });
    const pauseLock = () => {
      const acquired = deferred(), release = deferred(); let used = false;
      const restore = wrapConnections({ execute: async (conn, sql, args) => {
        const result = await conn.execute(sql, args);
        if (!used && sql.includes("FROM notices") && sql.includes("FOR UPDATE")) { used = true; acquired.resolve(); await release.promise; }
        return result;
      } });
      return { acquired: acquired.promise, release: () => release.resolve(), restore };
    };
    await t.test("real edit/edit FOR UPDATE locking serializes; one same-revision edit succeeds", async () => {
      const id = await create("Edit race"), pause = pauseLock();
      try {
        const first = call(actions.editNotice, { id, revision: "1", title: "First", message: "Body" }); await pause.acquired;
        let ended = false; const second = call(actions.editNotice, { id, revision: "1", title: "Second", message: "Body" }).then(r => { ended = true; return r; });
        await new Promise(r => setTimeout(r, 100)); assert.equal(ended, false, "second operation must block on real row lock");
        pause.release(); assert.equal((await first).status, "success"); assert.match((await second).message, /changed since/); assert.equal((await row(id)).title, "First"); assert.equal((await row(id)).revision, 2);
      } finally { pause.release(); pause.restore(); }
    });
    for (const firstKind of ["edit", "delete"]) await t.test(`real edit/delete locking with ${firstKind} first permits one mutation only`, async () => {
      const id = await create("Edit delete race"), pause = pauseLock(), before = await counts();
      const edit = () => call(actions.editNotice, { id, revision: "1", title: "Newer content", message: "Body" });
      const remove = () => call(actions.deleteNotice, { id, revision: "1" });
      try {
        const first = firstKind === "edit" ? edit() : remove(); await pause.acquired;
        let ended = false; const second = (firstKind === "edit" ? remove() : edit()).then(r => { ended = true; return r; });
        await new Promise(r => setTimeout(r, 100)); assert.equal(ended, false); pause.release();
        assert.equal((await first).status, "success"); assert.equal((await second).status, "error");
        if (firstKind === "edit") { assert.equal((await row(id)).title, "Newer content"); assert.equal((await row(id)).revision, 2); }
        else assert.equal(await row(id), undefined);
        assert.equal((await counts()).audits, before.audits + 1);
      } finally { pause.release(); pause.restore(); }
    });
    await t.test("role/account/session revocation after initial ADMIN check blocks every transaction", async () => {
      const id = await create("Revocation fixture");
      for (const revocation of ["role", "inactive", "expired"]) for (const [action, values] of [[actions.createNotice, { title: "Revoked", message: "Body" }], [actions.editNotice, { id, revision: "1", title: "Revoked", message: "Body" }], [actions.deleteNotice, { id, revision: "1" }]]) {
        const before = await counts(), original = await row(id), getConnection = db.getConnection.bind(db); let recheck = false;
        db.getConnection = async () => {
          if (revocation === "role") await c.execute("UPDATE users SET role='STAFF' WHERE id=?", [actors.admin.id]);
          if (revocation === "inactive") await c.execute("UPDATE users SET is_active=0 WHERE id=?", [actors.admin.id]);
          if (revocation === "expired") await c.execute("UPDATE staff_sessions SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND),created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 2 HOUR) WHERE user_id=?", [actors.admin.id]);
          const conn = await getConnection();
          return new Proxy(conn, { get(target, key) {
            if (key === "execute") return (sql, args) => { if (sql.includes("FROM staff_sessions") && sql.includes("FOR SHARE")) recheck = true; return target.execute(sql, args); };
            const value = target[key]; return typeof value === "function" ? value.bind(target) : value;
          } });
        };
        try { const result = await call(action, values); assert.match(result.message, /Access denied/); assert.ok(recheck); assert.deepEqual(await counts(), before); assert.deepEqual(await row(id), original); }
        finally {
          db.getConnection = getConnection;
          await c.execute("UPDATE users SET role='ADMIN',is_active=1 WHERE id=?", [actors.admin.id]);
          await c.execute("UPDATE staff_sessions SET expires_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 1 HOUR) WHERE user_id=?", [actors.admin.id]);
        }
      }
    });
    await t.test("refresh attempts both paths independently after confirmed commit; never encourages resubmission", async () => {
      for (const failPath of ["/notices", "/admin/notices"]) {
        const paths = [], observations = [];
        const result = await call(actions.createNotice, { title: "Refresh fixture", message: "Body" }, actors.admin.token, {
          refreshPaths: paths, onRefresh: path => { observations.push(counts()); if (path === failPath) throw Error("Injected refresh failure"); }
        });
        assert.equal(result.status, "success"); assert.match(result.message, /confirmed.*do not resubmit/); assert.deepEqual(paths, ["/notices", "/admin/notices"]); assert.ok(await row(result.id));
        const current = await counts(); for (const observed of await Promise.all(observations)) assert.deepEqual(observed, current);
      }
    });
    await t.test("commit uncertainty before/after actual commit returns check-before-retry without refresh", async () => {
      for (const actuallyCommit of [false, true]) {
        const before = await counts(), paths = [];
        const restore = wrapConnections({ commit: async conn => { if (actuallyCommit) await conn.commit(); throw Error("Injected uncertain commit outcome"); } });
        try {
          const result = await call(actions.createNotice, { title: "Uncertain fixture", message: "Body" }, actors.admin.token, { refreshPaths: paths });
          assert.equal(result.status, "error"); assert.match(result.message, /couldn't confirm.*before retrying/); assert.deepEqual(paths, []);
          const after = await counts(); assert.equal(after.notices, before.notices + Number(actuallyCommit)); assert.equal(after.audits, before.audits + Number(actuallyCommit));
        } finally { restore(); }
      }
    });
    await t.test("unexpected driver/affected-row/generated-ID failures roll back and return safe uncertainty", async () => {
      const id = await create("Failure fixture"), original = await row(id);
      for (const [action, values, fragment] of [[actions.createNotice, { title: "Failed", message: "Body" }, "INSERT INTO notices"], [actions.editNotice, { id, revision: "1", title: "Failed", message: "Body" }, "UPDATE notices"], [actions.deleteNotice, { id, revision: "1" }, "DELETE FROM notices"]]) {
        const before = await counts();
        const restore = wrapConnections({ execute: async (conn, sql, args) => { const result = await conn.execute(sql, args); if (sql.includes(fragment)) return [{ ...result[0], affectedRows: 0 }, result[1]]; return result; } });
        try { assert.match((await call(action, values)).message, /couldn't confirm/); assert.deepEqual(await counts(), before); assert.deepEqual(await row(id), original); } finally { restore(); }
      }
      for (const invalidId of ["18446744073709551616", 1]) {
        const before = await counts();
        const restore = wrapConnections({ execute: (conn, sql, args) => sql.includes("LAST_INSERT_ID") ? [[{ id: invalidId }], []] : conn.execute(sql, args) });
        try { assert.match((await call(actions.createNotice, { title: "Failed", message: "Body" })).message, /couldn't confirm/); assert.deepEqual(await counts(), before); } finally { restore(); }
      }
      const getConnection = db.getConnection; db.getConnection = async () => { throw Object.assign(Error("Raw SQL must not escape"), { code: "ER_LOCK_WAIT_TIMEOUT" }); };
      try { const result = await call(actions.createNotice, { title: "Failed", message: "Body" }); assert.match(result.message, /couldn't confirm/); assert.ok(!JSON.stringify(result).includes("Raw SQL")); } finally { db.getConnection = getConnection; }
    });
    await t.test("protected feed orders updated_at/id DESC and rejects malformed stored rows without coercion", async () => {
      const first = await create("Tie one"), second = await create("Tie two");
      await c.execute("UPDATE notices SET updated_at='9999-01-01 00:00:00' WHERE id IN (?,?)", [first, second]);
      const feed = await withRequest(actors.staff.token, listNotices); assert.deepEqual(feed.slice(0, 2).map(n => n.id), [second, first]);
      for (const title of [" Unnormalized ", "Bad\u0000title"]) {
        await c.execute("UPDATE notices SET title=? WHERE id=?", [title, first]);
        await assert.rejects(() => withRequest(actors.staff.token, listNotices), /Invalid stored Notice/);
      }
      await c.execute("UPDATE notices SET title='Tie one',message=? WHERE id=?", ["Unnormalized\rbody", first]);
      await assert.rejects(() => withRequest(actors.staff.token, listNotices), /Invalid stored Notice/);
      await c.execute("UPDATE notices SET message='Synthetic body' WHERE id=?", [first]);
    });
  } finally { if (db) await db.end(); delete globalThis.mysqlPool; await c.end(); await operator.end(); }
});
