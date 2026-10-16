import { writeAudit } from "../../lib/auth/audit.mjs";
import { ACTIVITY_TRANSITIONS, validActivityId } from "../../lib/activity-policy.mjs";
import { createHash } from "node:crypto";

export const legacyBatch = "CES-PRESENTATION-20261016-v1";
export const batch = "CES-PRESENTATION-20261016-v2";
const tables = ["goods_donations", "cash_donations", "activities", "volunteers", "notices"];
const insertColumns = {
  goods_donations: ["category", "quantity", "unit", "date_received", "expiry_date", "recorded_by"],
  cash_donations: ["amount", "date_received", "notes", "recorded_by"],
  activities: ["name", "activity_date", "venue_name", "created_by"],
  volunteers: ["full_name", "course_year", "contact_number", "activity", "activity_id"],
  notices: ["title", "message", "created_by"],
};
const events = { goods_donations: "GOODS_DONATION_CREATED", cash_donations: "CASH_DONATION_CREATED", activities: "ACTIVITY_CREATED", notices: "NOTICE_CREATED" };

function legacyPresentationPlan(date) {
  const batch = legacyBatch;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") || date < "1000-01-15" || date > "9999-09-30"
    || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error("An explicit valid presentation date is required.");
  const day = offset => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + offset); return d.toISOString().slice(0, 10); };
  return {
    batch, date,
    goods: [
      { category: "Canned", quantity: "120.00", unit: "pcs", date_received: day(-10), expiry_date: day(90) },
      { category: "Rice", quantity: "25.00", unit: "kg", date_received: day(-5), expiry_date: day(3) },
      { category: "Noodles", quantity: "40.00", unit: "packs", date_received: day(-7), expiry_date: date },
      { category: "Other", quantity: "6.00", unit: "boxes", date_received: day(-14), expiry_date: day(-1) },
    ],
    cash: [
      { amount: "1500.00", date_received: day(-2), notes: `[${batch}] Fictional Starling Outreach Circle collection.` },
      { amount: "725.50", date_received: day(-1), notes: `[${batch}] Fictional Willow Student Circle collection.` },
    ],
    activities: [
      { name: `[${batch}] Community packing`, activity_date: day(4), venue_name: "Fictional Starling Community Hall", transitions: ["ACTIVE"] },
      { name: `[${batch}] Reading circle`, activity_date: day(10), venue_name: "Fictional Willow Learning Room", transitions: [] },
      { name: `[${batch}] Supply sorting`, activity_date: day(-3), venue_name: "Fictional Meadow Hall", transitions: ["ACTIVE", "CLOSED"] },
      { name: `[${batch}] Archived planning rehearsal`, activity_date: day(-7), venue_name: null, transitions: ["ARCHIVED"] },
    ],
    volunteers: ["Mira Starling", "Niko Willow", "Lina Meadow"].map((name, index) => ({ full_name: `Synthetic ${name} [Presentation]`, course_year: `Fictional BSIT / Year ${index + 1}`, contact_number: "00000000000", activityIndex: 0 })),
    notices: [
      { title: `[${batch}] Packing briefing`, message: "Fictional Starling Outreach Circle: review packing assignments before the community activity. Synthetic information only." },
      { title: `[${batch}] Volunteer orientation`, message: "Fictional Willow Student Circle: review the selected activity venue and coordination instructions. Synthetic information only." },
    ],
  };
}

export function presentationPlan(date, version = batch) {
  const original = legacyPresentationPlan(date);
  if (version === legacyBatch) return original;
  if (version !== batch) throw new Error("Unknown presentation batch version.");
  return {
    ...original, batch,
    cash: original.cash.map((row, index) => ({ ...row, notes: `Academic sample: ${index === 0 ? "Starling Outreach Circle" : "Willow Student Circle"} collection (fictional).` })),
    activities: original.activities.map((row, index) => ({ ...row,
      name: ["Community Packing and Outreach", "Student Reading Circle", "Community Supply Sorting", "Outreach Planning Rehearsal"][index],
      venue_name: ["Starling Community Hall (fictional)", "Willow Learning Room (fictional)", "Meadow Hall (fictional)", null][index],
    })),
    volunteers: original.volunteers.map((row, index) => ({ ...row,
      full_name: ["Mira Starling (fictional)", "Niko Willow (fictional)", "Lina Meadow (fictional)"][index],
      course_year: `BSIT / Year ${index + 1}`,
    })),
    notices: [
      { title: "Packing team briefing", message: "Review packing assignments before the community outreach activity. Academic sample from the fictional Starling Outreach Circle." },
      { title: "Volunteer orientation", message: "Review the selected activity venue and coordination instructions before arrival. Academic sample from the fictional Willow Student Circle." },
    ],
  };
}

