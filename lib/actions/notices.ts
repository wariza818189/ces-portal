"use server";

import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireNoticeAdmin, NoticeAuthorizationError } from "@/lib/auth/notice-authorization";
import { writeAudit } from "@/lib/auth/audit.mjs";
import { lockNotice } from "@/lib/notices";
import { noticeCreateSchema, noticeEditSchema, noticeMutationSchema, noticeIdSchema, readNoticeForm, type NoticeField } from "@/lib/validation/notices";

export type NoticeActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<NoticeField, string[]>>;
  id?: string;
  revision?: number;
};
type Outcome = { message: string; id: string; revision: number; changed: boolean };
class NoticeConflict extends Error {}
const stale = "This Notice changed since you opened it. Reload and review the latest Notice.";
const uncertain = "We couldn't confirm whether the Notice change was saved. Check the current Notice before retrying.";
function failure(error: unknown): NoticeActionState {
  return { status: "error", fieldErrors: {}, message:
    error instanceof NoticeAuthorizationError || error instanceof NoticeConflict ? error.message : uncertain };
}
async function authorized(): Promise<NoticeActionState | null> {
  try { await requireNoticeAdmin(); return null; } catch (error) { return failure(error); }
}
function invalid(error: z.ZodError): NoticeActionState {
  return { status: "error", message: "Please check the highlighted fields.", fieldErrors: z.flattenError(error).fieldErrors };
}
async function mutate(work: (connection: PoolConnection, actorId: string) => Promise<Outcome>): Promise<NoticeActionState> {
  let outcome: Outcome;
  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const actor = await requireNoticeAdmin(connection);
      // Validate the session-derived actor ID before mutation and audit as well.
      const actorId = noticeIdSchema.parse(actor.id);
      outcome = await work(connection, actorId);
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally { connection.release(); }
  } catch (error) { return failure(error); }
  let refreshFailed = false;
  if (outcome.changed) {
    for (const path of ["/notices", "/admin/notices"]) {
      try { revalidatePath(path); } catch { refreshFailed = true; }
    }
  }
  return { status: "success", fieldErrors: {}, id: outcome.id, revision: outcome.revision,
    message: refreshFailed
      ? `${outcome.message} Some views could not refresh. Reload them; the result is confirmed, so do not resubmit it.`
      : outcome.message };
}

export async function createNotice(_state: NoticeActionState, form: FormData): Promise<NoticeActionState> {
  const denied = await authorized(); if (denied) return denied;
  const parsed = noticeCreateSchema.safeParse(readNoticeForm(form, ["title", "message"]));
  if (!parsed.success) return invalid(parsed.error);
  return mutate(async (connection, actorId) => {
    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO notices (title, message, created_by) VALUES (?, ?, ?)",
      [parsed.data.title, parsed.data.message, actorId]);
    if (result.affectedRows !== 1) throw new Error("Unexpected Notice insert result.");
    const [rows] = await connection.execute<RowDataPacket[]>("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
    if (rows.length !== 1) throw new Error("Unexpected Notice identity result.");
    const id = noticeIdSchema.parse(rows[0].id);
    await writeAudit(connection, "NOTICE_CREATED", actorId, id);
    return { message: "Notice created.", id, revision: 1, changed: true };
  });
}
export async function editNotice(_state: NoticeActionState, form: FormData): Promise<NoticeActionState> {
  const denied = await authorized(); if (denied) return denied;
  const parsed = noticeEditSchema.safeParse(readNoticeForm(form, ["id", "revision", "title", "message"]));
  if (!parsed.success) return invalid(parsed.error);
  return mutate(async (connection, actorId) => {
    const d = parsed.data;
    const current = await lockNotice(connection, d.id);
    if (!current) throw new NoticeConflict("Notice not found. Reload the Notices workspace.");
    if (current.revision !== d.revision) throw new NoticeConflict(stale);
    const changed_fields = (["title", "message"] as const).filter(field => current[field] !== d[field]);
    if (!changed_fields.length) return { message: "No Notice details changed.", id: current.id, revision: current.revision, changed: false };
    if (current.revision === 4294967295) throw new NoticeConflict("Notice revision limit reached. Contact CES support.");
    const [result] = await connection.execute<ResultSetHeader>(
      "UPDATE notices SET title = ?, message = ?, updated_at = UTC_TIMESTAMP(3), revision = revision + 1 WHERE id = ? AND revision = ?",
      [d.title, d.message, current.id, current.revision]);
    if (result.affectedRows !== 1) throw new Error("Unexpected Notice update result.");
    const revision = current.revision + 1;
    await writeAudit(connection, "NOTICE_UPDATED", actorId, current.id,
      { changed_fields, previous_revision: current.revision, new_revision: revision });
    return { message: "Notice saved.", id: current.id, revision, changed: true };
  });
}
export async function deleteNotice(_state: NoticeActionState, form: FormData): Promise<NoticeActionState> {
  const denied = await authorized(); if (denied) return denied;
  const parsed = noticeMutationSchema.safeParse(readNoticeForm(form, ["id", "revision"]));
  if (!parsed.success) return invalid(parsed.error);
  return mutate(async (connection, actorId) => {
    const current = await lockNotice(connection, parsed.data.id);
    if (!current) throw new NoticeConflict("Notice not found. Reload the Notices workspace.");
    if (current.revision !== parsed.data.revision) throw new NoticeConflict(stale);
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM notices WHERE id = ? AND revision = ?", [current.id, current.revision]);
    if (result.affectedRows !== 1) throw new Error("Unexpected Notice delete result.");
    await writeAudit(connection, "NOTICE_DELETED", actorId, current.id, { previous_revision: current.revision });
    return { message: "Notice deleted.", id: current.id, revision: current.revision, changed: true };
  });
}
