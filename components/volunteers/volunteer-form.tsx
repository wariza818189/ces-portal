"use client";

import { useActionState } from "react";
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
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";

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
      <p className="text-sm text-slate-600">All fields and the acknowledgement are required.</p>
      {state.message && (
        <div role={state.status === "error" ? "alert" : "status"} aria-atomic="true"
          className={state.status === "success"
            ? "rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"}>
          {state.message}
        </div>
      )}
      <fieldset disabled={isPending} aria-label="Volunteer registration" className="min-w-0 space-y-6">
        {fields.map(({ name, label, maximum }) => {
          const error = state.fieldErrors[name]?.[0];
          return (
            <div key={name}>
              <label htmlFor={`volunteer-${name}`} className="block text-sm font-medium text-slate-800">
                {label} <span aria-hidden="true">*</span>
              </label>
              <input id={`volunteer-${name}`} name={name} type={name === "contact_number" ? "tel" : "text"}
                required defaultValue={values[name]} aria-invalid={Boolean(error)}
                aria-describedby={`volunteer-${name}-hint${error ? ` volunteer-${name}-error` : ""}`}
                className={`mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 ${focusClass}`} />
              <p id={`volunteer-${name}-hint`} className="mt-1 text-sm text-slate-600">Maximum {maximum} characters.</p>
              {error && <p id={`volunteer-${name}-error`} className="mt-1 text-sm text-red-700">{error}</p>}
            </div>
          );
        })}
        <div>
          <label htmlFor="volunteer-acknowledgement" className="flex items-start gap-3 text-sm leading-6 text-slate-800">
            <input id="volunteer-acknowledgement" name="acknowledgement" type="checkbox" value="on" required
              defaultChecked={values.acknowledgement} aria-invalid={Boolean(acknowledgementError)}
              aria-describedby={acknowledgementError ? "volunteer-acknowledgement-error" : undefined}
              className={`mt-1 h-5 w-5 shrink-0 ${focusClass}`} />
            <span>I understand that the information I provide will be used for CES volunteer registration and activity coordination.</span>
          </label>
          {acknowledgementError && <p id="volunteer-acknowledgement-error" className="mt-1 text-sm text-red-700">{acknowledgementError}</p>}
        </div>
      </fieldset>
      <button type="submit" disabled={isPending}
        className={`w-full rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}>
        {isPending ? "Saving..." : "Submit Volunteer Registration"}
      </button>
    </form>
  );
}
