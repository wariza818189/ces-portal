"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/donations/new", label: "Donations" },
  { href: "/inventory", label: "Inventory" },
  { href: "/activities", label: "Activities" },
  { href: "/notices", label: "Notices" },
  { href: "/volunteers", label: "Volunteers" },
];

export function StaffNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Staff navigation" className="mt-4 grid grid-cols-2 gap-2 lg:mt-6 lg:grid-cols-1">
      {navigation.map(({ href, label }) => {
        const roots = href === "/notices" ? ["/notices", "/admin/notices"] : [href];
        const active = roots.some(root => pathname === root || pathname.startsWith(`${root}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 min-w-0 items-center rounded-lg border-l-2 px-3 py-2 text-sm leading-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:transition-colors motion-safe:duration-150 ${active
              ? "border-primary bg-active-surface font-semibold text-primary"
              : "border-transparent font-medium text-muted-foreground hover:bg-hover-surface hover:text-foreground"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
