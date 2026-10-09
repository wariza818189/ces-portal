"use server";

import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth/session";
import { writeAudit } from "@/lib/auth/audit.mjs";
import { ACTIVITY_FIELDS, ACTIVITY_TRANSITIONS } from "@/lib/activity-policy.mjs";
import { lockActivity, logActivityFailure } from "@/lib/activities";
import { activityDetailsSchema, activityMutationSchema, activityTransitionSchema } from "@/lib/validation/activities";

export type ActivityActionState = {
  status: "idle" | "success" | "error";
  message: string;
  revision?: number;
  fieldErrors: Partial<Record<"name" | "activity_date" | "venue_name" | "latitude" | "longitude" | "id" | "revision" | "status", string[]>>;
};
const stale = "This Activity changed since you opened it. Reload and review the latest details.";
class ActivityConflict extends Error {}
function details(form: FormData) {
  return Object.fromEntries(ACTIVITY_FIELDS.map(field => [field, form.get(field) ?? ""]));
}
async function mutate(work: (connection: PoolConnection, actorId: string) => Promise<string | { message: string; revision: number }>): Promise<ActivityActionState> {
  try { await requireStaff(); } catch { return { status: "error", message: "Staff sign in is required to manage Activities.", fieldErrors: {} }; }
  let outcome: string | { message: string; revision: number };
  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const actor = await requireStaff(connection);
      outcome = await work(connection, actor.id);
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally { connection.release(); }
  } catch (error) {
    if (error instanceof ActivityConflict) return { status: "error", message: error.message, fieldErrors: {} };
    logActivityFailure("Activity save failed.", error);
    return { status: "error", message: "We couldn't confirm whether the Activity change was saved. Contact CES support before resubmitting if the result is uncertain.", fieldErrors: {} };
  }
  const message = typeof outcome === "string" ? outcome : outcome.message;
  const revision = typeof outcome === "string" ? undefined : outcome.revision;
  let refreshFailed = false;
  for (const path of ["/activities", "/volunteer"]) {
    try { revalidatePath(path); } catch (error) { refreshFailed = true; logActivityFailure("Activity saved; refresh failed.", error); }
  }
  return { status: "success", revision, message: refreshFailed ? `${message} Some views could not refresh. The result is confirmed; do not resubmit it.` : message, fieldErrors: {} };
}
async function authorized() {
  try { await requireStaff(); return null; } catch { return { status: "error", message: "Staff sign in is required to manage Activities.", fieldErrors: {} } as ActivityActionState; }
}
export async function createActivity(_state: ActivityActionState, form: FormData): Promise<ActivityActionState> {
  const denied = await authorized(); if (denied) return denied;
  const parsed = activityDetailsSchema.safeParse(details(form));
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  return mutate(async (connection, actorId) => {
    const d = parsed.data;
    const [result] = await connection.execute<ResultSetHeader>(`INSERT INTO activities (name, activity_date, venue_name, latitude, longitude, created_by) VALUES (?, ?, ?, ?, ?, ?)`, [d.name, d.activity_date, d.venue_name, d.latitude, d.longitude, actorId]);
    if (result.affectedRows !== 1) throw new Error("Unexpected Activity insert result.");
    const [[row]] = await connection.query<RowDataPacket[]>("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
    await writeAudit(connection, "ACTIVITY_CREATED", actorId, row.id);
    return "Activity created as Draft.";
  });
}
export async function editActivity(_state: ActivityActionState, form: FormData): Promise<ActivityActionState> {
  const denied = await authorized(); if (denied) return denied;
  const identity = activityMutationSchema.safeParse({ id: form.get("id"), revision: form.get("revision") });
  const parsed = activityDetailsSchema.safeParse(details(form));
  if (!identity.success || !parsed.success) return { status: "error", message: "Please check the highlighted fields.", fieldErrors: { ...(!identity.success ? z.flattenError(identity.error).fieldErrors : {}), ...(!parsed.success ? z.flattenError(parsed.error).fieldErrors : {}) } };
  return mutate(async (connection, actorId) => {
    const current = await lockActivity(connection, identity.data.id);
    if (!current) throw new ActivityConflict("Activity not found. Reload the workspace.");
    if (current.revision !== identity.data.revision) throw new ActivityConflict(stale);
    if (!["DRAFT", "ACTIVE"].includes(current.status)) throw new ActivityConflict("Closed and Archived Activity details are read-only.");
    const changes: Record<string, { before: string | null; after: string | null }> = {};
    for (const field of ACTIVITY_FIELDS as readonly (keyof typeof parsed.data)[]) {
      if (current[field] !== parsed.data[field]) changes[field] = { before: current[field], after: parsed.data[field] };
    }
    if (!Object.keys(changes).length) return { message: "No Activity details changed.", revision: current.revision };
    if (current.revision === 4294967295) throw new ActivityConflict("Activity revision limit reached. Contact CES support.");
    const d = parsed.data;
    const [result] = await connection.execute<ResultSetHeader>(`UPDATE activities SET name = ?, activity_date = ?, venue_name = ?, latitude = ?, longitude = ?, revision = revision + 1, updated_at = UTC_TIMESTAMP(3) WHERE id = ? AND revision = ?`, [d.name, d.activity_date, d.venue_name, d.latitude, d.longitude, current.id, current.revision]);
    if (result.affectedRows !== 1) throw new Error("Unexpected Activity update result.");
    await writeAudit(connection, "ACTIVITY_UPDATED", actorId, current.id, { changes, previous_revision: current.revision, new_revision: current.revision + 1 });
    return { message: "Activity details saved. Existing Volunteer Activity-name snapshots are unchanged.", revision: current.revision + 1 };
  });
}
export async function changeActivityStatus(_state: ActivityActionState, form: FormData): Promise<ActivityActionState> {
  const denied = await authorized(); if (denied) return denied;
  const parsed = activityTransitionSchema.safeParse({ id: form.get("id"), revision: form.get("revision"), status: form.get("status") });
  if (!parsed.success) return { status: "error", message: "Invalid Activity status request.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  return mutate(async (connection, actorId) => {
    const current = await lockActivity(connection, parsed.data.id);
    if (!current) throw new ActivityConflict("Activity not found. Reload the workspace.");
    if (current.revision !== parsed.data.revision) throw new ActivityConflict(stale);
    if (current.status === parsed.data.status) return "Activity status is already unchanged.";
    if (!(ACTIVITY_TRANSITIONS[current.status] as readonly string[]).includes(parsed.data.status)) throw new ActivityConflict("This status transition is not allowed.");
    if (current.revision === 4294967295) throw new ActivityConflict("Activity revision limit reached. Contact CES support.");
    const [result] = await connection.execute<ResultSetHeader>(`UPDATE activities SET status = ?, revision = revision + 1, updated_at = UTC_TIMESTAMP(3) WHERE id = ? AND revision = ?`, [parsed.data.status, current.id, current.revision]);
    if (result.affectedRows !== 1) throw new Error("Unexpected Activity transition result.");
    await writeAudit(connection, "ACTIVITY_STATUS_CHANGED", actorId, current.id, { previous_status: current.status, new_status: parsed.data.status, previous_revision: current.revision, new_revision: current.revision + 1 });
    return `Activity status changed to ${parsed.data.status.charAt(0) + parsed.data.status.slice(1).toLowerCase()}.`;
  });
}
