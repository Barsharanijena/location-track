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
}

export function AddressFields({ address, fromCache }: AddressFieldsProps) {
  const fields: FieldRow[] = [
    { label: "House / Unit",  value: address.houseNumber || "—" },
    { label: "Road / Street", value: address.road || "—" },
    { label: "Suburb / Area", value: address.suburb || "—" },
    { label: "City",          value: address.city || "—" },
    { label: "District",      value: address.district || "—" },
    { label: "State",         value: address.state || "—" },
    { label: "Pin Code",      value: address.postcode || "—" },
    { label: "Country",       value: address.country || "—" },
    { label: "Latitude",      value: address.coordinates.lat.toFixed(6) },
    { label: "Longitude",     value: address.coordinates.lng.toFixed(6) },
  ];

  return (
    <section aria-label="Address details" className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Address breakdown</h2>
        {fromCache && (
          <Badge label="From cache" variant="green" />
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <dt className="text-xs font-medium text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 break-words text-xs text-gray-500 italic">
        {address.fullAddress}
      </p>
    </section>
  );
}
