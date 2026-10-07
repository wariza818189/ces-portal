import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div data-page-container className="mx-auto min-w-0 w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}
