import { PageHeader } from "@/components/layout/page-header";

export default function AddDonationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Donation"
        description="Record goods or cash received by CES."
      />

      <section className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Donation Form
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          The goods and cash forms will be added after the database foundation
          is ready.
        </p>
      </section>
    </div>
  );
}
