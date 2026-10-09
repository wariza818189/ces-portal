"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import { AUTH_POLICY, safeReturnPath } from "@/lib/auth/policy.mjs";
import { authenticateCredentials } from "@/lib/auth/login";
import { readSessionDigest } from "@/lib/auth/session";
import { writeAudit } from "@/lib/auth/audit.mjs";

export type LoginState = { message: string };
export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  let token: string | null;
  try {
    const { db } = await import("@/lib/db");
    token = await authenticateCredentials(db, formData.get("username"), formData.get("password"));
  } catch {
    console.error("Staff sign-in failed.", { code: "AUTH_UNAVAILABLE" });
    return { message: "Unable to sign in with those credentials." };
  }
  if (!token) return { message: "Unable to sign in with those credentials." };
  (await cookies()).set(AUTH_POLICY.cookieName, token, {
    httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_POLICY.sessionSeconds,
  });
  redirect(safeReturnPath(formData.get("next")));
}

export type LogoutState = { message: string };
export async function logout(): Promise<LogoutState> {
  const digest = await readSessionDigest();
  if (digest) {
    try {
      const { db } = await import("@/lib/db");
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.execute<RowDataPacket[]>(
          "SELECT CAST(user_id AS CHAR) AS user_id FROM staff_sessions WHERE token_hash = ? FOR UPDATE", [digest],
        );
        await connection.execute("DELETE FROM staff_sessions WHERE token_hash = ?", [digest]);
        if (rows.length === 1) await writeAudit(connection, "AUTH_LOGOUT", rows[0].user_id, rows[0].user_id);
        await connection.commit();
      } catch {
        await connection.rollback().catch(() => {});
        throw new Error("Logout unavailable.");
      } finally {
        connection.release();
      }
    } catch {
      console.error("Staff sign-out failed.", { code: "LOGOUT_UNAVAILABLE" });
      // Keep the cookie so the user can retry server-side invalidation.
      return { message: "Unable to complete sign out. Please try again." };
    }
  }
  (await cookies()).set(AUTH_POLICY.cookieName, "", {
    httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 0,
  });
  redirect("/login");
}
