import test from "node:test";
import assert from "node:assert/strict";
import { writeAudit } from "../../lib/auth/audit.mjs";
const capture = () => {
  const calls = [];
  return { calls, connection: { execute: async (sql, values) => { calls.push({ sql, values }); return [{ affectedRows: 1 }]; } } };
};
test("Notice success events require actor/subject and use NOTICE/SUCCESS/NULL reason", async () => {
  const { connection, calls } = capture();
  for (const [event, metadata] of [["NOTICE_CREATED", null], ["NOTICE_UPDATED", { changed_fields: ["message", "title"], previous_revision: 1, new_revision: 2 }], ["NOTICE_DELETED", { previous_revision: 4294967295 }]]) {
    await writeAudit(connection, event, "9007199254740993", "2", metadata);
    await assert.rejects(() => writeAudit(connection, event, null, "2", metadata));
    await assert.rejects(() => writeAudit(connection, event, "1", null, metadata));
    for (const id of ["0", "01", "-1", "1.5", " 1"]) await assert.rejects(() => writeAudit(connection, event, id, "2", metadata));
  }
  assert.equal(calls.length, 3);
  for (const { sql, values } of calls) {
    assert.match(sql, /VALUES \(\?, \?, \?, \?, \?, \?, \?, UTC_TIMESTAMP/);
    assert.deepEqual(values.slice(2, 6), ["NOTICE", "2", "SUCCESS", null]);
  }
  assert.equal(calls[0].values[6], null);
  assert.deepEqual(JSON.parse(calls[1].values[6]), { changed_fields: ["title", "message"], previous_revision: 1, new_revision: 2 });
  assert.deepEqual(JSON.parse(calls[2].values[6]), { previous_revision: 4294967295 });
});
test("Notice metadata rejects text, unknown keys, malformed fields/revisions and overflow before SQL", async () => {
  const { connection, calls } = capture();
  const valid = { changed_fields: ["title"], previous_revision: 1, new_revision: 2 };
  for (const metadata of [{}, undefined, [], "text", { title: "Private title" }]) {
    // Explicit undefined follows the existing default-to-null calling convention.
    if (metadata !== undefined) await assert.rejects(() => writeAudit(connection, "NOTICE_CREATED", "1", "2", metadata));
  }
  for (const metadata of [null, {}, [], { ...valid, title: "Private title" }, { ...valid, message: "Private message" }, { ...valid, changed_fields: [] }, { ...valid, changed_fields: "title" }, { ...valid, changed_fields: ["title", "title"] }, { ...valid, changed_fields: ["title", "status"] }, { ...valid, changed_fields: ["title", ,] }, ...[0, -1, 1.5, "1", 4294967296, NaN, Infinity].flatMap(revision => [{ ...valid, previous_revision: revision }, { ...valid, new_revision: revision }]), { ...valid, new_revision: 3 }, { ...valid, previous_revision: 4294967295, new_revision: 4294967296 }]) await assert.rejects(() => writeAudit(connection, "NOTICE_UPDATED", "1", "2", metadata));
  for (const metadata of [null, {}, { previous_revision: 1, title: "Deleted text" }, ...[0, -1, 1.5, "1", 4294967296, NaN].map(previous_revision => ({ previous_revision }))]) await assert.rejects(() => writeAudit(connection, "NOTICE_DELETED", "1", "2", metadata));
  assert.equal(calls.length, 0);
  await writeAudit(connection, "NOTICE_UPDATED", "1", "2", { ...valid, previous_revision: 4294967294, new_revision: 4294967295 });
});
test("R1 and Activity audit contracts remain unchanged; unknown events and failed inserts reject", async () => {
  const { connection, calls } = capture();
  for (const event of ["AUTH_LOGIN_SUCCESS", "AUTH_LOGOUT", "GOODS_DONATION_CREATED", "CASH_DONATION_CREATED", "ACTIVITY_CREATED"]) await writeAudit(connection, event, "1", "2");
  await writeAudit(connection, "AUTH_LOGIN_FAILURE", null, null);
  await writeAudit(connection, "ADMIN_BOOTSTRAPPED", null, "1");
  for (const call of calls) assert.equal(call.values[6], null);
  const update = { changes: { name: { before: "Old", after: "New" } }, previous_revision: 1, new_revision: 2 };
  const status = { previous_status: "DRAFT", new_status: "ACTIVE", previous_revision: 2, new_revision: 3 };
  await writeAudit(connection, "ACTIVITY_UPDATED", "1", "2", update);
  await writeAudit(connection, "ACTIVITY_STATUS_CHANGED", "1", "2", status);
  assert.deepEqual(JSON.parse(calls.at(-2).values[6]), update);
  assert.deepEqual(JSON.parse(calls.at(-1).values[6]), status);
  await assert.rejects(() => writeAudit(connection, "ACTIVITY_CREATED", "1", "2", {}));
  await assert.rejects(() => writeAudit(connection, "ACTIVITY_UPDATED", "1", "2", { ...update, changed_fields: ["title"] }));
  await assert.rejects(() => writeAudit(connection, "ACTIVITY_STATUS_CHANGED", "1", "2", { ...status, new_status: "CLOSED" }));
  await assert.rejects(() => writeAudit(connection, "UNKNOWN", "1", "2"));
  await assert.rejects(() => writeAudit({ execute: async () => [{ affectedRows: 0 }] }, "NOTICE_CREATED", "1", "2"));
});
