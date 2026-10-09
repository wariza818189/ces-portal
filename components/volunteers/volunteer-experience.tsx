"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicActivity } from "@/lib/activities";
import { VolunteerForm } from "@/components/volunteers/volunteer-form";
import { LocationCard, type LocationDescriptor } from "@/components/maps/location-card";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button-styles";
export function VolunteerExperience({ activities, demoMap }: { activities: PublicActivity[] | null; demoMap: LocationDescriptor }) {
  const [selectedId, setSelectedId] = useState("");
  const router = useRouter();
  const selected = activities?.find(activity => activity.id === selectedId);
  const map = selectedId ? { ...(selected?.map ?? { embedUrl: null, mapsUrl: null }), venue: selected?.venue_name ?? null } : demoMap;
  return <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[3fr_2fr]">
    <section aria-labelledby="volunteer-form-heading" className="min-w-0"><Card>
      <h2 id="volunteer-form-heading" className="mb-2 text-lg font-semibold">Volunteer Registration</h2>
      {/* Keep an existing form mounted during refresh so personal drafts survive. */}
      {activities === null && <p role="alert" className="text-error">Unable to load registration activities.</p>}
      {activities !== null && !activities.length && <p role="status">No CES volunteer activities are currently open for registration.</p>}
      {activities?.length || selectedId ? <VolunteerForm activities={activities ?? []} selectedId={selectedId} onSelect={setSelectedId} /> : <button type="button" onClick={() => router.refresh()} className={`${buttonStyles.secondary} mt-4`}>Retry loading Activities</button>}
    </Card></section>
    <LocationCard map={map} heading={selectedId ? "Selected Activity venue" : "Configured CES demonstration venue"} description={selectedId ? "Venue information for the selected CES Activity." : "This configured venue is demonstration context and is not the location of a selected Activity."} />
  </div>;
}
