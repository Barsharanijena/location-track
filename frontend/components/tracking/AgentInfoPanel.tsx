"use client";

import { AgentLocation, AgentStatus } from "@/types/index";
import { Badge } from "@/components/ui/Badge";

interface AgentInfoPanelProps {
  agentLocation: AgentLocation | null;
}

const STATUS_BADGE: Record<AgentStatus, { label: string; variant: "green" | "blue" | "yellow" | "gray" | "red" }> = {
  idle:     { label: "Idle",     variant: "gray"  },
  en_route: { label: "En Route", variant: "blue"  },
  arrived:  { label: "Arrived",  variant: "green" },
  offline:  { label: "Offline",  variant: "red"   },
};

export function AgentInfoPanel({ agentLocation }: AgentInfoPanelProps) {
  if (!agentLocation) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <div className="text-2xl mb-1">📡</div>
        <p className="text-sm text-slate-500">Waiting for agent location…</p>
      </div>
    );
  }

  const { label, variant } = STATUS_BADGE[agentLocation.status];
  const updatedAt = new Date(agentLocation.timestamp).toLocaleTimeString();

  const stats = [
    { label: "Latitude",  value: agentLocation.coordinates.lat.toFixed(6), icon: "📐" },
    { label: "Longitude", value: agentLocation.coordinates.lng.toFixed(6), icon: "📏" },
    { label: "Speed",     value: `${agentLocation.speed} km/h`,            icon: "⚡" },
    { label: "Heading",   value: `${Math.round(agentLocation.heading)}°`,  icon: "🧭" },
    { label: "Updated",   value: updatedAt,                                 icon: "🕐" },
  ];

  return (
    <section aria-label="Agent info" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-bold">
            {agentLocation.agentName[0]}
          </div>
          <h2 className="font-semibold text-slate-800">{agentLocation.agentName}</h2>
        </div>
        <Badge label={label} variant={variant} />
      </div>

      <dl className="grid grid-cols-2 gap-2.5">
        {stats.map(({ label: l, value, icon }) => (
          <div key={l} className="rounded-lg bg-slate-50 px-3 py-2.5">
            <dt className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <span>{icon}</span>{l}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
