"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoPicker from "@/components/PhotoPicker";
import LocationPicker, { type Terrace } from "@/components/LocationPicker";
import { enqueue } from "@/lib/offlineQueue";

type Contractor = { id: string; name: string; trade: string | null };

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
  const [addressId, setAddressId] = useState("");
  const [description, setDescription] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const canSend =
    photos.length > 0 &&
    contractorId &&
    description.trim() &&
    addressId &&
    !submitting;

  async function handleSend() {
    if (!canSend) return;
    setSubmitting(true);
    // Save to the offline queue first — it survives bad signal / closing the
    // app, and the dashboard banner uploads it (now, or when back online).
    await enqueue({
      clientId: crypto.randomUUID(),
      photos,
      contractorId,
      addressId,
      description: description.trim(),
      gps,
      createdAt: Date.now(),
    });
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
                  ? "bg-navy text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-300"
              }`}
            >
              {c.name}
              {c.trade ? ` · ${c.trade}` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Location */}
      <div>
        <p className="mb-2 font-semibold">Location</p>
        <LocationPicker terraces={terraces} onChange={setAddressId} />
      </div>

      {/* 4. Description */}
      <div>
        <p className="mb-2 font-semibold">What’s wrong?</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Tap the mic on your keyboard and say what’s wrong…"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-navy"
        />
      </div>

      {/* Sticky send bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          disabled={!canSend}
          onClick={handleSend}
          className="w-full rounded-xl bg-navy py-4 text-lg font-bold text-white transition-colors active:bg-navy-light disabled:bg-slate-300"
        >
          {submitting ? "Sending…" : "Send to contractor"}
        </button>
      </div>
    </div>
  );
}
