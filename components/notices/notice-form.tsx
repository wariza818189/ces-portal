"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Notice } from "@/lib/notices";
import { createNotice, editNotice, type NoticeActionState } from "@/lib/actions/notices";
import { donationFieldStyles, donationFeedbackStyles } from "@/components/donations/form-styles";
import { buttonStyles } from "@/components/ui/button-styles";

const blank = { title: "", message: "" };
type State = NoticeActionState & { values: typeof blank; formRevision: number; expectedRevision: number };
export function NoticeForm({ notice }: { notice?: Notice }) {
  const initial: State = { status: "idle", message: "", fieldErrors: {}, formRevision: 0,
    expectedRevision: notice?.revision ?? 1, values: notice ? { title: notice.title, message: notice.message } : blank };
  const [state, action, pending] = useActionState(async (previous: State, form: FormData): Promise<State> => {
    const values = { title: String(form.get("title") ?? ""), message: String(form.get("message") ?? "") };
    const result = await (notice ? editNotice : createNotice)(previous, form);
    return { ...result, formRevision: previous.formRevision + 1,
      expectedRevision: result.status === "success" ? result.revision ?? previous.expectedRevision : previous.expectedRevision,
      values: result.status === "success" && !notice ? blank : values };
  }, initial);
  const prefix = notice ? `edit-${notice.id}` : "create";
  return <form key={state.formRevision} action={action} aria-busy={pending} className="space-y-5">
    {notice && <><input type="hidden" name="id" value={notice.id} /><input type="hidden" name="revision" value={state.expectedRevision} />
      <p className="text-sm text-muted-foreground">Editing revision {state.expectedRevision}. If this Notice changes elsewhere, reload and review before retrying.</p></>}
    {state.message && <p role={state.status === "error" ? "alert" : "status"} className={donationFeedbackStyles(state.status, state.message)}>{state.message}</p>}
    {(["id", "revision"] as const).map(field => state.fieldErrors[field]?.[0] && <p key={field} role="alert" className={donationFieldStyles.error}>{state.fieldErrors[field]?.[0]} Reload and review this Notice.</p>)}
    <fieldset disabled={pending} className="min-w-0 space-y-5">
      {(["title", "message"] as const).map(name => {
        const id = `${prefix}-${name}`;
        const error = state.fieldErrors[name]?.[0];
        const props = { id, name, required: true, defaultValue: state.values[name],
          "aria-invalid": Boolean(error), "aria-describedby": `${id}-hint${error ? ` ${id}-error` : ""}`, className: donationFieldStyles.control };
        return <div key={name}>
          <label htmlFor={id} className={donationFieldStyles.label}>{name === "title" ? "Title" : "Message"} <span aria-hidden="true">*</span></label>
          {name === "message" ? <textarea {...props} rows={6} /> : <input {...props} type="text" />}
          <p id={`${id}-hint`} className="mt-1 text-sm text-muted-foreground">{name === "title" ? "Required. Maximum 120 characters." : "Required. Maximum 2000 characters. Plain text; newlines are preserved."}</p>
          {error && <p id={`${id}-error`} className={donationFieldStyles.error}>{error}</p>}
        </div>;
      })}
    </fieldset>
    <div className="flex flex-wrap gap-3">
      <button type="submit" disabled={pending} className={buttonStyles.primary}>{pending ? "Saving..." : notice ? "Save Notice" : "Create Notice"}</button>
      {notice && <Link href="/admin/notices" className={buttonStyles.secondary}>Close editor</Link>}
    </div>
  </form>;
}
