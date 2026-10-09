import { DonationTabs } from "@/components/donations/donation-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth/session";

export default async function AddDonationPage() {
  await requireUser("/donations/new");
  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Add Donation"
        description="Record goods or cash received by CES."
      />

      <DonationTabs />
    </div>
  );
}
