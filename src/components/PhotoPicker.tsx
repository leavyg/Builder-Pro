"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image";
import { CameraIcon } from "@/components/icons";

type Item = { id: string; blob: Blob; url: string };

// Reusable multi-photo picker: a fast one-tap camera button plus an "Add from
// gallery" option (multi-select). Compresses each image and reports the current
// Blob[] to the parent via onChange.
export default function PhotoPicker({
  onChange,
  max = 8,
}: {
  onChange: (blobs: Blob[]) => void;
  max?: number;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - items.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    const added: Item[] = [];
    for (const f of chosen) {
      const blob = await compressImage(f);
      added.push({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) });
    }
    const next = [...items, ...added];
    setItems(next);
    onChange(next.map((i) => i.blob));
  }

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    onChange(next.map((i) => i.blob));
  }

  const full = items.length >= max;

  return (
    <div>
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {items.length === 0 ? (
        <>
          <button
            type="button"
            onClick={() => cameraInput.current?.click()}
            className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl bg-slate-900 text-white transition-colors active:bg-slate-700"
          >
            <CameraIcon className="text-5xl" />
            <span className="mt-2 text-lg font-semibold">Take photo</span>
          </button>
          <button
            type="button"
            onClick={() => galleryInput.current?.click()}
            className="mt-2 w-full text-center text-sm font-medium text-blue-600 active:text-blue-800"
          >
            or add from gallery
          </button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {items.map((i) => (
              <div key={i.id} className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={i.url}
                  alt=""
                  className="h-full w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(i.id)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {!full && (
              <button
                type="button"
                onClick={() => cameraInput.current?.click()}
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-3xl text-slate-400 active:bg-slate-100"
              >
                +
              </button>
            )}
          </div>
          <div className="mt-2 flex gap-4 text-sm font-medium text-blue-600">
            <button
              type="button"
              disabled={full}
              onClick={() => cameraInput.current?.click()}
              className="active:text-blue-800 disabled:text-slate-300"
            >
              Take another
            </button>
            <button
              type="button"
              disabled={full}
              onClick={() => galleryInput.current?.click()}
              className="active:text-blue-800 disabled:text-slate-300"
            >
              Add from gallery
            </button>
          </div>
        </>
      )}
    </div>
  );
}
