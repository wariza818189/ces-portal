import { DonationTabs } from "@/components/donations/donation-tabs";
import { PageHeader } from "@/components/layout/page-header";

export default function AddDonationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Donation"
        description="Record goods or cash received by CES."
      />

      <DonationTabs />
    </div>
  );
}
