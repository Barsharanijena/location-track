"use client";

import { ParsedAddress } from "@/types/index";
import { Badge } from "@/components/ui/Badge";

interface AddressFieldsProps {
  address: ParsedAddress;
  fromCache: boolean;
}

interface FieldRow {
  label: string;
  value: string;
  icon: string;
}

export function AddressFields({ address, fromCache }: AddressFieldsProps) {
  const fields: FieldRow[] = [
    { label: "House / Unit",  value: address.houseNumber || "—", icon: "🏠" },
    { label: "Road / Street", value: address.road        || "—", icon: "🛣️" },
    { label: "Suburb / Area", value: address.suburb      || "—", icon: "🏘️" },
    { label: "City",          value: address.city        || "—", icon: "🌆" },
    { label: "District",      value: address.district    || "—", icon: "📍" },
    { label: "State",         value: address.state       || "—", icon: "🗺️" },
    { label: "Pin Code",      value: address.postcode    || "—", icon: "📮" },
    { label: "Country",       value: address.country     || "—", icon: "🌏" },
    { label: "Latitude",      value: address.coordinates.lat.toFixed(6), icon: "📐" },
    { label: "Longitude",     value: address.coordinates.lng.toFixed(6), icon: "📏" },
  ];

  return (
    <section aria-label="Address details" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Address Breakdown</h2>
        {fromCache && <Badge label="From cache" variant="green" />}
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fields.map(({ label, value, icon }) => (
          <div key={label} className="rounded-lg bg-slate-50 px-3 py-2.5">
            <dt className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <span>{icon}</span>
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800 truncate">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 italic break-words">
        {address.fullAddress}
      </p>
    </section>
  );
}
