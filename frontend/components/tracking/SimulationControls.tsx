"use client";

import { useState } from "react";
import { SIMULATION_ROUTES } from "@/lib/routes";
import { SimulationStartPayload } from "@/types/index";
import { TrackingState } from "@/hooks/useDeliveryTracking";
import { Spinner } from "@/components/ui/Spinner";

interface SimulationControlsProps {
  trackingState: TrackingState;
  onConnect: () => void;
  onDisconnect: () => void;
  onStart: (payload: Omit<SimulationStartPayload, "agentId">) => void;
  onStop: () => void;
}

export function SimulationControls({
  trackingState,
  onConnect,
  onDisconnect,
  onStart,
  onStop,
}: SimulationControlsProps) {
  const [selectedRouteId, setSelectedRouteId] = useState(SIMULATION_ROUTES[0].id);
  const [agentName, setAgentName] = useState("Rahul Kumar");

  const isConnected =
    trackingState.status === "connected" ||
    trackingState.status === "simulating" ||
    trackingState.status === "arrived";

  const isSimulating = trackingState.status === "simulating";

  const handleStart = () => {
    const route = SIMULATION_ROUTES.find((r) => r.id === selectedRouteId);
    if (!route) return;
    onStart({ agentName, route: route.waypoints, intervalMs: 800 });
  };

  return (
    <section aria-label="Simulation controls" className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-gray-800">Simulation controls</h2>

      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
          aria-hidden="true"
        />
        <span className="text-sm text-gray-600 capitalize">{trackingState.status}</span>

        {trackingState.status === "connecting" && <Spinner size="sm" />}

        {!isConnected ? (
          <button
            onClick={onConnect}
            className="ml-auto rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white
                       hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="ml-auto rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-700
                       hover:bg-gray-50 focus:outline-none"
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="agent-name" className="block text-xs font-medium text-gray-600">
          Agent name
        </label>
        <input
          id="agent-name"
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="route-select" className="block text-xs font-medium text-gray-600">
          Route
        </label>
        <select
          id="route-select"
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          {SIMULATION_ROUTES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleStart}
          disabled={!isConnected || isSimulating}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white
                     hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50
                     focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        >
          Start simulation
        </button>

        <button
          onClick={onStop}
          disabled={!isSimulating}
          className="flex-1 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600
                     hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50
                     focus:outline-none"
        >
          Stop
        </button>
      </div>

      {"message" in trackingState && (
        <p role="alert" className="text-sm text-red-600">{trackingState.message}</p>
      )}
    </section>
  );
}
