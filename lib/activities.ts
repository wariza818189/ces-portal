import "server-only";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { getCesLocationMap } from "@/lib/ces-map";
import { activityDetailsSchema, activityIdSchema, activityStatusSchema, type ActivityDetails, type ActivityStatus } from "@/lib/validation/activities";
import { validRevision } from "@/lib/activity-policy.mjs";

export type Activity = ActivityDetails & { id: string; status: ActivityStatus; revision: number };
export type PublicActivity = Pick<Activity, "id" | "name" | "activity_date" | "venue_name"> & { map: ReturnType<typeof getCesLocationMap> };
const projection = `CAST(id AS CHAR) AS id, name, DATE_FORMAT(activity_date, '%Y-%m-%d') AS activity_date,
  venue_name, CAST(latitude AS CHAR) AS latitude, CAST(longitude AS CHAR) AS longitude`;
function readDetails(row: RowDataPacket): ActivityDetails {
  return activityDetailsSchema.parse({ name: row.name, activity_date: row.activity_date,
    venue_name: row.venue_name ?? "", latitude: row.latitude ?? "", longitude: row.longitude ?? "" });
}
function readActivity(row: RowDataPacket): Activity {
  if (!validRevision(row.revision)) throw new Error("Invalid Activity revision.");
  return { ...readDetails(row), id: activityIdSchema.parse(row.id), status: activityStatusSchema.parse(row.status), revision: row.revision };
}
export function logActivityFailure(context: string, error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  console.error(context, { code: typeof code === "string" && /^ER_[A-Z0-9_]{1,60}$/.test(code) ? code : "UNCLASSIFIED" });
}
export async function listActivities(): Promise<Activity[]> {
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${projection}, status, revision FROM activities
    ORDER BY FIELD(status, 'ACTIVE', 'DRAFT', 'CLOSED', 'ARCHIVED'),
      CASE WHEN status IN ('ACTIVE', 'DRAFT') THEN activity_date END ASC,
      CASE WHEN status IN ('ACTIVE', 'DRAFT') THEN activities.id END ASC,
      CASE WHEN status IN ('CLOSED', 'ARCHIVED') THEN activity_date END DESC,
      CASE WHEN status IN ('CLOSED', 'ARCHIVED') THEN activities.id END DESC`);
  return rows.map(readActivity);
}
export async function listPublicActivities(): Promise<PublicActivity[]> {
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${projection} FROM activities WHERE status = 'ACTIVE' ORDER BY activity_date ASC, activities.id ASC`);
  return rows.map(row => {
    const details = readDetails(row);
    return { id: activityIdSchema.parse(row.id), name: details.name, activity_date: details.activity_date,
      venue_name: details.venue_name, map: getCesLocationMap(details.venue_name ?? undefined, details.latitude ?? undefined, details.longitude ?? undefined) };
  });
}
export async function lockActivity(connection: PoolConnection, id: string): Promise<Activity | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(`SELECT ${projection}, status, revision FROM activities WHERE id = ? FOR UPDATE`, [id]);
  return rows.length === 1 ? readActivity(rows[0]) : null;
}
