export const donationFieldStyles = {
  label: "block text-sm font-medium text-foreground",
  control: "mt-2 min-h-12 min-w-0 w-full rounded-lg border border-input-border bg-surface px-3 py-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-error disabled:cursor-not-allowed disabled:opacity-60",
  error: "mt-1 text-sm text-error",
};

export function donationFeedbackStyles(status: string, message: string) {
  const base = "rounded-lg border p-4 text-sm";
  if (status !== "success") return `${base} border-error-border bg-error-surface text-error`;
  if (message.includes("do not resubmit") || message.includes("Note:")) {
    return `${base} border-warning-border bg-warning-surface text-warning`;
  }
  return `${base} border-success-border bg-success-surface text-success`;
}
