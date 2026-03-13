"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AgentLocation, Coordinates, SimulationStartPayload } from "@/types/index";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export type TrackingState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "simulating" }
  | { status: "arrived" }
  | { status: "error"; message: string };

export function useDeliveryTracking(agentId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [trackingState, setTrackingState] = useState<TrackingState>({ status: "disconnected" });
  const [agentLocation, setAgentLocation] = useState<AgentLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<Coordinates[]>([]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setTrackingState({ status: "connecting" });

    const socket = io(`${BACKEND_URL}/tracking`, {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      setTrackingState({ status: "connected" });
      socket.emit("subscribe", { agentId });
    });

    socket.on("location:update", (loc: AgentLocation) => {
      setAgentLocation(loc);
      setLocationHistory((prev) => [...prev, loc.coordinates]);
      if (loc.status === "en_route") {
        setTrackingState({ status: "simulating" });
      }
    });

    socket.on("simulation:complete", () => {
      setTrackingState({ status: "arrived" });
    });

    socket.on("error", (payload: { message: string }) => {
      setTrackingState({ status: "error", message: payload.message });
    });

    socket.on("disconnect", () => {
      setTrackingState({ status: "disconnected" });
    });

    socket.on("connect_error", (err) => {
      setTrackingState({ status: "error", message: err.message });
    });

    socketRef.current = socket;
  }, [agentId]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setTrackingState({ status: "disconnected" });
  }, []);

  const startSimulation = useCallback(
    (payload: Omit<SimulationStartPayload, "agentId">) => {
      if (!socketRef.current?.connected) return;
      setLocationHistory([]);
      setAgentLocation(null);
      socketRef.current.emit("simulation:start", { ...payload, agentId });
    },
    [agentId]
  );

  const stopSimulation = useCallback(() => {
    socketRef.current?.emit("simulation:stop", { agentId });
    setTrackingState({ status: "connected" });
  }, [agentId]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    trackingState,
    agentLocation,
    locationHistory,
    connect,
    disconnect,
    startSimulation,
    stopSimulation,
  };
}
