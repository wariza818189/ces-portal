import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function StaffLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl p-5 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
