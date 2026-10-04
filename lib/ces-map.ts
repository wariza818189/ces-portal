import "server-only";

const controlCharacters = /\p{Cc}/u;
const decimalCoordinate = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;
const viewportHalfSpan = 0.002;

function parseCoordinate(value: string | undefined, limit: number): number | null {
  if (!value || controlCharacters.test(value)) return null;
  const text = value.trim();
  if (!text || text.length > 64 || !decimalCoordinate.test(text)) return null;
  const coordinate = Number(text);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= limit ? coordinate : null;
}

export function getCesLocationMap(
  venueValue: string | undefined,
  latitudeValue: string | undefined,
  longitudeValue: string | undefined,
) {
  const venue = venueValue?.trim();
  const latitude = parseCoordinate(latitudeValue, 90);
  const longitude = parseCoordinate(longitudeValue, 180);
  if (!venue || controlCharacters.test(venueValue ?? "") || /[<>]/u.test(venue)
    || Array.from(venue).length > 250 || latitude === null || longitude === null) {
    return { venue: null, mapsUrl: null, embedUrl: null };
  }

  // Clamp only the derived viewport, never invalid configured marker coordinates.
  // bbox order is left,bottom,right,top; near geographic edges the marker is off-center.
  const bounds = [
    Math.max(-180, longitude - viewportHalfSpan),
    Math.max(-90, latitude - viewportHalfSpan),
    Math.min(180, longitude + viewportHalfSpan),
    Math.min(90, latitude + viewportHalfSpan),
  ];
  const embedUrl = new URL("https://www.openstreetmap.org/export/embed.html");
  embedUrl.searchParams.set("bbox", bounds.join(","));
  embedUrl.searchParams.set("layer", "mapnik");
  embedUrl.searchParams.set("marker", [latitude, longitude].join(","));

  const mapsUrl = new URL("https://www.openstreetmap.org/");
  mapsUrl.searchParams.set("mlat", String(latitude));
  mapsUrl.searchParams.set("mlon", String(longitude));
  mapsUrl.hash = ["map=17", latitude, longitude].join("/");

  return { venue, mapsUrl: mapsUrl.toString(), embedUrl: embedUrl.toString() };
}
