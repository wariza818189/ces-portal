import Link from "next/link";
import { StaffNavigation } from "@/components/layout/staff-navigation";

export function Sidebar() {
  return (
    <aside data-staff-chrome className="border-b border-border bg-surface lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="p-4 sm:p-6">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center rounded text-xl font-bold text-primary"
        >
          CES Portal
        </Link>

        <p className="text-sm leading-5 text-muted-foreground">
          Community Extension Services
        </p>

        <StaffNavigation />
      </div>
    </aside>
  );
}
