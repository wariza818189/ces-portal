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
    <section aria-labelledby="ces-venue-heading" className="mt-6 min-w-0 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-slate-700">
      <h2 id="ces-venue-heading" className="font-semibold text-slate-900">CES venue for this demonstration</h2>
      {map.venue ? (
        <>
          <p className="mt-2 wrap-anywhere">{map.venue}</p>
          <p className="mt-2">This configured venue is independent of the Activity text you enter below.</p>
        </>
      ) : <p className="mt-2">Venue information unavailable.</p>}
      {map.embedUrl ? (
        <iframe src={map.embedUrl} title="OpenStreetMap showing the CES demonstration venue"
          width="100%" height="320" loading="lazy" allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="mt-3 block h-80 w-full rounded-lg border-0" />
      ) : <p className="mt-3 font-medium">Map unavailable.</p>}
      {map.mapsUrl && (
        <p className="mt-3">
          <a href={map.mapsUrl} target="_blank" rel="noopener noreferrer"
            className="font-medium text-sky-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
            Open in OpenStreetMap<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}
      {map.embedUrl && (
        <p className="mt-2 text-slate-600">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"
            className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">OpenStreetMap contributors<span className="sr-only"> (opens in a new tab)</span></a>
        </p>
      )}
      <p className="mt-3 text-slate-600">OpenStreetMap provides the map. Loading it connects your browser to OpenStreetMap services.</p>
      {map.embedUrl && <p className="mt-2 text-slate-600">If the map does not load, use the venue text or the OpenStreetMap link above.</p>}
    </section>
  );
}
