"use client";

import { useCallback, useEffect, useState } from "react";
import { Coordinates } from "@/types/index";

export type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; coordinates: Coordinates }
  | { status: "denied" }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation is not supported by this browser." });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "success",
          coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
      },
      (err) => {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setState({ status: "denied" });
        } else {
          setState({ status: "error", message: err.message });
        }
      },
      { timeout: 10_000, maximumAge: 60_000 }
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { state, retry: request };
}
