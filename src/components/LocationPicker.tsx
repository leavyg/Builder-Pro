"use client";

import { useMemo, useState } from "react";

export type Address = { id: string; label: string };
export type Terrace = { id: string; name: string; addresses: Address[] };

// Two-box location picker: terrace typeahead + dependent house dropdown.
// Reports the chosen address id via onChange (""/empty when incomplete).
export default function LocationPicker({
  terraces,
  initialAddressId,
  onChange,
}: {
  terraces: Terrace[];
  initialAddressId?: string;
  onChange?: (addressId: string) => void;
}) {
  const initTerrace = initialAddressId
    ? terraces.find((t) => t.addresses.some((a) => a.id === initialAddressId))
    : undefined;

  const [terraceId, setTerraceId] = useState(initTerrace?.id ?? "");
  const [terraceQuery, setTerraceQuery] = useState(initTerrace?.name ?? "");
  const [addressId, setAddressId] = useState(initialAddressId ?? "");

  const selectedTerrace = terraces.find((t) => t.id === terraceId);
  const matches = useMemo(() => {
    const q = terraceQuery.trim().toLowerCase();
    if (!q || selectedTerrace) return [];
    return terraces.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [terraceQuery, terraces, selectedTerrace]);

  const houses = useMemo(
    () =>
      (selectedTerrace?.addresses ?? [])
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
    [selectedTerrace],
  );

  function selectTerrace(t: Terrace) {
    setTerraceId(t.id);
    setTerraceQuery(t.name);
    setAddressId("");
    onChange?.("");
  }
  function clearTerrace() {
    setTerraceId("");
    setTerraceQuery("");
    setAddressId("");
    onChange?.("");
  }
  function selectHouse(id: string) {
    setAddressId(id);
    onChange?.(id);
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* lets the picker work inside a plain server-action <form> too */}
      <input type="hidden" name="address_id" value={addressId} />
      {/* Terrace */}
      <div className="relative">
        {selectedTerrace ? (
          <div className="flex items-center justify-between rounded-xl border border-navy px-3 py-3">
            <span className="font-medium">{selectedTerrace.name}</span>
            <button
              type="button"
              onClick={clearTerrace}
              aria-label="Change terrace"
              className="text-lg leading-none text-slate-400"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <input
              value={terraceQuery}
              onChange={(e) => setTerraceQuery(e.target.value)}
              placeholder="Terrace (e.g. T41)"
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base outline-none transition-colors focus:border-navy"
            />
            {matches.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {matches.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => selectTerrace(t)}
                      className="block w-full px-3 py-2.5 text-left font-medium active:bg-slate-100"
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* House */}
      <select
        value={addressId}
        onChange={(e) => selectHouse(e.target.value)}
        disabled={!selectedTerrace}
        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base outline-none transition-colors focus:border-navy disabled:bg-slate-100 disabled:text-slate-400"
      >
        <option value="">
          {selectedTerrace ? "Choose house…" : "Pick terrace first"}
        </option>
        {houses.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>
    </div>
  );
}
