import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6 ${className}`}>{children}</div>;
}
