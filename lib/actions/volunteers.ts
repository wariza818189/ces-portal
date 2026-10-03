"use server";

import type { ResultSetHeader } from "mysql2";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { volunteerSchema } from "@/lib/validation/volunteers";

export type VolunteerActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<"full_name" | "course_year" | "contact_number" | "activity" | "acknowledgement", string[]>>;
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
    activity: formData.get("activity"),
    acknowledgement: formData.get("acknowledgement"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { full_name, course_year, contact_number, activity } = parsed.data;
  try {
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO volunteers (full_name, course_year, contact_number, activity) VALUES (?, ?, ?, ?)",
      [full_name, course_year, contact_number, activity],
    );
    if (result.affectedRows !== 1) {
      throw new Error("Unexpected volunteer insert result.");
    }
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
