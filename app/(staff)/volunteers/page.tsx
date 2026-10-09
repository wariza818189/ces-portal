import type { RowDataPacket } from "mysql2";
import Link from "next/link";
import { connection } from "next/server";
import { buttonStyles } from "@/components/ui/button-styles";
import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth/session";

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
  await requireUser("/volunteers");
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
      <PageHeader
        title="Volunteer Submissions"
        description="Read-only view of recorded synthetic Volunteer submissions."
        action={<Link href="/volunteers/poster" prefetch={false} className={buttonStyles.secondary}>Volunteer Signup poster</Link>}
      />
      <aside className="rounded-xl border border-warning-border bg-warning-surface p-5 text-sm leading-6 text-warning">
        <h2 className="font-semibold">SYNTHETIC / LOCAL DEMO ONLY</h2>
        <p className="mt-2">Classroom/local demonstration using synthetic test information only.</p>
        <p className="mt-2">Intended viewers: CES Staff / CES Coordinator. This route has no authentication or access enforcement. Real personal-information collection and public production deployment are not approved.</p>
      </aside>
      {records === null ? (
        <section role="alert" className="rounded-xl border border-error-border bg-error-surface p-6 text-error">
          <h2 className="font-semibold">Unable to load Volunteer submissions</h2>
          <p className="mt-2">Please try loading this view again. If the problem continues, contact CES support.</p>
        </section>
      ) : !records.length ? (
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">No Volunteer submissions recorded</h2>
          <p className="mt-2 text-sm text-muted-foreground">Synthetic submissions will appear here after the demonstration form is saved.</p>
        </section>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Newest submissions first. Submission times are shown as recorded in the database session time zone.</p>
          <div className="hidden rounded-xl border border-border bg-surface xl:block">
            <table className="w-full table-fixed text-left text-sm">
              <caption className="px-5 py-4 text-left font-semibold text-foreground">Recorded synthetic Volunteer submissions</caption>
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[26%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="border-y border-border bg-hover-surface text-muted-foreground">
                <tr>{columns.map(({ key, label }) => <th key={key} scope="col" className="px-4 py-3">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {records.map((record) => (
                  <tr key={record.id}>{columns.map(({ key }) => key === "full_name"
                    ? <th key={key} scope="row" className="whitespace-pre-wrap wrap-anywhere px-4 py-4 font-medium">{record[key]}</th>
                    : <td key={key} className={`whitespace-pre-wrap wrap-anywhere px-4 py-4 ${key === "created_at" || key === "contact_number" ? "tabular-nums" : ""}`}>{record[key]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <section aria-label="Recorded synthetic Volunteer submissions" className="space-y-4 xl:hidden">
            {records.map((record) => (
              <article key={record.id} className="min-w-0 rounded-xl border border-border bg-surface p-5">
                <h2 className="whitespace-pre-wrap wrap-anywhere text-lg font-semibold text-foreground">{record.full_name}</h2>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-muted-foreground">Activity</dt>
                    <dd className="mt-1 whitespace-pre-wrap wrap-anywhere text-foreground">{record.activity}</dd>
                  </div>
                  {columns.filter(({ key }) => key !== "full_name" && key !== "activity").map(({ key, label }) => (
                    <div key={key} className="min-w-0"><dt className="font-medium text-muted-foreground">{label}</dt><dd className={`mt-1 whitespace-pre-wrap wrap-anywhere text-foreground ${key === "created_at" || key === "contact_number" ? "tabular-nums" : ""}`}>{record[key]}</dd></div>
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
