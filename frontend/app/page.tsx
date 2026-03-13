"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AddressFields } from "@/components/address/AddressFields";
import { AddressSearchInput } from "@/components/address/AddressSearchInput";
import { Spinner } from "@/components/ui/Spinner";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useGeolocation } from "@/hooks/useGeolocation";
import { reverseGeocodeCoords } from "@/lib/api";
import { Coordinates, ParsedAddress } from "@/types/index";

const AddressMap = dynamic(
  () => import("@/components/map/AddressMap").then((m) => m.AddressMap),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
      Loading map…
    </div>
  );
}

export default function AddressLookupPage() {
  const { state: geoState, retry: retryGeo } = useGeolocation();
  const { state: searchState, setQuery, selectSuggestion, geocodeQuery } = useAddressSearch();

  const [displayedAddress, setDisplayedAddress] = useState<ParsedAddress | null>(null);
  const [addressFromCache, setAddressFromCache] = useState(false);
  const [isReverseLoading, setIsReverseLoading] = useState(false);

  useEffect(() => {
    if (geoState.status !== "success") return;

    setIsReverseLoading(true);
    reverseGeocodeCoords(geoState.coordinates)
      .then(({ result, fromCache }) => {
        if (result) {
          setDisplayedAddress(result);
          setAddressFromCache(fromCache);
        }
      })
      .catch(() => {})
      .finally(() => setIsReverseLoading(false));
  }, [geoState.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchState.selectedAddress) {
      setDisplayedAddress(searchState.selectedAddress);
      setAddressFromCache(searchState.geocodeResult?.fromCache ?? false);
    }
  }, [searchState.selectedAddress, searchState.geocodeResult]);

  const handleMapClick = async (coords: Coordinates) => {
    setIsReverseLoading(true);
    try {
      const { result, fromCache } = await reverseGeocodeCoords(coords);
      if (result) {
        setDisplayedAddress(result);
        setAddressFromCache(fromCache);
      }
    } catch {
    } finally {
      setIsReverseLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Address Lookup</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search any address in Maharashtra or use your current location.
        </p>
      </div>

      {geoState.status === "loading" && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Spinner size="sm" />
          Detecting your location…
        </div>
      )}

      {geoState.status === "denied" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Location access was denied. Use the search box below to find your address.
          <button onClick={retryGeo} className="ml-3 underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {geoState.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {geoState.message}
        </div>
      )}

      <AddressSearchInput
        query={searchState.query}
        suggestions={searchState.suggestions}
        isSearching={searchState.isSearching}
        isFetching={searchState.isFetching || isReverseLoading}
        error={searchState.error}
        onChange={setQuery}
        onSelect={selectSuggestion}
        onSubmit={geocodeQuery}
      />

      {displayedAddress && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 overflow-hidden rounded-xl border border-gray-200 shadow-sm lg:h-[420px]">
            <AddressMap address={displayedAddress} onMapClick={handleMapClick} />
          </div>

          <AddressFields address={displayedAddress} fromCache={addressFromCache} />
        </div>
      )}

      {isReverseLoading && !displayedAddress && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" label="Fetching address details…" />
        </div>
      )}
    </div>
  );
}
