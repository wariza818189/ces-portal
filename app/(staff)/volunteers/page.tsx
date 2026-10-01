import { PageHeader } from "@/components/layout/page-header";

export default function VolunteersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Volunteer Submissions"
        description="View students who submitted the CES volunteer form."
      />

      <section className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          No submissions loaded
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Volunteer submissions will appear here after the database is
          connected.
        </p>
      </section>
    </div>
  );
}
