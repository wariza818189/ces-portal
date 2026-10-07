import type { ReactNode } from "react";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-app-background px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto min-w-0 w-full max-w-6xl">
        {children}
      </div>
    </main>
  );
}
