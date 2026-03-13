"use client";

import { useCallback, useRef, useState } from "react";
import { fetchAutocompleteSuggestions, geocodeAddress } from "@/lib/api";
import { AutocompleteSuggestion, GeocodeResponse, ParsedAddress } from "@/types/index";

const DEBOUNCE_MS = 350;

export interface AddressSearchState {
  query: string;
  suggestions: AutocompleteSuggestion[];
  selectedAddress: ParsedAddress | null;
  geocodeResult: GeocodeResponse | null;
  isSearching: boolean;
  isFetching: boolean;
  error: string | null;
}

export function useAddressSearch() {
  const [state, setState] = useState<AddressSearchState>({
    query: "",
    suggestions: [],
    selectedAddress: null,
    geocodeResult: null,
    isSearching: false,
    isFetching: false,
    error: null,
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query, error: null }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.trim().length < 2) {
      setState((prev) => ({ ...prev, suggestions: [], isSearching: false }));
      return;
    }

    setState((prev) => ({ ...prev, isSearching: true }));

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetchAutocompleteSuggestions(query);
        setState((prev) => ({
          ...prev,
          suggestions: res.suggestions,
          isSearching: false,
        }));
      } catch {
        setState((prev) => ({ ...prev, isSearching: false, suggestions: [] }));
      }
    }, DEBOUNCE_MS);
  }, []);

  const selectSuggestion = useCallback(async (displayName: string) => {
    setState((prev) => ({
      ...prev,
      query: displayName,
      suggestions: [],
      isFetching: true,
      error: null,
    }));

    try {
      const res = await geocodeAddress(displayName);
      setState((prev) => ({
        ...prev,
        geocodeResult: res,
        selectedAddress: res.results[0] ?? null,
        isFetching: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isFetching: false,
        error: err instanceof Error ? err.message : "Geocoding failed",
      }));
    }
  }, []);

  const geocodeQuery = useCallback(async () => {
    if (state.query.trim().length < 3) return;

    setState((prev) => ({ ...prev, isFetching: true, suggestions: [], error: null }));

    try {
      const res = await geocodeAddress(state.query);
      setState((prev) => ({
        ...prev,
        geocodeResult: res,
        selectedAddress: res.results[0] ?? null,
        isFetching: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isFetching: false,
        error: err instanceof Error ? err.message : "Geocoding failed",
      }));
    }
  }, [state.query]);

  const reset = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setState({
      query: "",
      suggestions: [],
      selectedAddress: null,
      geocodeResult: null,
      isSearching: false,
      isFetching: false,
      error: null,
    });
  }, []);

  return { state, setQuery, selectSuggestion, geocodeQuery, reset };
}
