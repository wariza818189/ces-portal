import { PageHeader } from "@/components/layout/page-header";

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory"
        description="View recorded donated goods and their expiry status."
      />

      <section className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          No inventory data loaded
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Inventory records will appear here after MySQL is connected.
        </p>
      </section>
    </div>
  );
}
