import type { RowDataPacket } from "mysql2";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/page-header";

type VolunteerRow = RowDataPacket & {
  id: string;
  full_name: string;
  course_year: string;
  contact_number: string;
  activity: string;
  created_at: string;
};
const columns = [
  { key: "full_name", label: "Full Name" },
  { key: "course_year", label: "Course / Year" },
  { key: "contact_number", label: "Contact Number" },
  { key: "activity", label: "Activity" },
  { key: "created_at", label: "Submission Time" },
] as const;

export default async function VolunteersPage() {
  await connection();
  let records: VolunteerRow[] | null = null;
  try {
    const { db } = await import("@/lib/db");
    const [rows] = await db.execute<VolunteerRow[]>(
      `SELECT CAST(id AS CHAR) AS id, full_name, course_year, contact_number, activity,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
       FROM volunteers ORDER BY created_at DESC, id DESC`,
    );
    if (!Array.isArray(rows) || rows.some((row) =>
      typeof row.id !== "string" || !/^\d+$/.test(row.id)
      || columns.some(({ key }) => typeof row[key] !== "string" || !row[key].trim())
      || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(row.created_at))) {
      throw new Error("Invalid volunteer result.");
    }
    records = rows;
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? error.code : undefined;
    console.error("Volunteer submissions load failed.", {
      code: typeof code === "string" && /^ER_[A-Z0-9_]{1,60}$/.test(code)
        ? code : "UNCLASSIFIED",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Volunteer Submissions" description="Read-only view of recorded synthetic Volunteer submissions." />
      <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <p className="font-semibold">Classroom/local demonstration using synthetic test information only.</p>
        <p className="mt-2">Intended viewers: CES Staff / CES Coordinator. This route has no authentication or access enforcement. Real personal-information collection and public production deployment are not approved.</p>
      </aside>
      {records === null ? (
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="font-semibold">Unable to load Volunteer submissions</h2>
          <p className="mt-2">Please try loading this view again. If the problem continues, contact CES support.</p>
        </section>
      ) : !records.length ? (
        <section className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No Volunteer submissions recorded</h2>
          <p className="mt-2 text-sm text-slate-600">Synthetic submissions will appear here after the demonstration form is saved.</p>
        </section>
      ) : (
        <>
          <p className="text-sm text-slate-600">Newest submissions first. Submission times are shown as recorded in the database session time zone.</p>
          <div className="hidden rounded-xl border border-sky-100 bg-white shadow-sm md:block">
            <table className="w-full table-fixed text-left text-sm">
              <caption className="px-5 py-4 text-left font-semibold text-slate-900">Recorded synthetic Volunteer submissions</caption>
              <thead className="border-y border-sky-100 bg-sky-50 text-slate-700">
                <tr>{columns.map(({ key, label }) => <th key={key} scope="col" className="px-4 py-3">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-slate-800">
                {records.map((record) => (
                  <tr key={record.id}>{columns.map(({ key }) => key === "full_name"
                    ? <th key={key} scope="row" className="whitespace-pre-wrap wrap-anywhere px-4 py-4 font-medium">{record[key]}</th>
                    : <td key={key} className="whitespace-pre-wrap wrap-anywhere px-4 py-4">{record[key]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <section aria-label="Recorded synthetic Volunteer submissions" className="space-y-4 md:hidden">
            {records.map((record) => (
              <article key={record.id} className="min-w-0 rounded-xl border border-sky-100 bg-white p-5 shadow-sm">
                <dl className="space-y-3 text-sm text-slate-800">
                  {columns.map(({ key, label }) => (
                    <div key={key}><dt className="font-medium text-slate-600">{label}</dt><dd className="mt-1 whitespace-pre-wrap wrap-anywhere">{record[key]}</dd></div>
                  ))}
                </dl>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
