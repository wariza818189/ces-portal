import Link from "next/link";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { listActivities, logActivityFailure, type Activity } from "@/lib/activities";
import { activityIdSchema } from "@/lib/validation/activities";
import { ActivityForm } from "@/components/activities/activity-form";
import { StatusControls } from "@/components/activities/status-controls";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonStyles } from "@/components/ui/button-styles";
function Badge({ activity }: { activity: Activity }) {
  return <StatusBadge variant={activity.status === "ACTIVE" ? "success" : activity.status === "DRAFT" ? "warning" : "neutral"}>{activity.status.charAt(0) + activity.status.slice(1).toLowerCase()}</StatusBadge>;
}
function Actions({ activity, suffix }: { activity: Activity; suffix: string }) {
  return <div className="space-y-3">{["DRAFT", "ACTIVE"].includes(activity.status) && <Link href={`/activities?edit=${activity.id}`} className={buttonStyles.secondary}>Edit details</Link>}<StatusControls activity={activity} suffix={suffix} />{activity.status === "ARCHIVED" && <p className="text-sm text-muted-foreground">Archived · read-only</p>}</div>;
}
export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ edit?: string | string[] }> }) {
  await requireUser("/activities");
  await connection();
  const query = await searchParams;
  const requested = query.edit === undefined ? null : activityIdSchema.safeParse(query.edit);
  let records: Activity[] | null = null;
  try { records = await listActivities(); } catch (error) { logActivityFailure("Activities load failed.", error); }
  const selected = requested?.success ? records?.find(row => row.id === requested.data) : undefined;
  return <div className="space-y-8">
    <PageHeader title="Activities" description="Manage synthetic CES Activities and their public registration state." />
    <aside className="rounded-xl border border-warning-border bg-warning-surface p-5 text-sm text-warning"><h2 className="font-semibold">SYNTHETIC / LOCAL DEMO ONLY</h2><p className="mt-2">Use synthetic Activity and Volunteer information only. Real-data collection and public production deployment are not approved.</p></aside>
    {records === null ? <Card><h2 role="alert" className="text-error">Unable to load Activities.</h2><p className="mt-2">Reload this workspace or contact CES support.</p></Card> : <>
      <Card><details><summary className="cursor-pointer rounded text-lg font-semibold focus-visible:outline-2 focus-visible:outline-focus">Create Activity</summary><div className="mt-5"><ActivityForm /></div></details></Card>
      {requested && (!requested.success || !selected) && <p role="alert" className="text-error">Activity not found or invalid edit request.</p>}
      {selected && <Card><h2 className="mb-4 text-lg font-semibold">Edit Activity details</h2>{["DRAFT", "ACTIVE"].includes(selected.status) ? <ActivityForm key={selected.id} activity={selected} /> : <p>Closed and Archived Activity details are read-only.</p>}</Card>}
      <p className="text-sm text-muted-foreground">Active, then Draft: earliest Activity date first. Closed, then Archived: latest date first. Registration is open only while Active, regardless of date.</p>
      {!records.length ? <Card><h2 className="text-lg font-semibold">No Activities recorded</h2><p className="mt-2 text-sm text-muted-foreground">Create a Draft Activity, then open registration when ready.</p></Card> : <>
        <div className="hidden rounded-xl border border-border bg-surface xl:block"><table className="w-full table-fixed text-left text-sm"><caption className="px-5 py-4 text-left font-semibold">CES Activities</caption><thead className="border-y border-border bg-hover-surface"><tr>{["Activity", "Date", "Status", "Venue", "Registration", "Actions"].map(label => <th key={label} scope="col" className="px-3 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{records.map(activity => <tr key={activity.id}>
          <th scope="row" className="wrap-anywhere px-3 py-4 align-top">{activity.name}</th><td className="px-3 py-4 align-top tabular-nums">{activity.activity_date}</td><td className="px-3 py-4 align-top"><Badge activity={activity} /></td><td className="wrap-anywhere px-3 py-4 align-top">{activity.venue_name ?? "Not provided"}</td><td className="px-3 py-4 align-top">{activity.status === "ACTIVE" ? "Open" : "Unavailable"}</td><td className="px-3 py-4 align-top"><Actions activity={activity} suffix="desktop" /></td>
        </tr>)}</tbody></table></div>
        <section aria-label="CES Activities" className="space-y-4 xl:hidden">{records.map(activity => <Card key={activity.id}><h2 className="wrap-anywhere text-lg font-semibold">{activity.name}</h2><div className="mt-3"><Badge activity={activity} /></div><dl className="my-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Date</dt><dd>{activity.activity_date}</dd></div><div><dt className="text-muted-foreground">Public venue</dt><dd className="wrap-anywhere">{activity.venue_name ?? "Not provided"}</dd></div><div><dt className="text-muted-foreground">Registration</dt><dd>{activity.status === "ACTIVE" ? "Open" : "Unavailable"}</dd></div></dl><Actions activity={activity} suffix="mobile" /></Card>)}</section>
      </>}
    </>}
  </div>;
}
