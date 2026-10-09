"use server";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApplicationTimeZoneError } from "@/lib/date";
import { cashDonationSchema, goodsDonationSchema } from "@/lib/validation/donations";
import { requireStaff } from "@/lib/auth/session";
import { writeAudit } from "@/lib/auth/audit.mjs";

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
  try {
    await requireStaff();
  } catch {
    return { status: "error", message: "Staff sign in is required to save donations.", fieldErrors: {} };
  }
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
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Recheck and lock the session/user in the write transaction so logout
      // and deactivation cannot race an already-authorized donation write.
      const user = await requireStaff(connection);
      const [result] = await connection.execute<ResultSetHeader>(
        `
          INSERT INTO goods_donations (
            category,
            quantity,
            unit,
            expiry_date,
            date_received,
            recorded_by
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          category,
          quantity,
          unit,
          expiryDate,
          dateReceived,
          user.id,
        ],
      );

      if (result.affectedRows !== 1) {
        throw new Error(
          "Goods donation insert did not affect exactly one row.",
        );
      }
      const [[identity]] = await connection.query<RowDataPacket[]>("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
      await writeAudit(connection, "GOODS_DONATION_CREATED", user.id, identity.id);
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    logFailure("Failed to create goods donation.", error);

    return {
      status: "error",
      message:
        "We couldn't confirm the goods donation was saved. Contact CES support before resubmitting if the save result is uncertain.",
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


export type CashDonationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: {
    amount?: string[];
    dateReceived?: string[];
    notes?: string[];
  };
};

export async function createCashDonation(
  _previousState: CashDonationActionState,
  formData: FormData,
): Promise<CashDonationActionState> {
  try {
    await requireStaff();
  } catch {
    return { status: "error", message: "Staff sign in is required to save donations.", fieldErrors: {} };
  }
  let parsed: ReturnType<typeof cashDonationSchema.safeParse>;
  try {
    parsed = cashDonationSchema.safeParse({
      amount: formData.get("amount"),
      dateReceived: formData.get("dateReceived"),
      notes: formData.get("notes") ?? "",
    });
  } catch (error) {
    logFailure("Cash donation validation unavailable.", error);
    return {
      status: "error",
      message: "We couldn't validate the donation. Please contact CES support.",
      fieldErrors: {},
    };
  }
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { amount, dateReceived, notes } = parsed.data;
  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const user = await requireStaff(connection);
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO cash_donations (amount, date_received, notes, recorded_by) VALUES (?, ?, ?, ?)",
        [amount, dateReceived, notes, user.id],
      );
      if (result.affectedRows !== 1) {
        throw new Error("Cash donation insert did not affect exactly one row.");
      }
      const [[identity]] = await connection.query<RowDataPacket[]>("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
      await writeAudit(connection, "CASH_DONATION_CREATED", user.id, identity.id);
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    logFailure("Failed to create cash donation.", error);
    return {
      status: "error",
      message: "We couldn't save the cash donation. Please contact CES support before resubmitting if the save result is uncertain.",
      fieldErrors: {},
    };
  }

  // Persistence is already confirmed. A refresh failure must not invite a duplicate.
  let refreshFailed = false;
  try {
    revalidatePath("/dashboard");
  } catch (error) {
    refreshFailed = true;
    logFailure("Cash donation saved; dashboard refresh failed.", error);
  }
  return {
    status: "success",
    message: refreshFailed
      ? "Cash donation saved successfully. The dashboard could not refresh. The donation is saved; do not resubmit it."
      : "Cash donation saved successfully.",
    fieldErrors: {},
  };
}
