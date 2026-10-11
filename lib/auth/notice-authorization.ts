import "server-only";
import type { PoolConnection } from "mysql2/promise";
import { AuthorizationError, requireStaff } from "@/lib/auth/session";

export class NoticeAuthorizationError extends Error {
  constructor() {
    super("Access denied. Only ADMIN can manage CES Staff Notices.");
    this.name = "NoticeAuthorizationError";
  }
}

export async function requireNoticeAdmin(connection?: PoolConnection) {
  try {
    const actor = await requireStaff(connection);
    if (actor.role !== "ADMIN") throw new NoticeAuthorizationError();
    return actor;
  } catch (error) {
    if (error instanceof AuthorizationError) throw new NoticeAuthorizationError();
    throw error;
  }
}
