import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { Pool, RowDataPacket } from "mysql2/promise";
import { AUTH_POLICY, canonicalUsername, isStaffRole, validPassword } from "@/lib/auth/policy.mjs";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/auth/passwords.mjs";
import { writeAudit } from "@/lib/auth/audit.mjs";

export async function authenticateCredentials(pool: Pool, usernameInput: unknown, passwordInput: unknown) {
  const username = canonicalUsername(usernameInput);
  if (!username || !validPassword(passwordInput)) return null;
  const password = passwordInput as string;
  const key = createHash("sha256").update(`ces-login-v1:${username}`).digest();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Insert/update locks one shared identifier bucket through verification.
    // Concurrent attempts cannot each observe a stale failed-attempt count.
    await connection.execute(
      `INSERT INTO auth_rate_limits (identifier_hash, failures, window_started_at)
       VALUES (?, 0, UTC_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE identifier_hash = identifier_hash`, [key],
    );
    await connection.execute(
      `UPDATE auth_rate_limits SET failures = 0, window_started_at = UTC_TIMESTAMP(3)
       WHERE identifier_hash = ? AND window_started_at <= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL ${AUTH_POLICY.windowMinutes} MINUTE)`, [key],
    );
    const [buckets] = await connection.execute<RowDataPacket[]>(
      "SELECT failures FROM auth_rate_limits WHERE identifier_hash = ? FOR UPDATE", [key],
    );
    if (buckets.length !== 1 || buckets[0].failures >= AUTH_POLICY.maxFailures) {
      // Five failures already have audit events. Do not flood the audit table
      // with additional blocked requests within the same window.
      await connection.commit();
      return null;
    }
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT CAST(id AS CHAR) AS id, password_hash, role, is_active FROM users WHERE username = ? FOR SHARE", [username],
    );
    const user = rows.length === 1 ? rows[0] : null;
    let matches = false;
    try {
      matches = await verifyPassword(user?.password_hash ?? DUMMY_PASSWORD_HASH, password);
    } catch {
      // Malformed stored hashes fail closed without raw error/hash logging.
      await verifyPassword(DUMMY_PASSWORD_HASH, password);
    }
    if (!user || !matches || user.is_active !== 1 || !isStaffRole(user.role)) {
      await connection.execute("UPDATE auth_rate_limits SET failures = failures + 1 WHERE identifier_hash = ?", [key]);
      await writeAudit(connection, "AUTH_LOGIN_FAILURE", null, null);
      await connection.commit();
      return null;
    }
    const token = randomBytes(32).toString("hex");
    const digest = createHash("sha256").update(token).digest();
    await connection.execute(
      `INSERT INTO staff_sessions (token_hash, user_id, created_at, expires_at)
       VALUES (?, ?, UTC_TIMESTAMP(3), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL ${AUTH_POLICY.sessionSeconds} SECOND))`, [digest, user.id],
    );
    await connection.execute("UPDATE auth_rate_limits SET failures = 0, window_started_at = UTC_TIMESTAMP(3) WHERE identifier_hash = ?", [key]);
    await writeAudit(connection, "AUTH_LOGIN_SUCCESS", user.id, user.id);
    await connection.commit();
    return token;
  } catch {
    await connection.rollback().catch(() => {});
    throw new Error("Authentication unavailable.");
  } finally {
    connection.release();
  }
}
