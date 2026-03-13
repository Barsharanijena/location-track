/**
 * Geocode Service — wraps Nominatim (OpenStreetMap) API.
 *
 * All outbound requests are routed through this service so the
 * semantic cache layer sits transparently in front.
 */

import { NominatimResult, ParsedAddress } from "../types/index";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "DeliveryPWA/1.0 (github.com/delivery-pwa)";

// Maharashtra bounding box  [minLng, minLat, maxLng, maxLat]
const MH_VIEWBOX = "72.6,15.6,80.9,22.1";

function mapNominatimToAddress(raw: NominatimResult): ParsedAddress {
  const a = raw.address;
  return {
    fullAddress: raw.display_name,
    houseNumber: a.house_number ?? "",
    road: a.road ?? "",
    suburb: a.suburb ?? a.city_district ?? "",
    city: a.city ?? a.county ?? a.district ?? "",
    district: a.state_district ?? a.district ?? "",
    state: a.state ?? "",
    postcode: a.postcode ?? "",
    country: a.country ?? "India",
    coordinates: {
      lat: parseFloat(raw.lat),
      lng: parseFloat(raw.lon),
    },
  };
}

export async function searchAddress(query: string): Promise<ParsedAddress[]> {
  const params = new URLSearchParams({
    q: `${query}, Maharashtra, India`,
    format: "json",
    addressdetails: "1",
    limit: "5",
    countrycodes: "in",
    viewbox: MH_VIEWBOX,
    bounded: "0",
  });

  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Nominatim search failed: ${response.status} ${response.statusText}`);
  }

  const raw: NominatimResult[] = await response.json() as NominatimResult[];
  return raw.map(mapNominatimToAddress);
}

export async function reverseGeocode(lat: number, lng: number): Promise<ParsedAddress | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
  });

  const url = `${NOMINATIM_BASE}/reverse?${params.toString()}`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Nominatim reverse geocode failed: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json() as NominatimResult;
  if (!raw || !raw.lat) return null;
  return mapNominatimToAddress(raw);
}

export async function autocomplete(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: `${query}, Maharashtra, India`,
    format: "json",
    addressdetails: "0",
    limit: "8",
    countrycodes: "in",
    viewbox: MH_VIEWBOX,
    bounded: "0",
  });

  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Nominatim autocomplete failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<NominatimResult[]>;
}
