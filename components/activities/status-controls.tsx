"use client";

import { useActionState, useState } from "react";
import type { Activity } from "@/lib/activities";
import { ACTIVITY_TRANSITIONS } from "@/lib/activity-policy.mjs";
import { changeActivityStatus, type ActivityActionState } from "@/lib/actions/activities";
import type { ActivityStatus } from "@/lib/validation/activities";
import { buttonStyles } from "@/components/ui/button-styles";
import { donationFeedbackStyles } from "@/components/donations/form-styles";
const effects = {
  ACTIVE: "Open registration: this Activity becomes available on the public Volunteer form.",
  CLOSED: "Close registration: new Volunteer submissions will be rejected. Existing submissions remain readable.",
  ARCHIVED: "Archive permanently: this is terminal and cannot be reversed. Existing submissions remain readable.",
  DRAFT: "",
};
const initial: ActivityActionState = { status: "idle", message: "", fieldErrors: {} };
function Transition({ activity, destination, suffix, onResult }: { activity: Activity; destination: ActivityStatus; suffix: string; onResult: (result: ActivityActionState) => void }) {
  const [, action, pending] = useActionState(async (previous: ActivityActionState, form: FormData) => { const result = await changeActivityStatus(previous, form); onResult(result); return result; }, initial);
  return <details className="rounded-lg border border-border p-3">
    <summary className="cursor-pointer rounded text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{destination === "ACTIVE" ? activity.status === "CLOSED" ? "Reopen registration" : "Open registration" : destination === "CLOSED" ? "Close registration" : "Archive Activity"}</summary>
    <form action={action} aria-busy={pending} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={activity.id} /><input type="hidden" name="revision" value={activity.revision} /><input type="hidden" name="status" value={destination} />
      <p className="wrap-anywhere text-sm">{activity.name} · {activity.activity_date}</p>
      <p className="text-sm text-muted-foreground">{effects[destination]}</p>
      <label className="flex items-start gap-2 text-sm" htmlFor={`${suffix}-${activity.id}-${destination}-confirm`}><input id={`${suffix}-${activity.id}-${destination}-confirm`} type="checkbox" required disabled={pending} className="mt-1 h-5 w-5 accent-primary" />I confirm this status change.</label>
      <button disabled={pending} className={buttonStyles.secondary}>{pending ? "Saving..." : "Confirm status change"}</button>
    </form>
  </details>;
}
export function StatusControls({ activity, suffix }: { activity: Activity; suffix: string }) {
  const [feedback, setFeedback] = useState<ActivityActionState>(initial);
  return <div className="space-y-2">{feedback.message && <p role={feedback.status === "error" ? "alert" : "status"} className={donationFeedbackStyles(feedback.status, feedback.message)}>{feedback.message}</p>}{ACTIVITY_TRANSITIONS[activity.status].map(destination => <Transition key={`${destination}-${activity.revision}`} activity={activity} destination={destination as ActivityStatus} suffix={suffix} onResult={setFeedback} />)}</div>;
}
