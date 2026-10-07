"use client";

import { useActionState } from "react";
import { buttonStyles } from "@/components/ui/button-styles";
import { createVolunteer, type VolunteerActionState } from "@/lib/actions/volunteers";

const initialValues = {
  full_name: "", course_year: "", contact_number: "", activity: "",
  acknowledgement: false,
};
type FormState = VolunteerActionState & {
  submittedValues?: typeof initialValues;
  revision: number;
};
const initialState: FormState = {
  status: "idle", message: "", fieldErrors: {}, revision: 0,
};
const fields = [
  { name: "full_name", label: "Full Name", maximum: 100 },
  { name: "course_year", label: "Course / Year", maximum: 100 },
  { name: "contact_number", label: "Contact Number", maximum: 30 },
  { name: "activity", label: "Activity", maximum: 150 },
] as const;
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function VolunteerForm() {
  const [state, formAction, isPending] = useActionState(
    async (previousState: FormState, formData: FormData): Promise<FormState> => {
      const result = await createVolunteer(previousState, formData);
      function textValue(name: string) {
        const value = formData.get(name);
        return typeof value === "string" ? value : "";
      }
      return {
        ...result,
        revision: previousState.revision + 1,
        submittedValues: result.status === "success" ? initialValues : {
          full_name: textValue("full_name"),
          course_year: textValue("course_year"),
          contact_number: textValue("contact_number"),
          activity: textValue("activity"),
          acknowledgement: formData.get("acknowledgement") === "on",
        },
      };
    },
    initialState,
  );
  const values = state.submittedValues ?? initialValues;
  const acknowledgementError = state.fieldErrors.acknowledgement?.[0];

  return (
    <form key={state.revision} action={formAction} className="space-y-6" aria-busy={isPending}>
      <p className="text-sm text-muted-foreground">All fields and the acknowledgement are required.</p>
      {state.message && (
        <div role={state.status === "error" ? "alert" : "status"} aria-atomic="true"
          className={state.status === "success"
            ? state.message.includes("do not resubmit")
              ? "rounded-lg border border-warning-border bg-warning-surface p-4 text-sm text-warning"
              : "rounded-lg border border-success-border bg-success-surface p-4 text-sm text-success"
            : "rounded-lg border border-error-border bg-error-surface p-4 text-sm text-error"}>
          {state.message}
        </div>
      )}
      <fieldset disabled={isPending} aria-label="Volunteer registration" className="min-w-0 space-y-6">
        {fields.map(({ name, label, maximum }) => {
          const error = state.fieldErrors[name]?.[0];
          return (
            <div key={name}>
              <label htmlFor={`volunteer-${name}`} className="block text-sm font-medium text-foreground">
                {label} <span aria-hidden="true">*</span>
              </label>
              <input id={`volunteer-${name}`} name={name} type={name === "contact_number" ? "tel" : "text"}
                required defaultValue={values[name]} aria-invalid={Boolean(error)}
                aria-describedby={`volunteer-${name}-hint${error ? ` volunteer-${name}-error` : ""}`}
                className={`mt-2 min-h-12 min-w-0 w-full rounded-lg border border-input-border bg-surface px-3 py-3 text-base text-foreground aria-invalid:border-error disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`} />
              <p id={`volunteer-${name}-hint`} className="mt-1 text-sm text-muted-foreground">Maximum {maximum} characters.</p>
              {error && <p id={`volunteer-${name}-error`} className="mt-1 text-sm text-error">{error}</p>}
            </div>
          );
        })}
        <section aria-labelledby="volunteer-use-heading" className="rounded-lg border border-info-border bg-info-surface p-4 text-sm leading-6 text-info">
          <h3 id="volunteer-use-heading" className="font-semibold">How the information is used</h3>
          <p className="mt-2">The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.</p>
        </section>
        <div>
          <label htmlFor="volunteer-acknowledgement" className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-foreground">
            <input id="volunteer-acknowledgement" name="acknowledgement" type="checkbox" value="on" required
              defaultChecked={values.acknowledgement} aria-invalid={Boolean(acknowledgementError)}
              aria-describedby={acknowledgementError ? "volunteer-acknowledgement-error" : undefined}
              className={`mt-1 h-5 w-5 shrink-0 accent-primary ${focusClass}`} />
            <span>I understand that the information I provide will be used for CES volunteer registration and activity coordination.</span>
          </label>
          {acknowledgementError && <p id="volunteer-acknowledgement-error" className="mt-1 text-sm text-error">{acknowledgementError}</p>}
        </div>
      </fieldset>
      <button type="submit" disabled={isPending}
        className={`${buttonStyles.primary} w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}>
        {isPending ? "Saving..." : "Submit Volunteer Registration"}
      </button>
    </form>
  );
}
