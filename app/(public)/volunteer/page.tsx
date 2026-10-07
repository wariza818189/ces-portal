import { connection } from "next/server";
import { CesLocationMap } from "@/components/maps/ces-location-map";
import { VolunteerForm } from "@/components/volunteers/volunteer-form";
import { Card } from "@/components/ui/card";

export default async function VolunteerPage() {
  await connection();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-primary">
          Community Extension Services
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Volunteer Registration
        </h1>

        <p className="mt-3 text-base leading-6 text-muted-foreground">
          Register as a student volunteer for a CES activity in this local demonstration.
        </p>
      </header>

      <aside className="rounded-xl border border-warning-border bg-warning-surface p-5 text-sm leading-6 text-warning">
        <h2 className="font-semibold">SYNTHETIC / LOCAL DEMO ONLY</h2>
        <p className="mt-2">Classroom/local demonstration using synthetic test information only.</p>
        <p className="mt-2">Do not enter real personal information. Real-data collection and public production deployment are not approved.</p>
      </aside>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="volunteer-form-heading" className="min-w-0">
          <Card>
            <h2 id="volunteer-form-heading" className="mb-2 text-lg font-semibold text-foreground">Volunteer Registration</h2>
            <VolunteerForm />
          </Card>
        </section>
        <CesLocationMap />
      </div>
    </div>
  );
}
