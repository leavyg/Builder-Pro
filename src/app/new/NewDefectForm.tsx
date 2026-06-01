"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoPicker from "@/components/PhotoPicker";

type Contractor = { id: string; name: string; trade: string | null };
type Address = { id: string; label: string };
type Terrace = { id: string; name: string; addresses: Address[] };

export default function NewDefectForm({
  contractors,
  terraces,
}: {
  contractors: Contractor[];
  terraces: Terrace[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [contractorId, setContractorId] = useState("");
  const [terraceId, setTerraceId] = useState("");
  const [terraceQuery, setTerraceQuery] = useState("");
  const [addressId, setAddressId] = useState("");
  const [description, setDescription] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const selectedTerrace = terraces.find((t) => t.id === terraceId);
  const matches = useMemo(() => {
    const q = terraceQuery.trim().toLowerCase();
    if (!q) return [];
    return terraces.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [terraceQuery, terraces]);

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
  }
  function clearTerrace() {
    setTerraceId("");
    setTerraceQuery("");
    setAddressId("");
  }

  const canSend =
    photos.length > 0 &&
    contractorId &&
    description.trim() &&
    terraceId &&
    addressId &&
    !submitting;

  async function handleSend() {
    if (!canSend) return;
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    photos.forEach((p, i) => fd.append("photos", p, `defect-${i}.jpg`));
    fd.append("contractor_id", contractorId);
    fd.append("address_id", addressId);
    fd.append("description", description.trim());
    if (gps) {
      fd.append("gps_lat", String(gps.lat));
      fd.append("gps_lng", String(gps.lng));
    }

    const res = await fetch("/api/defects", { method: "POST", body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Try again.");
      setSubmitting(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6 px-4 py-5 pb-28">
      {/* 1. Photos */}
      <PhotoPicker onChange={setPhotos} />

      {/* 2. Contractor */}
      <div>
        <p className="mb-2 font-semibold">Assign to</p>
        <div className="flex flex-wrap gap-2">
          {contractors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setContractorId(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                contractorId === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-300"
              }`}
            >
              {c.name}
              {c.trade ? ` · ${c.trade}` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Location — terrace typeahead + house select (both required) */}
      <div>
        <p className="mb-2 font-semibold">Location</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Terrace */}
          <div className="relative">
            {selectedTerrace ? (
              <div className="flex items-center justify-between rounded-xl border border-blue-600 px-3 py-3">
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base outline-none transition-colors focus:border-blue-600"
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
            onChange={(e) => setAddressId(e.target.value)}
            disabled={!selectedTerrace}
            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base outline-none transition-colors focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
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
      </div>

      {/* 4. Description */}
      <div>
        <p className="mb-2 font-semibold">What’s wrong?</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Tap the mic on your keyboard and say what’s wrong…"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-600"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Sticky send bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          disabled={!canSend}
          onClick={handleSend}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-colors active:bg-blue-700 disabled:bg-slate-300"
        >
          {submitting ? "Sending…" : "Send to contractor"}
        </button>
      </div>
    </div>
  );
}
