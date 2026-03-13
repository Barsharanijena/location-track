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

  const statusColor = isConnected ? "bg-emerald-500" : "bg-slate-400";

  return (
    <section aria-label="Simulation controls" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h2 className="font-semibold text-slate-800">Simulation Controls</h2>

      <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${statusColor} shadow-sm`} aria-hidden="true" />
        <span className="text-sm text-slate-600 capitalize flex-1">{trackingState.status}</span>
        {trackingState.status === "connecting" && <Spinner size="sm" />}
        {!isConnected ? (
          <button
            onClick={onConnect}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white
                       hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-600
                       hover:bg-slate-100 focus:outline-none transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="agent-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Agent Name
        </label>
        <input
          id="agent-name"
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                     focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="route-select" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Route
        </label>
        <select
          id="route-select"
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                     focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
        >
          {SIMULATION_ROUTES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={handleStart}
          disabled={!isConnected || isSimulating}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white
                     hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50
                     focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors shadow-sm"
        >
          ▶ Start
        </button>

        <button
          onClick={onStop}
          disabled={!isSimulating}
          className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600
                     hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50
                     focus:outline-none transition-colors"
        >
          ■ Stop
        </button>
      </div>

      {"message" in trackingState && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{trackingState.message}</p>
      )}
    </section>
  );
}
