import type { ReactNode } from "react";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        {children}
      </div>
    </main>
  );
}
