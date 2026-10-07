import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";

export default function StaffLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div data-staff-shell className="min-h-screen bg-app-background lg:flex">
      <a
        data-staff-chrome
        href="#main-content"
        className="sr-only rounded-lg bg-primary px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Skip to main content
      </a>
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header data-staff-chrome className="hidden min-h-14 items-center border-b border-border bg-surface px-8 lg:flex">
          <p className="text-sm font-medium text-muted-foreground">Staff workspace</p>
        </header>
        <main id="main-content" tabIndex={-1} className="min-w-0">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
