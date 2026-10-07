import "server-only";
import { getCesLocationMap } from "@/lib/ces-map";

export function CesLocationMap() {
  // The parent page awaits connection() before rendering runtime configuration.
  const map = getCesLocationMap(
    process.env.CES_MAP_VENUE_NAME,
    process.env.CES_MAP_LATITUDE,
    process.env.CES_MAP_LONGITUDE,
  );

  return (
    <section aria-labelledby="ces-venue-heading" className="min-w-0 rounded-xl border border-border bg-surface p-5 text-sm leading-6 text-muted-foreground sm:p-6">
      <h2 id="ces-venue-heading" className="text-lg font-semibold text-foreground">CES venue for this demonstration</h2>
      {map.venue ? (
        <>
          <p className="mt-2 wrap-anywhere font-medium text-foreground">{map.venue}</p>
          <p className="mt-2">This configured venue is independent of the Activity text you enter in the registration form.</p>
        </>
      ) : <p className="mt-2">Venue information unavailable.</p>}
      {map.embedUrl ? (
        <iframe src={map.embedUrl} title="OpenStreetMap showing the CES demonstration venue"
          width="100%" height="320" loading="lazy" allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="mt-4 block h-80 w-full rounded-lg border border-border" />
      ) : <p className="mt-4 rounded-lg border border-border bg-hover-surface p-4 font-medium">Map unavailable.</p>}
      {map.mapsUrl && (
        <p className="mt-3">
          <a href={map.mapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-medium text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            Open in OpenStreetMap<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}
      {map.embedUrl && (
        <p className="mt-2 text-muted-foreground">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"
            className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">OpenStreetMap contributors<span className="sr-only"> (opens in a new tab)</span></a>
        </p>
      )}
      <p className="mt-3 text-muted-foreground">OpenStreetMap provides the map. Loading it connects your browser to OpenStreetMap services.</p>
      {map.embedUrl && <p className="mt-2 text-muted-foreground">If the map does not load, use the venue text or the OpenStreetMap link above.</p>}
    </section>
  );
}
