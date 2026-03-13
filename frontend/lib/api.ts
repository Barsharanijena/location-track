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
