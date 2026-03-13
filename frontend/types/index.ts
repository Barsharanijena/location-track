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

export interface GeocodeResponse {
  results: ParsedAddress[];
  fromCache: boolean;
  cacheKey?: string;
}

export interface AutocompleteSuggestion {
  displayName: string;
  placeId: number;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

// ─── Delivery Tracking ───────────────────────────────────────────────────────

export type AgentStatus = "idle" | "en_route" | "arrived" | "offline";

export interface AgentLocation {
  agentId: string;
  agentName: string;
  coordinates: Coordinates;
  speed: number;
  heading: number;
  timestamp: number;
  status: AgentStatus;
}

export interface SimulationStartPayload {
  agentId: string;
  agentName: string;
  route: Coordinates[];
  intervalMs: number;
}
