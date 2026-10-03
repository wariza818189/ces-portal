import { GoodsForm } from "@/components/donations/goods-form";
import { PageHeader } from "@/components/layout/page-header";

export default function AddDonationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Donation"
        description="Record goods or cash received by CES."
      />

      <div className="inline-flex rounded-lg border border-sky-100 bg-white p-1">
        <span className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white">
          Goods
        </span>

        <span
          aria-disabled="true"
          className="px-4 py-2 text-sm font-medium text-slate-400"
        >
          Cash
        </span>
      </div>

      <section className="max-w-2xl rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Goods Donation
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Enter the information after the donated goods have been
            segregated and counted.
          </p>
        </div>

        <GoodsForm />
      </section>
    </div>
  );
}
