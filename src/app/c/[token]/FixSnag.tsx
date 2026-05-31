"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/image";
import { CameraIcon } from "@/components/icons";

// The "submit a fix" control for a single open snag in the contractor's list.
export default function FixSnag({
  contractorToken,
  defectId,
}: {
  contractorToken: string;
  defectId: string;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  async function handleSubmit() {
    if (!photo || submitting) return;
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("contractor_token", contractorToken);
    fd.append("defect_id", defectId);
    fd.append("photo", photo, "fix.jpg");
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
    <div className="mt-3 space-y-3">
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPhotoChange}
        className="hidden"
      />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Your fix"
          onClick={() => fileInput.current?.click()}
          className="aspect-video w-full rounded-xl object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white transition-colors active:bg-slate-700"
        >
          <CameraIcon className="text-lg" />
          Photo of completed work
        </button>
      )}

      {preview && (
        <>
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
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors active:bg-blue-700 disabled:bg-slate-300"
          >
            {submitting ? "Sending…" : "Submit as fixed"}
          </button>
        </>
      )}
    </div>
  );
}
