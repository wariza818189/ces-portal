import { z } from "zod";
import {
  GOODS_CATEGORIES,
  GOODS_UNITS,
} from "@/lib/constants";
import {
  getTodayIsoDate,
  isValidIsoDate,
} from "@/lib/date";

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

    dateReceived: z
      .string()
      .min(1, "Date received is required.")
      .refine(isValidIsoDate, "Enter a valid received date."),

    expiryDate: z
      .string()
      .min(1, "Expiry date is required.")
      .refine(isValidIsoDate, "Enter a valid expiry date."),
  })
  .superRefine((data, context) => {
    if (
      isValidIsoDate(data.dateReceived) &&
      data.dateReceived > getTodayIsoDate()
    ) {
      context.addIssue({
        code: "custom",
        path: ["dateReceived"],
        message: "Date received cannot be in the future.",
      });
    }
  });

export type GoodsDonationInput = z.infer<
  typeof goodsDonationSchema
>;
