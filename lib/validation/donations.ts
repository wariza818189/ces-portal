import { z } from "zod";
import {
  GOODS_CATEGORIES,
  GOODS_UNITS,
} from "@/lib/constants";
import {
  getTodayIsoDate,
  isValidIsoDate,
} from "@/lib/date";

const receivedDateSchema = z.string()
  .min(1, "Date received is required.")
  .refine(isValidIsoDate, "Enter a valid received date.")
  .superRefine((value, context) => {
    if (isValidIsoDate(value) && value > getTodayIsoDate()) {
      context.addIssue({
        code: "custom",
        message: "Date received cannot be in the future.",
      });
    }
  });

export const goodsDonationSchema = z
  .object({
    category: z.enum(GOODS_CATEGORIES, {
      message: "Please select a valid category.",
    }),

    quantity: z
      .string({ message: "Enter a quantity with at most two decimal places." })
      .trim()
      .regex(
        /^\d+(?:\.\d{1,2})?$/,
        "Enter a quantity with at most two decimal places.",
      )
      .transform(Number)
      .pipe(
        z.number()
          .positive("Quantity must be greater than 0.")
          .max(
            99999999.99,
            "Quantity is larger than the allowed maximum.",
          ),
      ),

    unit: z.enum(GOODS_UNITS, {
      message: "Please select a valid unit.",
    }),

    dateReceived: receivedDateSchema,

    expiryDate: z
      .string()
      .min(1, "Expiry date is required.")
      .refine(isValidIsoDate, "Enter a valid expiry date."),
  });

export type GoodsDonationInput = z.infer<
  typeof goodsDonationSchema
>;


export const cashDonationSchema = z.object({
  amount: z.string({ message: "Enter an amount with at most two decimal places." })
    .trim()
    .regex(/^\d+(?:\.\d{1,2})?$/, "Enter an amount with at most two decimal places.")
    .superRefine((value, context) => {
      if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return;
      const [whole, fraction = ""] = value.split(".");
      const integer = whole.replace(/^0+(?=\d)/, "");
      if (integer.length > 10) {
        context.addIssue({ code: "custom", message: "Amount cannot exceed 9999999999.99." });
      } else if (integer === "0" && !/[1-9]/.test(fraction)) {
        context.addIssue({ code: "custom", message: "Amount must be greater than 0." });
      }
    })
    .transform((value) => {
      const [whole, fraction = ""] = value.split(".");
      return `${whole.replace(/^0+(?=\d)/, "")}.${fraction.padEnd(2, "0")}`;
    }),
  dateReceived: receivedDateSchema,
  notes: z.string().trim()
    .refine((value) => Array.from(value).length <= 255, "Notes cannot exceed 255 characters.")
    .transform((value) => value || null),
});
