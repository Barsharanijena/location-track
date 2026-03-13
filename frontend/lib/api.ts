import {
  AutocompleteResponse,
  Coordinates,
  GeocodeResponse,
  ParsedAddress,
} from "@/types/index";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function geocodeAddress(query: string): Promise<GeocodeResponse> {
  return post<GeocodeResponse>("/api/geocode", { query });
}

export async function reverseGeocodeCoords(
  coords: Coordinates
): Promise<{ result: ParsedAddress | null; fromCache: boolean }> {
  return post("/api/geocode/reverse", coords);
}

export async function fetchAutocompleteSuggestions(
  q: string
): Promise<AutocompleteResponse> {
  return get<AutocompleteResponse>(
    `/api/geocode/autocomplete?q=${encodeURIComponent(q)}`
  );
}

export async function buildRoute(from: Coordinates, to: Coordinates): Promise<Coordinates[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM error");
    const data = await res.json() as { routes: { geometry: { coordinates: [number, number][] } }[] };
    const coords = data.routes[0].geometry.coordinates;
    const step = Math.max(1, Math.floor(coords.length / 40));
    const thinned = coords.filter((_, i) => i % step === 0 || i === coords.length - 1);
    return thinned.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return Array.from({ length: 10 }, (_, i) => ({
      lat: from.lat + (to.lat - from.lat) * (i / 9),
      lng: from.lng + (to.lng - from.lng) * (i / 9),
    }));
  }
}