function expectedRecords(plan, actor, activityIds = []) {
  return [
    ...plan.goods.map(row => ({ table: "goods_donations", values: { ...row, recorded_by: actor } })),
    ...plan.cash.map(row => ({ table: "cash_donations", values: { ...row, recorded_by: actor } })),
    ...plan.activities.map(({ transitions, ...row }) => ({ table: "activities", values: { ...row, created_by: actor, status: transitions.at(-1) ?? "DRAFT", revision: transitions.length + 1 } })),
    ...plan.volunteers.map(({ activityIndex, ...row }) => ({ table: "volunteers", values: { ...row, activity: plan.activities[activityIndex].name, activity_id: activityIds[activityIndex] } })),
    ...plan.notices.map(row => ({ table: "notices", values: { ...row, created_by: actor, revision: 1 } })),
  ];
}

export async function checkTarget(connection, target) {
  const [[row]] = await connection.execute("SELECT DATABASE() AS name");
  if (row.name !== target.database) throw new Error("Selected database differs from the approved target.");
  const [rows] = await connection.execute("SELECT version, status, completed_statements FROM schema_migrations ORDER BY version");
  const required = [["001_auth_foundation.sql", 10], ["002_activity_management.sql", 5], ["003_midterm_notices.sql", 2]];
  if (rows.length !== required.length || required.some(([version, count], index) => rows[index].version !== version || rows[index].status !== "APPLIED" || rows[index].completed_statements !== count)) throw new Error("Applied midterm migration chain is required.");
}

async function actorLock(connection, actor) {
  if (!validActivityId(actor)) throw new Error("A canonical existing ADMIN ID is required.");
  const [rows] = await connection.execute("SELECT id FROM users WHERE id = ? AND role = 'ADMIN' AND is_active = 1 FOR UPDATE", [actor]);
  if (rows.length !== 1) throw new Error("An existing active ADMIN is required; users are never provisioned.");
}

async function snapshot(connection, table, id) {
  if (!tables.includes(table) || !validActivityId(id)) throw new Error("Invalid manifest identity.");
  const [rows] = await connection.execute(`SELECT * FROM ${table} WHERE id = ? FOR UPDATE`, [id]);
  if (rows.length !== 1) throw new Error("A manifest row is missing; manual review is required.");
  return rows[0];
}
const same = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

export async function verifyManifest(connection, manifest) {
  if (![batch, legacyBatch].includes(manifest.batch) || !validActivityId(manifest.actor) || !Array.isArray(manifest.rows) || manifest.rows.length !== 15) throw new Error("Invalid presentation manifest.");
  const plan = presentationPlan(manifest.date, manifest.batch);
  if (manifest.planHash !== createHash("sha256").update(JSON.stringify(plan)).digest("hex")) throw new Error("Manifest plan identity differs from its version.");
  const expected = expectedRecords(plan, manifest.actor, manifest.rows.slice(6, 10).map(row => row.id));
  const seen = new Set();
  for (const [index, record] of manifest.rows.entries()) {
    const item = expected[index];
    if (record.table !== item.table || !record.snapshot || String(record.snapshot.id) !== record.id
      || Object.entries(item.values).some(([key, value]) => String(record.snapshot[key]) !== String(value))) throw new Error("Manifest records do not match their reviewed fixture.");
    const key = `${record.table}:${record.id}`;
    if (seen.has(key)) throw new Error("Duplicate manifest row.");
    seen.add(key);
    if (!same(await snapshot(connection, record.table, record.id), record.snapshot)) throw new Error("A seeded row changed; automatic action is refused.");
  }
}

