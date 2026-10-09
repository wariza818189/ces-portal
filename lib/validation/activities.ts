import { z } from "zod";
import { isValidIsoDate } from "@/lib/date";
import { ACTIVITY_STATUSES, validActivityId } from "@/lib/activity-policy.mjs";

export const activityIdSchema = z.string().refine(validActivityId, "Choose a valid Activity.");
export const activityRevisionSchema = z.string().regex(/^[1-9]\d{0,9}$/)
  .refine(value => Number(value) <= 4294967295, "Invalid Activity revision.").transform(Number);
export const activityStatusSchema = z.enum(ACTIVITY_STATUSES as readonly ["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]);
export type ActivityStatus = z.infer<typeof activityStatusSchema>;
export const activityNameSchema = z.string().refine(value => !/\p{Cc}/u.test(value), "Activity name cannot contain control characters.").trim().min(1, "Activity name is required.")
  .refine(value => Array.from(value).length <= 150, "Activity name cannot exceed 150 characters.")
  .refine(value => !/\p{Cc}/u.test(value), "Activity name cannot contain control characters.");
export const activityVenueSchema = z.string().refine(value => !/[<>\p{Cc}]/u.test(value), "Venue cannot contain control characters or angle brackets.").trim()
  .refine(value => Array.from(value).length <= 250, "Venue cannot exceed 250 characters.")
  .refine(value => !/[<>\p{Cc}]/u.test(value), "Venue cannot contain control characters or angle brackets.")
  .transform(value => value || null);

function coordinate(label: string, limit: number) {
  return z.string().trim().transform((value, context) => {
    if (!value) return null;
    if (value.length > 64 || !/^[+-]?(?:\d+(?:\.\d{1,6})?|\.\d{1,6})$/.test(value)) {
      context.addIssue({ code: "custom", message: `${label} must be a plain decimal with at most six fractional digits.` });
      return z.NEVER;
    }
    const negative = value.startsWith("-");
    const [whole = "0", fraction = ""] = value.replace(/^[+-]/, "").split(".");
    const magnitude = BigInt(whole || "0") * BigInt(1000000) + BigInt(fraction.padEnd(6, "0"));
    if (magnitude > BigInt(limit) * BigInt(1000000)) {
      context.addIssue({ code: "custom", message: `${label} must be between -${limit} and ${limit}.` });
      return z.NEVER;
    }
    return `${negative && magnitude !== BigInt(0) ? "-" : ""}${magnitude / BigInt(1000000)}.${String(magnitude % BigInt(1000000)).padStart(6, "0")}`;
  });
}
export const activityDetailsSchema = z.object({
  name: activityNameSchema,
  activity_date: z.string().refine(isValidIsoDate, "Enter a valid calendar date from 1000-01-01 through 9999-12-31."),
  venue_name: activityVenueSchema,
  latitude: coordinate("Latitude", 90),
  longitude: coordinate("Longitude", 180),
}).superRefine((value, context) => {
  if ((value.latitude === null) !== (value.longitude === null)) {
    context.addIssue({ code: "custom", path: [value.latitude === null ? "latitude" : "longitude"], message: "Provide both coordinates or leave both blank." });
  }
  if ((value.latitude !== null || value.longitude !== null) && value.venue_name === null) {
    context.addIssue({ code: "custom", path: ["venue_name"], message: "A venue is required when coordinates are provided." });
  }
});
export type ActivityDetails = z.infer<typeof activityDetailsSchema>;
export const activityMutationSchema = z.object({ id: activityIdSchema, revision: activityRevisionSchema });
export const activityTransitionSchema = activityMutationSchema.extend({ status: activityStatusSchema });
