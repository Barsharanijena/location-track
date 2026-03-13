"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { AutocompleteSuggestion } from "@/types/index";
import { Spinner } from "@/components/ui/Spinner";

interface AddressSearchInputProps {
  query: string;
  suggestions: AutocompleteSuggestion[];
  isSearching: boolean;
  isFetching: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onSelect: (displayName: string) => void;
  onSubmit: () => void;
}

export function AddressSearchInput({
  query,
  suggestions,
  isSearching,
  isFetching,
  error,
  onChange,
  onSelect,
  onSubmit,
}: AddressSearchInputProps) {
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        onSelect(suggestions[activeSuggestion].displayName);
        setActiveSuggestion(-1);
      } else {
        onSubmit();
      }
    } else if (e.key === "Escape") {
      setActiveSuggestion(-1);
      onChange("");
    }
  };

  return (
    <div className="relative w-full">
      <label htmlFor="address-search" className="mb-1 block text-sm font-medium text-gray-700">
        Search address
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="address-search"
            ref={inputRef}
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => { onChange(e.target.value); setActiveSuggestion(-1); }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Pune Railway Station, MG Road Pune…"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm shadow-sm
                       focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            aria-autocomplete="list"
            aria-controls="suggestions-list"
            aria-expanded={suggestions.length > 0}
          />

          {(isSearching || isFetching) && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </span>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={isFetching || query.trim().length < 3}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white
                     hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50
                     focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul
          id="suggestions-list"
          role="listbox"
          className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-lg border border-gray-200
                     bg-white shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              role="option"
              aria-selected={i === activeSuggestion}
              onClick={() => { onSelect(s.displayName); setActiveSuggestion(-1); }}
              onMouseEnter={() => setActiveSuggestion(i)}
              className={`cursor-pointer px-4 py-2.5 text-sm transition-colors
                ${i === activeSuggestion ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {s.displayName}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
