"use client";

import { useActionState } from "react";
import { buttonStyles } from "@/components/ui/button-styles";
import { donationFieldStyles, donationFeedbackStyles } from "@/components/donations/form-styles";
import {
  createGoodsDonation,
  type GoodsDonationActionState,
} from "@/lib/actions/donations";
import {
  GOODS_CATEGORIES,
  GOODS_UNITS,
} from "@/lib/constants";

const initialValues = {
  category: "",
  quantity: "",
  unit: "pcs",
  dateReceived: "",
  expiryDate: "",
};

type FormState = GoodsDonationActionState & {
  submittedValues?: typeof initialValues;
  revision: number;
};

const initialGoodsDonationState: FormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  revision: 0,
};

function FieldError({
  id,
  messages,
}: {
  id: string;
  messages?: string[];
}) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p id={id} className={donationFieldStyles.error}>
      {messages[0]}
    </p>
  );
}

export function GoodsForm() {
  const [state, formAction, isPending] = useActionState(
    async (previousState: FormState, formData: FormData): Promise<FormState> => {
      const result = await createGoodsDonation(previousState, formData);
      return {
        ...result,
        revision: previousState.revision + 1,
        submittedValues: result.status === "success"
          ? initialValues
          : {
              category: String(formData.get("category") ?? ""),
              quantity: String(formData.get("quantity") ?? ""),
              unit: String(formData.get("unit") ?? "pcs"),
              dateReceived: String(formData.get("dateReceived") ?? ""),
              expiryDate: String(formData.get("expiryDate") ?? ""),
          },
      };
    },
    initialGoodsDonationState,
  );

  function fieldProps(name: keyof typeof initialValues) {
    const invalid = Boolean(state.fieldErrors[name]?.length);
    return {
      defaultValue: state.submittedValues?.[name] ?? initialValues[name],
      "aria-invalid": invalid,
      "aria-describedby": invalid ? `${name}-error` : undefined,
    };
  }

  return (
    <form
      key={state.revision}
      action={formAction}
      className="space-y-6"
    >
      {state.message ? (
        <div
          role={state.status === "error" ? "alert" : "status"}
          aria-atomic="true"
          className={donationFeedbackStyles(state.status, state.message)}
        >
          {state.message}
        </div>
      ) : null}

      <fieldset
        disabled={isPending}
        aria-label="Goods donation details"
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="category"
            className={donationFieldStyles.label}
          >
            Category <span aria-hidden="true">*</span>
          </label>

          <select
            id="category"
            name="category"
            required
            {...fieldProps("category")}
            className={donationFieldStyles.control}
          >
            <option value="" disabled>
              Select a category
            </option>

            {GOODS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <FieldError id="category-error" messages={state.fieldErrors.category} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="quantity"
              className={donationFieldStyles.label}
            >
              Quantity <span aria-hidden="true">*</span>
            </label>

            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0.01"
              step="0.01"
              required
              inputMode="decimal"
              {...fieldProps("quantity")}
              className={donationFieldStyles.control}
            />

            <FieldError id="quantity-error" messages={state.fieldErrors.quantity} />
          </div>

          <div>
            <label
              htmlFor="unit"
              className={donationFieldStyles.label}
            >
              Unit <span aria-hidden="true">*</span>
            </label>

            <select
              id="unit"
              name="unit"
              required
              {...fieldProps("unit")}
              className={donationFieldStyles.control}
            >
              {GOODS_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            <FieldError id="unit-error" messages={state.fieldErrors.unit} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="dateReceived"
              className={donationFieldStyles.label}
            >
              Date Received <span aria-hidden="true">*</span>
            </label>

            <input
              id="dateReceived"
              name="dateReceived"
              type="date"
              required
              {...fieldProps("dateReceived")}
              className={donationFieldStyles.control}
            />

            <FieldError
              id="dateReceived-error"
              messages={state.fieldErrors.dateReceived}
            />
          </div>

          <div>
            <label
              htmlFor="expiryDate"
              className={donationFieldStyles.label}
            >
              Expiry Date <span aria-hidden="true">*</span>
            </label>

            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              required
              {...fieldProps("expiryDate")}
              className={donationFieldStyles.control}
            />

            <FieldError
              id="expiryDate-error"
              messages={state.fieldErrors.expiryDate}
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isPending}
        className={`${buttonStyles.primary} w-full disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:flex sm:w-fit`}
      >
        {isPending
          ? "Saving..."
          : "Save Goods Donation"}
      </button>
    </form>
  );
}
