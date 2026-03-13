"use client";

import { AgentLocation, AgentStatus } from "@/types/index";
import { Badge } from "@/components/ui/Badge";

interface AgentInfoPanelProps {
  agentLocation: AgentLocation | null;
}

const STATUS_BADGE: Record<AgentStatus, { label: string; variant: "green" | "blue" | "yellow" | "gray" | "red" }> = {
  idle:     { label: "Idle",     variant: "gray"   },
  en_route: { label: "En Route", variant: "blue"   },
  arrived:  { label: "Arrived",  variant: "green"  },
  offline:  { label: "Offline",  variant: "red"    },
};

export function AgentInfoPanel({ agentLocation }: AgentInfoPanelProps) {
  if (!agentLocation) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
        Waiting for agent location…
      </div>
    );
  }

  const { label, variant } = STATUS_BADGE[agentLocation.status];
  const updatedAt = new Date(agentLocation.timestamp).toLocaleTimeString();

  return (
    <section aria-label="Agent info" className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">{agentLocation.agentName}</h2>
        <Badge label={label} variant={variant} />
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {[
          { label: "Latitude",  value: agentLocation.coordinates.lat.toFixed(6) },
          { label: "Longitude", value: agentLocation.coordinates.lng.toFixed(6) },
          { label: "Speed",     value: `${agentLocation.speed} km/h` },
          { label: "Heading",   value: `${Math.round(agentLocation.heading)}°` },
          { label: "Updated",   value: updatedAt },
        ].map(({ label: l, value }) => (
          <div key={l} className="flex flex-col">
            <dt className="text-xs font-medium text-gray-500">{l}</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
