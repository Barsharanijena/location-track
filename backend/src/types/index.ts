// ─── Geocoding ───────────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ParsedAddress {
  fullAddress: string;
  houseNumber: string;
  road: string;
  suburb: string;
  city: string;
  district: string;
  state: string;
  postcode: string;
  country: string;
  coordinates: Coordinates;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    city_district?: string;
    county?: string;
    district?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface GeocodeRequest {
  query: string;
}

export interface GeocodeResponse {
  results: ParsedAddress[];
  fromCache: boolean;
  cacheKey?: string;
}

export interface AutocompleteResponse {
  suggestions: Array<{
    displayName: string;
    placeId: number;
  }>;
}

// ─── Semantic Cache ───────────────────────────────────────────────────────────

export interface CacheEntry {
  query: string;
  results: ParsedAddress[];
  coordinates: Coordinates;
  geohash: string;
  createdAt: number;
  hitCount: number;
}

// ─── Delivery Tracking ───────────────────────────────────────────────────────

export interface AgentLocation {
  agentId: string;
  agentName: string;
  coordinates: Coordinates;
  speed: number;       // km/h
  heading: number;     // degrees 0–360
  timestamp: number;
  status: AgentStatus;
}

export type AgentStatus = "idle" | "en_route" | "arrived" | "offline";

export interface TrackingSubscribePayload {
  agentId: string;
}

export interface SimulationStartPayload {
  agentId: string;
  agentName: string;
  route: Coordinates[];   // waypoints to follow
  intervalMs: number;
}
