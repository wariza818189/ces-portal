import { z } from "zod";

export const noticeIdSchema = z.string().regex(/^[1-9][0-9]{0,19}$/, "Invalid Notice ID.")
  .refine(value => /^[1-9][0-9]{0,19}$/.test(value) && BigInt(value) <= BigInt("18446744073709551615"), "Invalid Notice ID.");
export const noticeRevisionSchema = z.string().regex(/^[1-9][0-9]{0,9}$/, "Invalid Notice revision.")
  .refine(value => /^[1-9][0-9]{0,9}$/.test(value) && BigInt(value) <= BigInt("4294967295"), "Invalid Notice revision.")
  .transform(Number);

export const noticeTitleSchema = z.string()
  .refine(value => !/\p{Cc}/u.test(value), "Title cannot contain control characters.")
  .transform(value => value.trim())
  .refine(value => Array.from(value).length >= 1 && Array.from(value).length <= 120,
    "Enter a title of 1–120 characters.");
export const noticeMessageSchema = z.string()
  .transform(value => value.replace(/\r\n?/g, "\n"))
  .refine(value => !/[\p{Cc}]/u.test(value.replace(/[\n\t]/g, "")),
    "Message contains unsupported control characters.")
  .transform(value => value.trim())
  .refine(value => Array.from(value).length >= 1 && Array.from(value).length <= 2000,
    "Enter a message of 1–2000 characters.");
export const noticeCreateSchema = z.object({ title: noticeTitleSchema, message: noticeMessageSchema });
export const noticeMutationSchema = z.object({ id: noticeIdSchema, revision: noticeRevisionSchema });
export const noticeEditSchema = noticeCreateSchema.extend(noticeMutationSchema.shape);
export type NoticeField = "id" | "revision" | "title" | "message";

// Missing, duplicate, and file-valued scalar fields all fail the same schemas.
// Extra fields never reach persistence; identity comes only from the session.
export function readNoticeForm(form: FormData, fields: readonly NoticeField[]) {
  return Object.fromEntries(fields.map(field => {
    const values = form instanceof FormData ? form.getAll(field) : [];
    return [field, values.length === 1 && typeof values[0] === "string" ? values[0] : undefined];
  }));
}
