"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoPicker from "@/components/PhotoPicker";

// Submit a fix for one open snag. The contractor must return at least as many
// photos as the problem has (requiredCount) — one fix photo per problem photo.
export default function FixSnag({
  contractorToken,
  defectId,
  requiredCount,
}: {
  contractorToken: string;
  defectId: string;
  requiredCount: number;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needed = Math.max(1, requiredCount);
  const enough = photos.length >= needed;

  async function handleSubmit() {
    if (!enough || submitting) return;
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("contractor_token", contractorToken);
    fd.append("defect_id", defectId);
    photos.forEach((p, i) => fd.append("photos", p, `fix-${i}.jpg`));
    if (note.trim()) fd.append("note", note.trim());

    const res = await fetch("/api/fix", { method: "POST", body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Try again.");
      setSubmitting(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Add a photo of each item fixed —{" "}
        <span className="font-medium text-slate-700">
          {photos.length} of {needed}
        </span>{" "}
        added.
      </p>

      <PhotoPicker onChange={setPhotos} />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Add a note (optional)…"
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base outline-none transition-colors focus:border-blue-600"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!enough || submitting}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors active:bg-blue-700 disabled:bg-slate-300"
      >
        {submitting
          ? "Sending…"
          : enough
            ? "Submit as fixed"
            : `Add ${needed - photos.length} more photo${needed - photos.length > 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
