import "server-only";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/session";
import { requireNoticeAdmin } from "@/lib/auth/notice-authorization";
import { noticeIdSchema, noticeTitleSchema, noticeMessageSchema } from "@/lib/validation/notices";

const timestampSchema = z.string().regex(/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/)
  .refine(value => {
    const date = new Date(value.replace(" ", "T") + "Z");
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 19).replace("T", " ") === value;
  });
const noticeRowSchema = z.object({
  id: noticeIdSchema, title: noticeTitleSchema, message: noticeMessageSchema,
  created_at: timestampSchema, updated_at: timestampSchema,
  revision: z.number().int().min(1).max(4294967295),
});
export type Notice = z.infer<typeof noticeRowSchema>;
const projection = `CAST(id AS CHAR) AS id, title, message,
  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
  DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at, revision`;
function readNotice(row: RowDataPacket): Notice {
  const parsed = noticeRowSchema.safeParse(row);
  // Stored malformed/noncanonical text must fail, never be silently normalized.
  if (!parsed.success || parsed.data.title !== row.title || parsed.data.message !== row.message) {
    throw new Error("Invalid stored Notice.");
  }
  return parsed.data;
}

// Request/session authorization precedes each uncached read. Timestamps are UTC.
export async function listNotices(): Promise<Notice[]> {
  await requireStaff();
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${projection} FROM notices ORDER BY updated_at DESC, id DESC`);
  return rows.map(readNotice);
}

// Used inside mutation transactions; independently rechecks ADMIN on that connection.
export async function lockNotice(connection: PoolConnection, id: string): Promise<Notice | null> {
  await requireNoticeAdmin(connection);
  const validId = noticeIdSchema.parse(id);
  const [rows] = await connection.execute<RowDataPacket[]>(`SELECT ${projection} FROM notices WHERE id = ? FOR UPDATE`, [validId]);
  if (rows.length > 1) throw new Error("Unexpected Notice read result.");
  return rows.length === 1 ? readNotice(rows[0]) : null;
}
