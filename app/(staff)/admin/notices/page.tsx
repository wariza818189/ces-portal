import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { listNotices, type Notice } from "@/lib/notices";
import { noticeIdSchema } from "@/lib/validation/notices";
import { NoticeForm } from "@/components/notices/notice-form";
import { DeleteNoticeControl, NoticeDeletionFeedback } from "@/components/notices/delete-notice-control";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button-styles";

export default async function ManageNoticesPage({ searchParams }: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const user = await requireUser("/admin/notices");
  if (user.role !== "ADMIN") redirect("/notices?access=admin-required");
  const query = await searchParams;
  const requested = query.edit === undefined ? null : noticeIdSchema.safeParse(query.edit);
  let notices: Notice[] | null = null;
  try { notices = await listNotices(); } catch { console.error("Notice management feed unavailable."); }
  const selected = requested?.success ? notices?.find(notice => notice.id === requested.data) : undefined;
  return <div className="space-y-6">
    <PageHeader title="Manage Staff Notices" description="Publish, edit, and delete internal CES informational messages." />
    <Link href="/notices" className={buttonStyles.secondary}>Read Staff Notices</Link>
    {notices === null ? <Card><h2 role="alert" className="text-error">Unable to load Notices.</h2><p className="mt-2">Reload this workspace or contact CES support.</p></Card> : <>
      <Card><h2 className="mb-4 text-lg font-semibold">Create Notice</h2><NoticeForm /></Card>
      {requested && (!requested.success || !selected) && <p role="alert" className="text-error">Notice not found or invalid edit request.</p>}
      {selected && <Card><h2 className="mb-4 text-lg font-semibold">Edit Notice</h2><NoticeForm key={selected.id} notice={selected} /></Card>}
      <NoticeDeletionFeedback />
      {!notices.length ? <Card><h2 className="text-lg font-semibold">No Notices recorded</h2></Card> :
        <section aria-label="Existing Notices" className="space-y-4">{notices.map(notice => <Card key={notice.id}>
          <h2 className="wrap-anywhere text-lg font-semibold">{notice.title}</h2>
          <p className="mt-3 whitespace-pre-wrap wrap-anywhere">{notice.message}</p>
          <dl className="my-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div><dt>Created (UTC)</dt><dd>{notice.created_at}</dd></div>
            <div><dt>Updated (UTC)</dt><dd>{notice.updated_at}</dd></div>
            <div><dt>Revision</dt><dd>{notice.revision}</dd></div>
          </dl>
          <Link href={`/admin/notices?edit=${notice.id}`} className={buttonStyles.secondary}>Edit Notice</Link>
          <DeleteNoticeControl key={`${notice.id}-${notice.revision}`} notice={notice} />
        </Card>)}</section>}
    </>}
  </div>;
}