// The caller holds an exclusive local journal file and a database advisory lock.
// beforeCommit MUST persist the prepared manifest before the database commit.
export async function applyPresentation(connection, plan, actor, beforeCommit) {
  if (!same(plan, presentationPlan(plan.date, plan.batch))) throw new Error("The reviewed deterministic plan is required.");
  const records = [];
  async function insert(table, values) {
    const columns = insertColumns[table];
    const [result] = await connection.execute(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`, columns.map(column => values[column]));
    if (result.affectedRows !== 1) throw new Error("Unexpected fixture insertion result.");
    const [[identity]] = await connection.execute("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
    if (!validActivityId(identity.id)) throw new Error("Invalid fixture identity.");
    if (events[table]) await writeAudit(connection, events[table], actor, identity.id);
    records.push({ table, id: identity.id });
    return identity.id;
  }
  await connection.beginTransaction();
  try {
    await actorLock(connection, actor);
    if (plan.batch === batch) {
      for (const [table, column] of [["activities", "name"], ["notices", "title"], ["cash_donations", "notes"]]) {
        const [legacy] = await connection.execute(`SELECT id FROM ${table} WHERE ${column} LIKE ? LIMIT 1 FOR UPDATE`, [`[${legacyBatch}]%`]);
        if (legacy.length) throw new Error("Legacy v1 records remain. Review their original journal before applying v2.");
      }
    }
    // Clean display names are identified by the private journal, never adopted
    // by matching text. Refuse ANY planned tuple/name collision before inserts.
    for (const item of expectedRecords(plan, actor)) {
      const keys = item.table === "activities" ? ["name"] : item.table === "notices" ? ["title"] : item.table === "volunteers" ? ["full_name"]
        : Object.keys(item.values).filter(key => key !== "recorded_by");
      const [collision] = await connection.execute(`SELECT id FROM ${item.table} WHERE ${keys.map(key => `${key} = ?`).join(" AND ")} LIMIT 1 FOR UPDATE`, keys.map(key => item.values[key]));
      if (collision.length) throw new Error("A planned record already exists; restore the original journal or review the collision. No rows were adopted.");
    }
    for (const row of plan.goods) await insert("goods_donations", { ...row, recorded_by: actor });
    for (const row of plan.cash) await insert("cash_donations", { ...row, recorded_by: actor });
    const activities = [];
    for (const row of plan.activities) {
      const id = await insert("activities", { ...row, created_by: actor });
      let status = "DRAFT", revision = 1;
      for (const next of row.transitions) {
        if (!ACTIVITY_TRANSITIONS[status].includes(next)) throw new Error("Invalid fixture transition.");
        const [result] = await connection.execute("UPDATE activities SET status = ?, revision = revision + 1, updated_at = UTC_TIMESTAMP(3) WHERE id = ? AND revision = ?", [next, id, revision]);
        if (result.affectedRows !== 1) throw new Error("Fixture transition failed.");
        await writeAudit(connection, "ACTIVITY_STATUS_CHANGED", actor, id, { previous_status: status, new_status: next, previous_revision: revision, new_revision: revision + 1 });
        status = next; revision++;
      }
      activities.push(id);
    }
    for (const row of plan.volunteers) await insert("volunteers", { ...row, activity_id: activities[row.activityIndex], activity: plan.activities[row.activityIndex].name });
    for (const row of plan.notices) await insert("notices", { ...row, created_by: actor });
    for (const record of records) record.snapshot = await snapshot(connection, record.table, record.id);
    await beforeCommit(records);
    await connection.commit();
    return records;
  } catch (error) { await connection.rollback().catch(() => {}); throw error; }
}

export async function rollbackPresentation(connection, manifest, actor, beforeCommit) {
  await connection.beginTransaction();
  try {
    await actorLock(connection, actor);
    await verifyManifest(connection, manifest);
    // Lock all referencing volunteers; never delete a subsequent signup.
    const volunteerIds = new Set(manifest.rows.filter(row => row.table === "volunteers").map(row => row.id));
    for (const activity of manifest.rows.filter(row => row.table === "activities")) {
      const [linked] = await connection.execute("SELECT CAST(id AS CHAR) AS id FROM volunteers WHERE activity_id = ? FOR UPDATE", [activity.id]);
      if (linked.some(row => !volunteerIds.has(row.id))) throw new Error("Additional volunteers depend on a seeded Activity; rollback is refused.");
    }
    // Reverse insertion order removes linked children before their Activities.
    for (const record of [...manifest.rows].reverse()) {
      if (record.table === "notices") await writeAudit(connection, "NOTICE_DELETED", actor, record.id, { previous_revision: record.snapshot.revision });
      const [result] = await connection.execute(`DELETE FROM ${record.table} WHERE id = ?`, [record.id]);
      if (result.affectedRows !== 1) throw new Error("Unexpected rollback deletion result.");
    }
    await beforeCommit();
    await connection.commit();
  } catch (error) { await connection.rollback().catch(() => {}); throw error; }
}
