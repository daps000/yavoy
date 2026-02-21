const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "YaVoy-RuralRideshare/1.0 (contact@yavoy.info)";

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "es",
    },
  });
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeTown(townName: string): Promise<GeocodedLocation | null> {
  try {
    const query = encodeURIComponent(townName + ", España");
    const url = `${NOMINATIM_BASE}?format=json&q=${query}&limit=1&countrycodes=es`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      console.error(`Nominatim geocoding failed with status ${response.status}`);
      return null;
    }

    const results = await response.json();
    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error for", townName, error);
    return null;
  }
}

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
