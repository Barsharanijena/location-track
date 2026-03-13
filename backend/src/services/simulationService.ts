/**
 * Simulation Service
 *
 * Interpolates an agent along a polyline route and emits periodic
 * AgentLocation updates via the provided callback.
 */

import { AgentLocation, Coordinates, SimulationStartPayload } from "../types/index";

interface RunningSimulation {
  agentId: string;
  timer: NodeJS.Timeout;
}

const activeSimulations = new Map<string, RunningSimulation>();

function interpolate(a: Coordinates, b: Coordinates, t: number): Coordinates {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

function bearing(a: Coordinates, b: Coordinates): number {
  const dLng = b.lng - a.lng;
  const y = Math.sin((dLng * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.cos((dLng * Math.PI) / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c =
    2 *
    Math.atan2(
      Math.sqrt(sinDLat * sinDLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng),
      Math.sqrt(1 - sinDLat * sinDLat - Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng)
    );
  return R * c;
}

export function startSimulation(
  payload: SimulationStartPayload,
  onUpdate: (loc: AgentLocation) => void,
  onComplete: (agentId: string) => void
): void {
  stopSimulation(payload.agentId);

  const { agentId, agentName, route, intervalMs } = payload;
  if (route.length < 2) return;

  let segmentIndex = 0;
  let progress = 0; // 0..1 within current segment

  // Compute speed-based step per tick
  const speedKmh = 30; // simulated speed
  const stepKm = (speedKmh / 3600) * (intervalMs / 1000);

  const timer = setInterval(() => {
    const from = route[segmentIndex];
    const to = route[segmentIndex + 1];
    const segLenKm = haversineKm(from, to);

    progress += segLenKm > 0 ? stepKm / segLenKm : 1;

    if (progress >= 1) {
      segmentIndex += 1;
      progress = 0;
    }

    if (segmentIndex >= route.length - 1) {
      const last = route[route.length - 1];
      onUpdate({
        agentId,
        agentName,
        coordinates: last,
        speed: 0,
        heading: 0,
        timestamp: Date.now(),
        status: "arrived",
      });
      stopSimulation(agentId);
      onComplete(agentId);
      return;
    }

    const currentFrom = route[segmentIndex];
    const currentTo = route[segmentIndex + 1];
    const pos = interpolate(currentFrom, currentTo, Math.min(progress, 1));

    onUpdate({
      agentId,
      agentName,
      coordinates: pos,
      speed: speedKmh,
      heading: bearing(currentFrom, currentTo),
      timestamp: Date.now(),
      status: "en_route",
    });
  }, intervalMs);

  activeSimulations.set(agentId, { agentId, timer });
}

export function stopSimulation(agentId: string): void {
  const sim = activeSimulations.get(agentId);
  if (sim) {
    clearInterval(sim.timer);
    activeSimulations.delete(agentId);
  }
}

export function isSimulationRunning(agentId: string): boolean {
  return activeSimulations.has(agentId);
}
