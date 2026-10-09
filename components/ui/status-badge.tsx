import type { ReactNode } from "react";

const variants = {
  neutral: "border-border bg-hover-surface text-muted-foreground",
  success: "border-success-border bg-success-surface text-success",
  warning: "border-warning-border bg-warning-surface text-warning",
  error: "border-error-border bg-error-surface text-error",
};

export function StatusBadge({ children, variant }: { children: ReactNode; variant: keyof typeof variants }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs leading-5 font-semibold ${variants[variant]}`}>{children}</span>;
}
