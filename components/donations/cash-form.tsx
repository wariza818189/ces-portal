"use client";

import { useActionState } from "react";
import { buttonStyles } from "@/components/ui/button-styles";
import { donationFieldStyles, donationFeedbackStyles } from "@/components/donations/form-styles";
import { createCashDonation, type CashDonationActionState } from "@/lib/actions/donations";

const initialValues = { amount: "", dateReceived: "", notes: "" };
type FormState = CashDonationActionState & {
  submittedValues?: typeof initialValues;
  revision: number;
};
const initialState: FormState = {
  status: "idle", message: "", fieldErrors: {}, revision: 0,
};

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
    return message ? <p id={`cash-${name}-error`} className={donationFieldStyles.error}>{message}</p> : null;
  }
  return (
    <form key={state.revision} action={formAction} className="space-y-6" aria-busy={isPending}>
      {state.message ? (
        <div role={state.status === "error" ? "alert" : "status"} aria-atomic="true"
          className={donationFeedbackStyles(state.status, state.message)}>
          {state.message}
        </div>
      ) : null}
      <fieldset disabled={isPending} aria-label="Cash donation details" className="space-y-6">
        <div>
          <label htmlFor="cash-amount" className={donationFieldStyles.label}>Amount <span aria-hidden="true">*</span></label>
          <input type="text" inputMode="decimal" required {...fieldProps("amount")} className={donationFieldStyles.control} />
          {fieldError("amount")}
        </div>
        <div>
          <label htmlFor="cash-dateReceived" className={donationFieldStyles.label}>Date Received <span aria-hidden="true">*</span></label>
          <input type="date" required {...fieldProps("dateReceived")} className={donationFieldStyles.control} />
          {fieldError("dateReceived")}
        </div>
        <div>
          <label htmlFor="cash-notes" className={donationFieldStyles.label}>Notes (optional)</label>
          <textarea rows={3} {...fieldProps("notes")} className={`${donationFieldStyles.control} min-h-28 resize-y`} />
          <p className="mt-1 text-sm text-muted-foreground">Maximum 255 characters.</p>
          {fieldError("notes")}
        </div>
      </fieldset>
      <button type="submit" disabled={isPending}
        className={`${buttonStyles.primary} w-full disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:flex sm:w-fit`}>
        {isPending ? "Saving..." : "Save Cash Donation"}
      </button>
    </form>
  );
}
