import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { requireUser } from "@/lib/auth/session";
import { LogoutForm } from "@/components/auth/logout-form";

export default async function StaffLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireUser();
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
        <header data-staff-chrome className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 lg:px-8">
          <p className="min-w-0 wrap-anywhere text-sm font-medium text-muted-foreground">Staff workspace · {user.name}</p>
          <LogoutForm />
        </header>
        <main id="main-content" tabIndex={-1} className="min-w-0">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
