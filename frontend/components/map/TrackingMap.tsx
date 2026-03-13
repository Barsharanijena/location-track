"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { AgentLocation, Coordinates } from "@/types/index";
import { LeafletMap } from "./LeafletMap";

const PUNE_CENTER: Coordinates = { lat: 18.5204, lng: 73.8567 };

function createAgentIcon(heading: number): L.DivIcon {
  return L.divIcon({
    className: "agent-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="transform:rotate(${heading}deg);width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        <circle cx="12" cy="12" r="10" fill="#2563eb" opacity="0.9"/>
        <polygon points="12,4 17,17 12,14 7,17" fill="white"/>
      </svg>
    </div>`,
  });
}

interface TrackingMapProps {
  agentLocation: AgentLocation | null;
  locationHistory: Coordinates[];
  routeWaypoints?: Coordinates[];
}

export function TrackingMap({ agentLocation, locationHistory, routeWaypoints }: TrackingMapProps) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef     = useRef<L.Marker | null>(null);
  const trailRef      = useRef<L.Polyline | null>(null);
  const routeLineRef  = useRef<L.Polyline | null>(null);

  // Draw planned route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routeWaypoints || routeWaypoints.length < 2) return;
    routeLineRef.current?.remove();
    routeLineRef.current = L.polyline(
      routeWaypoints.map((c) => [c.lat, c.lng]),
      { color: "#94a3b8", weight: 3, dashArray: "8 6", opacity: 0.7 }
    ).addTo(map);
    map.fitBounds(L.latLngBounds(routeWaypoints.map((c) => [c.lat, c.lng])), { padding: [40, 40] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeWaypoints]);

  // Move agent marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !agentLocation) return;

    const { lat, lng } = agentLocation.coordinates;

    if (markerRef.current) {
      // Move position
      markerRef.current.setLatLng([lat, lng]);

      // Rotate the existing icon div in-place — no DOM recreation
      const el = markerRef.current.getElement();
      const div = el?.querySelector<HTMLElement>("div");
      if (div) div.style.transform = `rotate(${agentLocation.heading}deg)`;
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon: createAgentIcon(agentLocation.heading),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`<b>${agentLocation.agentName}</b><br/>Speed: ${agentLocation.speed} km/h`);
    }
  }, [agentLocation]);

  // Draw trail
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    trailRef.current?.remove();
    if (locationHistory.length < 2) return;
    trailRef.current = L.polyline(
      locationHistory.map((c) => [c.lat, c.lng]),
      { color: "#2563eb", weight: 3, opacity: 0.8 }
    ).addTo(map);
  }, [locationHistory]);

  return (
    <LeafletMap
      center={agentLocation?.coordinates ?? PUNE_CENTER}
      zoom={14}
      className="h-full w-full rounded-lg"
      onMapReady={(map) => { mapInstanceRef.current = map; }}
    />
  );
}
