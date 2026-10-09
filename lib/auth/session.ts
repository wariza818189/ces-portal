import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { AUTH_POLICY, isStaffRole, safeReturnPath } from "@/lib/auth/policy.mjs";

export type StaffRole = "ADMIN" | "STAFF";
export type AuthenticatedUser = { id: string; name: string; username: string; role: StaffRole };
export class AuthorizationError extends Error {
  constructor() { super("Staff authentication is required."); this.name = "AuthorizationError"; }
}
export function tokenDigest(token: unknown): Buffer | null {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token)
    ? createHash("sha256").update(token).digest() : null;
}
export async function readSessionDigest() {
  return tokenDigest((await cookies()).get(AUTH_POLICY.cookieName)?.value);
}

export async function getCurrentUser(connection?: PoolConnection): Promise<AuthenticatedUser | null> {
  const digest = await readSessionDigest();
  if (!digest) return null;
  try {
    const executor = connection ?? (await import("@/lib/db")).db;
    const [rows] = await executor.execute<RowDataPacket[]>(
      `SELECT CAST(u.id AS CHAR) AS id, u.name, u.username, u.role
       FROM staff_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP(3) AND u.is_active = 1
       ${connection ? "FOR SHARE" : ""}`, [digest],
    );
    const user = rows.length === 1 ? rows[0] : null;
    if (!user || !isStaffRole(user.role) || typeof user.id !== "string" || !/^[1-9]\d*$/.test(user.id)
      || typeof user.name !== "string" || typeof user.username !== "string") return null;
    return { id: user.id, name: user.name, username: user.username, role: user.role as StaffRole };
  } catch {
    console.error("Staff session verification failed.", { code: "SESSION_UNAVAILABLE" });
    return null;
  }
}

export async function requireUser(returnPath = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeReturnPath(returnPath))}`);
  return user;
}
export async function requireRole(...roles: StaffRole[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) throw new AuthorizationError();
  return user;
}
// Actions use an explicit error, never a redirect swallowed by their SQL catch.
export async function requireStaff(connection?: PoolConnection) {
  const user = await getCurrentUser(connection);
  if (!user) throw new AuthorizationError();
  return user;
}
