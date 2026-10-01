import Link from "next/link";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/donations/new",
    label: "Add Donation",
  },
  {
    href: "/inventory",
    label: "Inventory",
  },
  {
    href: "/volunteers",
    label: "Volunteers",
  },
];

export function Sidebar() {
  return (
    <aside className="border-b border-sky-100 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="p-5 lg:p-6">
        <Link
          href="/dashboard"
          className="inline-block text-xl font-bold text-sky-700"
        >
          CES Portal
        </Link>

        <p className="mt-1 text-sm text-slate-500">
          Community Extension Services
        </p>

        <nav
          aria-label="Staff navigation"
          className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
