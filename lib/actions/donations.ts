"use server";

import type { ResultSetHeader } from "mysql2";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApplicationTimeZoneError } from "@/lib/date";
import { goodsDonationSchema } from "@/lib/validation/donations";

export type GoodsDonationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: {
    category?: string[];
    quantity?: string[];
    unit?: string[];
    dateReceived?: string[];
    expiryDate?: string[];
  };
};

function logFailure(context: string, error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? error.code
    : undefined;
  // Do not log raw messages: database errors can contain SQL or submitted data.
  console.error(context, {
    code: error instanceof ApplicationTimeZoneError
      ? "APP_TIME_ZONE_CONFIGURATION"
      : typeof code === "string" && /^ER_[A-Z0-9_]{1,60}$/.test(code)
        ? code
        : "UNCLASSIFIED",
  });
}

export async function createGoodsDonation(
  _previousState: GoodsDonationActionState,
  formData: FormData,
): Promise<GoodsDonationActionState> {
  let parsed: ReturnType<typeof goodsDonationSchema.safeParse>;
  try {
    parsed = goodsDonationSchema.safeParse({
      category: formData.get("category"),
      quantity: formData.get("quantity"),
      unit: formData.get("unit"),
      dateReceived: formData.get("dateReceived"),
      expiryDate: formData.get("expiryDate"),
    });
  } catch (error) {
    logFailure("Goods donation validation unavailable.", error);
    return {
      status: "error",
      message: "We couldn't validate the donation. Please contact CES support.",
      fieldErrors: {},
    };
  }

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;

    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const {
    category,
    quantity,
    unit,
    dateReceived,
    expiryDate,
  } = parsed.data;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `
        INSERT INTO goods_donations (
          category,
          quantity,
          unit,
          expiry_date,
          date_received
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        category,
        quantity,
        unit,
        expiryDate,
        dateReceived,
      ],
    );

    if (result.affectedRows !== 1) {
      throw new Error(
        "Goods donation insert did not affect exactly one row.",
      );
    }
  } catch (error) {
    logFailure("Failed to create goods donation.", error);

    return {
      status: "error",
      message:
        "We couldn't save the goods donation. Please try again.",
      fieldErrors: {},
    };
  }

  let refreshFailed = false;
  for (const path of ["/dashboard", "/inventory"]) {
    try {
      revalidatePath(path);
    } catch (error) {
      refreshFailed = true;
      logFailure(`Goods donation saved; refresh failed for ${path}.`, error);
    }
  }

  const hasExpiryWarning = expiryDate < dateReceived;
  const message = hasExpiryWarning
    ? "Goods donation saved. Note: the expiry date is earlier than the recorded received date."
    : "Goods donation saved successfully.";

  return {
    status: "success",
    message: refreshFailed
      ? `${message} Some views could not refresh. The donation is saved; do not resubmit it.`
      : message,
    fieldErrors: {},
  };
}
