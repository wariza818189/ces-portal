import { connection } from "next/server";
import { VolunteerExperience } from "@/components/volunteers/volunteer-experience";
import { listPublicActivities, logActivityFailure, type PublicActivity } from "@/lib/activities";
import { getCesLocationMap } from "@/lib/ces-map";

export default async function VolunteerPage() {
  await connection();
  let activities: PublicActivity[] | null = null;
  try { activities = await listPublicActivities(); } catch (error) { logActivityFailure("Public Activities load failed.", error); }
  const demoMap = getCesLocationMap(process.env.CES_MAP_VENUE_NAME, process.env.CES_MAP_LATITUDE, process.env.CES_MAP_LONGITUDE);
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
      <VolunteerExperience activities={activities} demoMap={demoMap} />
    </div>
  );
}
