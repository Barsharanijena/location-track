"use client";

import { useCallback, useRef, useState } from "react";
import { SIMULATION_ROUTES } from "@/lib/routes";
import { buildRoute, fetchAutocompleteSuggestions, geocodeAddress } from "@/lib/api";
import { SimulationStartPayload, Coordinates } from "@/types/index";
import { TrackingState } from "@/hooks/useDeliveryTracking";
import { Spinner } from "@/components/ui/Spinner";

const CUSTOM_ID = "custom";

interface SimulationControlsProps {
  trackingState: TrackingState;
  onConnect: () => void;
  onDisconnect: () => void;
  onStart: (payload: Omit<SimulationStartPayload, "agentId">) => void;
  onStop: () => void;
}

function AddressInput({
  id, label, value, onChange, onSelect,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; onSelect: (v: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (v: string) => {
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetchAutocompleteSuggestions(v);
        setSuggestions(res.suggestions.map((s) => s.displayName));
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 350);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search Maharashtra location…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                   focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => { onSelect(s); onChange(s); setOpen(false); }}
              className="cursor-pointer px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SimulationControls({
  trackingState, onConnect, onDisconnect, onStart, onStop,
}: SimulationControlsProps) {
  const [selectedRouteId, setSelectedRouteId] = useState(SIMULATION_ROUTES[0].id);
  const [agentName, setAgentName] = useState("Rahul Kumar");

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress]     = useState("");
  const [customWaypoints, setCustomWaypoints] = useState<Coordinates[] | null>(null);
  const [isBuilding, setIsBuilding]   = useState(false);
  const [buildError, setBuildError]   = useState<string | null>(null);

  const isConnected = ["connected", "simulating", "arrived"].includes(trackingState.status);
  const isSimulating = trackingState.status === "simulating";
  const isCustom = selectedRouteId === CUSTOM_ID;
  const canStart = isConnected && !isSimulating && (isCustom ? !!customWaypoints : true);

  const handleBuildRoute = useCallback(async () => {
    if (!fromAddress.trim() || !toAddress.trim()) return;
    setIsBuilding(true); setBuildError(null); setCustomWaypoints(null);
    try {
      const [fromRes, toRes] = await Promise.all([
        geocodeAddress(fromAddress),
        geocodeAddress(toAddress),
      ]);
      if (!fromRes.results[0] || !toRes.results[0])
        throw new Error("Could not geocode one of the addresses");
      const waypoints = await buildRoute(fromRes.results[0].coordinates, toRes.results[0].coordinates);
      setCustomWaypoints(waypoints);
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : "Failed to build route");
    } finally {
      setIsBuilding(false);
    }
  }, [fromAddress, toAddress]);

  const handleStart = () => {
    if (isCustom) {
      if (!customWaypoints) return;
      onStart({ agentName, route: customWaypoints, intervalMs: 800 });
    } else {
      const route = SIMULATION_ROUTES.find((r) => r.id === selectedRouteId);
      if (route) onStart({ agentName, route: route.waypoints, intervalMs: 800 });
    }
  };

  const statusColor = isConnected ? "bg-emerald-500" : "bg-slate-400";

  return (
    <section aria-label="Simulation controls" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h2 className="font-semibold text-slate-800">Simulation Controls</h2>

      {/* Connection row */}
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${statusColor} shadow-sm`} aria-hidden="true" />
        <span className="text-sm text-slate-600 capitalize flex-1">{trackingState.status}</span>
        {trackingState.status === "connecting" && <Spinner size="sm" />}
        {!isConnected ? (
          <button onClick={onConnect} className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors">Connect</button>
        ) : (
          <button onClick={onDisconnect} className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors">Disconnect</button>
        )}
      </div>

      {/* Agent name */}
      <div className="space-y-1.5">
        <label htmlFor="agent-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Agent Name</label>
        <input
          id="agent-name" type="text" value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
        />
      </div>

      {/* Route selector */}
      <div className="space-y-1.5">
        <label htmlFor="route-select" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Route</label>
        <select
          id="route-select" value={selectedRouteId}
          onChange={(e) => { setSelectedRouteId(e.target.value); setCustomWaypoints(null); setBuildError(null); }}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
        >
          {SIMULATION_ROUTES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          <option value={CUSTOM_ID}>✏️ Custom Route…</option>
        </select>
      </div>

      {/* Custom route builder */}
      {isCustom && (
        <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50 p-3">
          <AddressInput id="from-addr" label="From" value={fromAddress} onChange={setFromAddress} onSelect={setFromAddress} />
          <AddressInput id="to-addr"   label="To"   value={toAddress}   onChange={setToAddress}   onSelect={setToAddress}   />
          <button
            onClick={handleBuildRoute}
            disabled={isBuilding || !fromAddress.trim() || !toAddress.trim()}
            className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none transition-colors"
          >
            {isBuilding
              ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" />Building route…</span>
              : "Build Route"}
          </button>
          {buildError && <p className="text-xs text-red-600">{buildError}</p>}
          {customWaypoints && (
            <p className="text-xs font-medium text-emerald-700">✓ Route ready — {customWaypoints.length} waypoints</p>
          )}
        </div>
      )}

      {/* Start / Stop */}
      <div className="flex gap-2.5">
        <button onClick={handleStart} disabled={!canStart}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors shadow-sm">
          ▶ Start
        </button>
        <button onClick={onStop} disabled={!isSimulating}
          className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none transition-colors">
          ■ Stop
        </button>
      </div>

      {"message" in trackingState && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{trackingState.message}</p>
      )}
    </section>
  );
}
