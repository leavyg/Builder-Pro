"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoPicker from "@/components/PhotoPicker";

type Contractor = { id: string; name: string; trade: string | null };
type Zone = { id: string; label: string };

export default function NewDefectForm({
  contractors,
  zones,
}: {
  contractors: Contractor[];
  zones: Zone[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [contractorId, setContractorId] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grab location quietly in the background — never blocks the flow.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const canSend =
    photos.length > 0 && contractorId && description.trim() && !submitting;

  async function handleSend() {
    if (!canSend) return;
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    photos.forEach((p, i) => fd.append("photos", p, `defect-${i}.jpg`));
    fd.append("contractor_id", contractorId);
    if (zoneId) fd.append("zone_id", zoneId);
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

      {/* 3. Zone (optional) */}
      {zones.length > 0 && (
        <div>
          <p className="mb-2 font-semibold">
            Location <span className="font-normal text-slate-400">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {zones.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setZoneId(zoneId === z.id ? "" : z.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  zoneId === z.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-300"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
