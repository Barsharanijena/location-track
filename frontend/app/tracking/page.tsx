"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AgentInfoPanel } from "@/components/tracking/AgentInfoPanel";
import { SimulationControls } from "@/components/tracking/SimulationControls";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import { SIMULATION_ROUTES } from "@/lib/routes";
import { Coordinates } from "@/types/index";

const TrackingMap = dynamic(
  () => import("@/components/map/TrackingMap").then((m) => m.TrackingMap),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      Loading map…
    </div>
  );
}

const AGENT_ID = "agent-001";

export default function TrackingPage() {
  const {
    trackingState,
    agentLocation,
    locationHistory,
    connect,
    disconnect,
    startSimulation,
    stopSimulation,
  } = useDeliveryTracking(AGENT_ID);

  const [routeWaypoints, setRouteWaypoints] = useState<Coordinates[]>(
    SIMULATION_ROUTES[0].waypoints
  );

  const handleStart = (payload: Parameters<typeof startSimulation>[0]) => {
    setRouteWaypoints(payload.route);
    startSimulation(payload);
  };

  const isArrived = trackingState.status === "arrived";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Live Delivery Tracking</h1>
        <p className="mt-1.5 text-emerald-100 text-sm">
          Simulate a delivery agent moving across Maharashtra in real time.
        </p>
      </div>

      {isArrived && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Agent has arrived at the destination.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="h-[500px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <TrackingMap
            agentLocation={agentLocation}
            locationHistory={locationHistory}
            routeWaypoints={routeWaypoints}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SimulationControls
            trackingState={trackingState}
            onConnect={connect}
            onDisconnect={disconnect}
            onStart={handleStart}
            onStop={stopSimulation}
          />
          <AgentInfoPanel agentLocation={agentLocation} />
        </div>
      </div>
    </div>
  );
}
