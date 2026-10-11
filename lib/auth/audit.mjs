import { ACTIVITY_FIELDS, ACTIVITY_STATUSES, ACTIVITY_TRANSITIONS, validRevision, validStoredCoordinate } from "../activity-policy.mjs";

const eventRules = Object.freeze({
  AUTH_LOGIN_SUCCESS: ["USER", "SUCCESS", null],
  AUTH_LOGIN_FAILURE: ["AUTH", "FAILURE", "INVALID_CREDENTIALS"],
  AUTH_LOGOUT: ["USER", "SUCCESS", null],
  GOODS_DONATION_CREATED: ["GOODS_DONATION", "SUCCESS", null],
  CASH_DONATION_CREATED: ["CASH_DONATION", "SUCCESS", null],
  ACTIVITY_CREATED: ["ACTIVITY", "SUCCESS", null],
  ACTIVITY_UPDATED: ["ACTIVITY", "SUCCESS", null],
  ACTIVITY_STATUS_CHANGED: ["ACTIVITY", "SUCCESS", null],
  NOTICE_CREATED: ["NOTICE", "SUCCESS", null],
  NOTICE_UPDATED: ["NOTICE", "SUCCESS", null],
  NOTICE_DELETED: ["NOTICE", "SUCCESS", null],
  ADMIN_BOOTSTRAPPED: ["USER", "SUCCESS", null],
});

/**
 * Event-specific validation bounds Activity and Notice metadata. R1 metadata must stay NULL.
 * @param {import("mysql2/promise").PoolConnection} connection
 * @param {keyof typeof eventRules} event
 * @param {string | null} actorId
 * @param {string | null} entityId
 * @param {unknown} metadata
 */
export async function writeAudit(connection, event, actorId, entityId, metadata = null) {
  const rule = Object.hasOwn(eventRules, event) ? eventRules[event] : null;
  if (!rule || (actorId !== null && !/^[1-9]\d*$/.test(actorId))
    || (entityId !== null && !/^[1-9]\d*$/.test(entityId))) {
    throw new Error("Invalid audit event.");
  }
  const safeMetadata = validateMetadata(event, metadata);
  const [entityType, outcome, reasonCode] = rule;
  if ((event === "ADMIN_BOOTSTRAPPED" || event === "AUTH_LOGIN_FAILURE") && actorId !== null) {
    throw new Error("Invalid audit actor.");
  }
  if (event === "AUTH_LOGIN_FAILURE" && entityId !== null) throw new Error("Invalid failure subject.");
  if (event !== "AUTH_LOGIN_FAILURE" && entityId === null) throw new Error("Missing audit subject.");
  if (event !== "AUTH_LOGIN_FAILURE" && event !== "ADMIN_BOOTSTRAPPED" && actorId === null) throw new Error("Missing audit actor.");
  const [result] = await connection.execute(
    `INSERT INTO audit_logs (actor_user_id, event_type, entity_type, entity_id, outcome, reason_code, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3))`,
    [actorId, event, entityType, entityId, outcome, reasonCode, safeMetadata === null ? null : JSON.stringify(safeMetadata)],
  );
  if (/** @type {import("mysql2").ResultSetHeader} */ (result).affectedRows !== 1) {
    throw new Error("Audit insert failed.");
  }
}

/** @param {unknown} value */
function object(value) { return value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype; }
/** @param {any} value @param {string[]} keys */
function exactKeys(value, keys) { return object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key)); }
/** @param {string} field @param {unknown} value */
function validField(field, value) {
  if (field === "latitude" || field === "longitude") return validStoredCoordinate(value, field === "latitude" ? 90 : 180);
  if (field === "venue_name" && value === null) return true;
  if (typeof value !== "string" || !value || value !== value.trim() || /\p{Cc}/u.test(value)) return false;
  if (field === "activity_date") return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= "1000-01-01" && value <= "9999-12-31"
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  return Array.from(value).length <= (field === "name" ? 150 : 250) && (field === "name" || !/[<>]/u.test(value));
}
/** @param {string} event @param {any} metadata */
function validateMetadata(event, metadata) {
  if (event === "NOTICE_DELETED") {
    if (!exactKeys(metadata, ["previous_revision"]) || !validRevision(metadata.previous_revision)) throw new Error("Invalid Notice delete metadata.");
    return { previous_revision: metadata.previous_revision };
  }
  if (event === "NOTICE_UPDATED") {
    const fields = ["title", "message"];
    if (!exactKeys(metadata, ["changed_fields", "previous_revision", "new_revision"])
      || !Array.isArray(metadata.changed_fields) || !metadata.changed_fields.length
      || Array.from(metadata.changed_fields).some(field => !fields.includes(field))
      || new Set(metadata.changed_fields).size !== metadata.changed_fields.length
      || !validRevision(metadata.previous_revision) || !validRevision(metadata.new_revision)
      || metadata.new_revision !== metadata.previous_revision + 1) throw new Error("Invalid Notice update metadata.");
    return { changed_fields: fields.filter(field => metadata.changed_fields.includes(field)), previous_revision: metadata.previous_revision, new_revision: metadata.new_revision };
  }
  if (!["ACTIVITY_UPDATED", "ACTIVITY_STATUS_CHANGED"].includes(event)) {
    if (metadata !== null) throw new Error("This audit event requires NULL metadata.");
    return null;
  }
  const revisionKeys = ["previous_revision", "new_revision"];
  if (!exactKeys(metadata, [...revisionKeys, ...(event === "ACTIVITY_UPDATED" ? ["changes"] : ["previous_status", "new_status"])])
    || !validRevision(metadata.previous_revision) || !validRevision(metadata.new_revision)
    || metadata.new_revision !== metadata.previous_revision + 1) throw new Error("Invalid audit revision metadata.");
  if (event === "ACTIVITY_STATUS_CHANGED") {
    if (!ACTIVITY_STATUSES.includes(metadata.previous_status) || !ACTIVITY_STATUSES.includes(metadata.new_status)
      || !ACTIVITY_TRANSITIONS[metadata.previous_status].includes(metadata.new_status)) throw new Error("Invalid audit status metadata.");
    return { previous_status: metadata.previous_status, new_status: metadata.new_status, previous_revision: metadata.previous_revision, new_revision: metadata.new_revision };
  }
  if (!object(metadata.changes) || !Object.keys(metadata.changes).length || Object.keys(metadata.changes).some(field => !ACTIVITY_FIELDS.includes(field))) throw new Error("Invalid audit change fields.");
  const changes = {};
  for (const field of ACTIVITY_FIELDS) {
    if (!Object.hasOwn(metadata.changes, field)) continue;
    const change = metadata.changes[field];
    if (!exactKeys(change, ["before", "after"]) || !validField(field, change.before) || !validField(field, change.after) || change.before === change.after) throw new Error("Invalid audit field change.");
    changes[field] = { before: change.before, after: change.after };
  }
  return { changes, previous_revision: metadata.previous_revision, new_revision: metadata.new_revision };
}
