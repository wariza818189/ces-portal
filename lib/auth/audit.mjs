const eventRules = Object.freeze({
  AUTH_LOGIN_SUCCESS: ["USER", "SUCCESS", null],
  AUTH_LOGIN_FAILURE: ["AUTH", "FAILURE", "INVALID_CREDENTIALS"],
  AUTH_LOGOUT: ["USER", "SUCCESS", null],
  GOODS_DONATION_CREATED: ["GOODS_DONATION", "SUCCESS", null],
  CASH_DONATION_CREATED: ["CASH_DONATION", "SUCCESS", null],
  ADMIN_BOOTSTRAPPED: ["USER", "SUCCESS", null],
});

/**
 * Deliberately no caller-supplied metadata/body parameter in R1.
 * @param {import("mysql2/promise").PoolConnection} connection
 * @param {keyof typeof eventRules} event
 * @param {string | null} actorId
 * @param {string | null} entityId
 */
export async function writeAudit(connection, event, actorId, entityId) {
  const rule = Object.hasOwn(eventRules, event) ? eventRules[event] : null;
  if (!rule || (actorId !== null && !/^[1-9]\d*$/.test(actorId))
    || (entityId !== null && !/^[1-9]\d*$/.test(entityId))) {
    throw new Error("Invalid audit event.");
  }
  const [entityType, outcome, reasonCode] = rule;
  if ((event === "ADMIN_BOOTSTRAPPED" || event === "AUTH_LOGIN_FAILURE") && actorId !== null) {
    throw new Error("Invalid audit actor.");
  }
  if (event === "AUTH_LOGIN_FAILURE" && entityId !== null) throw new Error("Invalid failure subject.");
  if (event !== "AUTH_LOGIN_FAILURE" && entityId === null) throw new Error("Missing audit subject.");
  if (event !== "AUTH_LOGIN_FAILURE" && event !== "ADMIN_BOOTSTRAPPED" && actorId === null) throw new Error("Missing audit actor.");
  const [result] = await connection.execute(
    `INSERT INTO audit_logs (actor_user_id, event_type, entity_type, entity_id, outcome, reason_code, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, UTC_TIMESTAMP(3))`,
    [actorId, event, entityType, entityId, outcome, reasonCode],
  );
  if (/** @type {import("mysql2").ResultSetHeader} */ (result).affectedRows !== 1) {
    throw new Error("Audit insert failed.");
  }
}
