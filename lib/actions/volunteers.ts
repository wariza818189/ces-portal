"use server";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { volunteerSchema } from "@/lib/validation/volunteers";

export type VolunteerActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<"full_name" | "course_year" | "contact_number" | "activity_id" | "acknowledgement", string[]>>;
};

function logFailure(context: string, error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? error.code : undefined;
  // Raw messages/objects may contain submitted information or SQL.
  console.error(context, {
    code: typeof code === "string" && /^ER_[A-Z0-9_]{1,60}$/.test(code)
      ? code : "UNCLASSIFIED",
  });
}

export async function createVolunteer(
  _previousState: VolunteerActionState,
  formData: FormData,
): Promise<VolunteerActionState> {
  const parsed = volunteerSchema.safeParse({
    full_name: formData.get("full_name"),
    course_year: formData.get("course_year"),
    contact_number: formData.get("contact_number"),
    activity_id: formData.get("activity_id"),
    acknowledgement: formData.get("acknowledgement"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { full_name, course_year, contact_number, activity_id } = parsed.data;
  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute<RowDataPacket[]>("SELECT CAST(id AS CHAR) AS id, name, status FROM activities WHERE id = ? FOR SHARE", [activity_id]);
      if (rows.length !== 1 || rows[0].status !== "ACTIVE") {
        await connection.rollback();
        return { status: "error", message: "Please choose an available Activity.", fieldErrors: { activity_id: ["This Activity is no longer open for registration. Refresh the available Activities and choose another."] } };
      }
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO volunteers (full_name, course_year, contact_number, activity, activity_id) VALUES (?, ?, ?, ?, ?)",
        [full_name, course_year, contact_number, rows[0].name, rows[0].id],
      );
      if (result.affectedRows !== 1) throw new Error("Unexpected volunteer insert result.");
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally { connection.release(); }
  } catch (error) {
    logFailure("Volunteer save failed.", error);
    return {
      status: "error",
      message: "We couldn't confirm whether your submission was saved. Contact CES support before resubmitting to avoid a duplicate.",
      fieldErrors: {},
    };
  }

  let refreshFailed = false;
  for (const path of ["/volunteers", "/dashboard"]) {
    try {
      revalidatePath(path);
    } catch (error) {
      refreshFailed = true;
      logFailure(`Volunteer saved; refresh failed for ${path}.`, error);
    }
  }
  return {
    status: "success",
    message: refreshFailed
      ? "Volunteer submission saved successfully. Some views could not refresh. Your submission is already saved; do not resubmit it."
      : "Volunteer submission saved successfully.",
    fieldErrors: {},
  };
}
