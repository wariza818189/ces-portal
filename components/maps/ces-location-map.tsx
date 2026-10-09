import "server-only";
import { getCesLocationMap } from "@/lib/ces-map";
import { LocationCard } from "@/components/maps/location-card";
export function CesLocationMap() {
  const map = getCesLocationMap(process.env.CES_MAP_VENUE_NAME, process.env.CES_MAP_LATITUDE, process.env.CES_MAP_LONGITUDE);
  return <LocationCard map={map} heading="Configured CES demonstration venue" description="This configured venue is demonstration context and is not the location of a selected Activity." />;
}
