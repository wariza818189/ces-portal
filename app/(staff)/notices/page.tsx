import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listNotices, type Notice } from "@/lib/notices";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button-styles";

export default async function NoticesPage({ searchParams }: {
  searchParams: Promise<{ access?: string | string[] }>;
}) {
  const user = await requireUser("/notices");
  const query = await searchParams;
  let notices: Notice[] | null = null;
  try { notices = await listNotices(); } catch { console.error("Notice feed unavailable."); }
  return <div className="space-y-6">
    <PageHeader title="Staff Notices" description="Internal CES informational messages for authenticated staff." />
    <aside className="rounded-xl border border-warning-border bg-warning-surface p-5 text-sm text-warning">
      <h2 className="font-semibold">SYNTHETIC / LOCAL DEMO ONLY</h2>
      <p className="mt-2">Use synthetic Notice information only. Real-data use and public production deployment are not approved.</p>
    </aside>
    {user.role === "STAFF" && query.access === "admin-required" &&
      <p role="alert" className="rounded-lg border border-error-border bg-error-surface p-4 text-error">Access denied. Only ADMIN can manage CES Staff Notices.</p>}
    {user.role === "ADMIN" && <Link href="/admin/notices" className={buttonStyles.secondary}>Manage Notices</Link>}
    {notices === null ? <Card><h2 role="alert" className="text-error">Unable to load Notices.</h2><p className="mt-2">Reload this page or contact CES support.</p></Card>
      : !notices.length ? <Card><h2 className="text-lg font-semibold">No Notices recorded</h2><p className="mt-2 text-muted-foreground">Internal CES messages will appear here when published.</p></Card>
      : <section aria-label="CES Staff Notices" className="space-y-4">{notices.map(notice => <Card key={notice.id}>
        <h2 className="wrap-anywhere text-lg font-semibold">{notice.title}</h2>
        <p className="mt-3 whitespace-pre-wrap wrap-anywhere">{notice.message}</p>
        <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div><dt>Created (UTC)</dt><dd>{notice.created_at}</dd></div>
          <div><dt>Updated (UTC)</dt><dd>{notice.updated_at}</dd></div>
        </dl>
      </Card>)}</section>}
  </div>;
}
