"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Activity } from "@/lib/activities";
import { createActivity, editActivity, type ActivityActionState } from "@/lib/actions/activities";
import { donationFieldStyles, donationFeedbackStyles } from "@/components/donations/form-styles";
import { buttonStyles } from "@/components/ui/button-styles";

const fields = [
  { name: "name", label: "Activity name", hint: "Required. Maximum 150 characters.", type: "text", required: true },
  { name: "activity_date", label: "Activity date", hint: "Required calendar date. Past and future dates are allowed.", type: "date", required: true },
  { name: "venue_name", label: "Public venue", hint: "Optional. Maximum 250 characters. Shown to people registering.", type: "text", required: false },
  { name: "latitude", label: "Latitude", hint: "Optional coordinate pair. -90 to 90, up to six decimal places.", type: "text", required: false },
  { name: "longitude", label: "Longitude", hint: "Optional coordinate pair. -180 to 180, up to six decimal places.", type: "text", required: false },
] as const;
type Values = Record<typeof fields[number]["name"], string>;
const blank: Values = { name: "", activity_date: "", venue_name: "", latitude: "", longitude: "" };
type State = ActivityActionState & { values: Values; formRevision: number; expectedRevision: number };
export function ActivityForm({ activity }: { activity?: Activity }) {
  const initial: State = { status: "idle", message: "", fieldErrors: {}, formRevision: 0, expectedRevision: activity?.revision ?? 1,
    values: activity ? Object.fromEntries(fields.map(({ name }) => [name, activity[name] ?? ""])) as Values : blank };
  const [state, action, pending] = useActionState(async (previous: State, form: FormData): Promise<State> => {
    const result = await (activity ? editActivity : createActivity)(previous, form);
    return { ...result, formRevision: previous.formRevision + 1, expectedRevision: result.revision ?? previous.expectedRevision,
      values: result.status === "success" && !activity ? blank : Object.fromEntries(fields.map(({ name }) => [name, typeof form.get(name) === "string" ? form.get(name) : ""])) as Values };
  }, initial);
  return <form key={state.formRevision} action={action} aria-busy={pending} className="space-y-5">
    {activity && <><input type="hidden" name="id" value={activity.id} /><input type="hidden" name="revision" value={state.expectedRevision} /></>}
    {activity?.status === "ACTIVE" && <p className="rounded-lg border border-warning-border bg-warning-surface p-4 text-sm text-warning">Changes are visible to people registering for this Activity.</p>}
    {activity && <p className="text-sm text-muted-foreground">Existing Volunteer records keep their Activity-name snapshot. Activity date and venue are current details, not historical signup snapshots.</p>}
    {state.message && <p role={state.status === "error" ? "alert" : "status"} className={donationFeedbackStyles(state.status, state.message)}>{state.message}</p>}
    <fieldset disabled={pending} className="grid min-w-0 gap-5 sm:grid-cols-2">
      {fields.map(({ name, label, hint, type, required }) => {
        const error = state.fieldErrors[name]?.[0];
        const id = `${activity ? `edit-${activity.id}` : "create"}-${name}`;
        return <div key={name} className={name === "name" || name === "venue_name" ? "sm:col-span-2" : ""}>
          <label htmlFor={id} className={donationFieldStyles.label}>{label}{required && <span aria-hidden="true"> *</span>}</label>
          <input id={id} name={name} type={type} required={required} defaultValue={state.values[name]} min={type === "date" ? "1000-01-01" : undefined} max={type === "date" ? "9999-12-31" : undefined}
            aria-invalid={Boolean(error)} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} className={donationFieldStyles.control} />
          <p id={`${id}-hint`} className="mt-1 text-sm text-muted-foreground">{hint}</p>
          {error && <p id={`${id}-error`} className={donationFieldStyles.error}>{error}</p>}
        </div>;
      })}
    </fieldset>
    <div className="flex flex-wrap gap-3">
      <button disabled={pending} className={buttonStyles.primary}>{pending ? "Saving..." : activity ? "Save Activity details" : "Create Draft Activity"}</button>
      {activity && <Link href="/activities" className={buttonStyles.secondary}>Close editor</Link>}
    </div>
  </form>;
}
