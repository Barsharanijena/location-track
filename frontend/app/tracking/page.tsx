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
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Delivery Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Simulate a delivery agent moving across Maharashtra in real time.
        </p>
      </div>

      {isArrived && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          Agent has arrived at the destination.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="h-[480px] overflow-hidden rounded-xl border border-gray-200 shadow-sm">
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
