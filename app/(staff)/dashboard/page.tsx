import { PageHeader } from "@/components/layout/page-header";

const summaryCards = [
  {
    label: "Goods Records",
    value: "—",
  },
  {
    label: "Cash Donations",
    value: "—",
  },
  {
    label: "Volunteer Submissions",
    value: "—",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of CES donation and volunteer records."
      />

      <section
        aria-label="Record summary"
        className="grid gap-4 md:grid-cols-3"
      >
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-600">
              {card.label}
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Expiry Status
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Expiry information will appear here after the database is connected.
        </p>
      </section>
    </div>
  );
}
