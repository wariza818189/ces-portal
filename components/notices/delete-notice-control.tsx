"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notice } from "@/lib/notices";
import { deleteNotice, type NoticeActionState } from "@/lib/actions/notices";
import { donationFeedbackStyles } from "@/components/donations/form-styles";
import { buttonStyles } from "@/components/ui/button-styles";

const initial: NoticeActionState = { status: "idle", message: "", fieldErrors: {} };
export function DeleteNoticeControl({ notice }: { notice: Pick<Notice, "id" | "title" | "revision"> }) {
  const [confirmed, setConfirmed] = useState(false);
  const [state, action, pending] = useActionState(async (previous: NoticeActionState, form: FormData) => {
    if (form.get("confirm") !== "yes") return { ...initial, status: "error" as const, message: "Confirm deletion before submitting." };
    const result = await deleteNotice(previous, form);
    if (result.status === "success") window.dispatchEvent(new CustomEvent("ces-notice-deleted", {
      detail: { id: notice.id, message: result.message },
    }));
    return result;
  }, initial);
  const id = `delete-${notice.id}`;
  return <form action={action} aria-busy={pending} className="mt-4 space-y-3 border-t border-border pt-4">
    <input type="hidden" name="id" value={notice.id} /><input type="hidden" name="revision" value={notice.revision} />
    <p id={`${id}-context`} className="wrap-anywhere text-sm">Delete “{notice.title}” (revision {notice.revision}). This permanently removes the Notice.</p>
    {state.message && <p role={state.status === "error" ? "alert" : "status"} className={donationFeedbackStyles(state.status, state.message)}>{state.message}</p>}
    {(["id", "revision"] as const).map(field => state.fieldErrors[field]?.[0] && <p key={field} role="alert" className="text-sm text-error">{state.fieldErrors[field]?.[0]}</p>)}
    <label htmlFor={id} className="flex items-start gap-3 text-sm">
      <input id={id} name="confirm" type="checkbox" value="yes" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={pending}
        aria-describedby={`${id}-context`} className="mt-1 size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
      I confirm that I want to delete this Notice.
    </label>
    <button type="submit" disabled={!confirmed || pending} className={`${buttonStyles.secondary} border-error-border text-error disabled:cursor-not-allowed disabled:opacity-60`}>{pending ? "Deleting..." : "Delete Notice"}</button>
  </form>;
}

// Only fixed server success messages can cross the page-local feedback event.
export function readDeletionFeedback(value: unknown): string | null {
  return value === "Notice deleted." || value === "Notice deleted. Some views could not refresh. Reload them; the result is confirmed, so do not resubmit it."
    ? value : null;
}

// Keep confirmed deletion feedback outside the row removed by revalidation.
export function NoticeDeletionFeedback() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  useEffect(() => {
    const receive = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const confirmedMessage = readDeletionFeedback(event.detail?.message);
      if (confirmedMessage === null) return;
      setMessage(confirmedMessage);
      // A successful delete can revalidate the open editor before this event.
      // Leave that deleted record's editor so success has no stale error banner.
      const url = new URL(window.location.href);
      if (url.searchParams.get("edit") === event.detail.id) {
        router.replace("/admin/notices", { scroll: false });
      }
    };
    window.addEventListener("ces-notice-deleted", receive);
    return () => window.removeEventListener("ces-notice-deleted", receive);
  }, [router]);
  return message ? <p role="status" className={donationFeedbackStyles("success", message)}>{message}</p> : null;
}
