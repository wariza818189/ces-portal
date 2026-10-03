"use client";

import { useActionState } from "react";
import { createCashDonation, type CashDonationActionState } from "@/lib/actions/donations";

const initialValues = { amount: "", dateReceived: "", notes: "" };
type FormState = CashDonationActionState & {
  submittedValues?: typeof initialValues;
  revision: number;
};
const initialState: FormState = {
  status: "idle", message: "", fieldErrors: {}, revision: 0,
};
const fieldClass = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900";

export function CashForm() {
  const [state, formAction, isPending] = useActionState(
    async (previousState: FormState, formData: FormData): Promise<FormState> => {
      const result = await createCashDonation(previousState, formData);
      return {
        ...result,
        revision: previousState.revision + 1,
        submittedValues: result.status === "success" ? initialValues : {
          amount: String(formData.get("amount") ?? ""),
          dateReceived: String(formData.get("dateReceived") ?? ""),
          notes: String(formData.get("notes") ?? ""),
        },
      };
    },
    initialState,
  );
  function fieldProps(name: keyof typeof initialValues) {
    const invalid = Boolean(state.fieldErrors[name]?.length);
    return {
      id: `cash-${name}`,
      name,
      defaultValue: state.submittedValues?.[name] ?? initialValues[name],
      "aria-invalid": invalid,
      "aria-describedby": invalid ? `cash-${name}-error` : undefined,
    };
  }
  function fieldError(name: keyof typeof initialValues) {
    const message = state.fieldErrors[name]?.[0];
    return message ? <p id={`cash-${name}-error`} className="mt-1 text-sm text-red-700">{message}</p> : null;
  }
  return (
    <form key={state.revision} action={formAction} className="space-y-6" aria-busy={isPending}>
      {state.message ? (
        <div role={state.status === "error" ? "alert" : "status"} aria-atomic="true"
          className={state.status === "success"
            ? "rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"}>
          {state.message}
        </div>
      ) : null}
      <fieldset disabled={isPending} aria-label="Cash donation details" className="space-y-6">
        <div>
          <label htmlFor="cash-amount" className="block text-sm font-medium text-slate-800">Amount <span aria-hidden="true">*</span></label>
          <input type="text" inputMode="decimal" required {...fieldProps("amount")} className={fieldClass} />
          {fieldError("amount")}
        </div>
        <div>
          <label htmlFor="cash-dateReceived" className="block text-sm font-medium text-slate-800">Date Received <span aria-hidden="true">*</span></label>
          <input type="date" required {...fieldProps("dateReceived")} className={fieldClass} />
          {fieldError("dateReceived")}
        </div>
        <div>
          <label htmlFor="cash-notes" className="block text-sm font-medium text-slate-800">Notes (optional)</label>
          <textarea rows={3} {...fieldProps("notes")} className={fieldClass} />
          <p className="mt-1 text-sm text-slate-600">Maximum 255 characters.</p>
          {fieldError("notes")}
        </div>
      </fieldset>
      <button type="submit" disabled={isPending}
        className="w-full rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {isPending ? "Saving..." : "Save Cash Donation"}
      </button>
    </form>
  );
}
