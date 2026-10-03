import { z } from "zod";

function requiredText(label: string, maximum: number) {
  return z.string({ message: `${label} is required and must be text.` })
    .trim()
    .min(1, `${label} is required.`)
    // MySQL VARCHAR limits count characters, not UTF-16 code units.
    .refine((value) => Array.from(value).length <= maximum,
      `${label} cannot exceed ${maximum} characters.`);
}

export const volunteerSchema = z.object({
  full_name: requiredText("Full Name", 100),
  course_year: requiredText("Course / Year", 100),
  contact_number: requiredText("Contact Number", 30),
  activity: requiredText("Activity", 150),
  acknowledgement: z.literal("on", {
    message: "Please acknowledge how this information will be used.",
  }),
});
