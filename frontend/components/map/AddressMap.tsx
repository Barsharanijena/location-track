"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { Coordinates, ParsedAddress } from "@/types/index";
import { LeafletMap } from "./LeafletMap";

interface AddressMapProps {
  address: ParsedAddress;
  onMapClick?: (coords: Coordinates) => void;
}

export function AddressMap({ address, onMapClick }: AddressMapProps) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { lat, lng } = address.coordinates;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setPopupContent(address.fullAddress);
    } else {
      markerRef.current = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(address.fullAddress)
        .openPopup();
    }

    map.setView([lat, lng], 16);
  }, [address]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !onMapClick) return;

    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [onMapClick]);

  return (
    <LeafletMap
      center={address.coordinates}
      zoom={16}
      className="h-full w-full rounded-lg"
      onMapReady={(map) => {
        mapInstanceRef.current = map;

        const { lat, lng } = address.coordinates;
        markerRef.current = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(address.fullAddress)
          .openPopup();
      }}
    />
  );
}
