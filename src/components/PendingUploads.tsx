"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { flush, count } from "@/lib/offlineQueue";

// Dashboard banner for captures waiting to upload (poor signal). Flushes on
// mount, when connectivity returns, and on manual Retry.
export default function PendingUploads() {
  const router = useRouter();
  const [pending, setPending] = useState(0);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true);
    const { uploaded, remaining } = await flush();
    setBusy(false);
    setPending(remaining);
    if (uploaded > 0) router.refresh();
  }, [router]);

  useEffect(() => {
    count().then(setPending);
    run();
    const onOnline = () => run();
    const onChange = () => count().then(setPending);
    window.addEventListener("online", onOnline);
    window.addEventListener("bp-queue-changed", onChange);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("bp-queue-changed", onChange);
    };
  }, [run]);

  if (pending === 0) return null;

  return (
    <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-amber-200">
      <span className="font-medium">
        {pending} waiting to send{busy ? "…" : ""}
      </span>
      <button
        onClick={run}
        disabled={busy}
        className="font-semibold underline underline-offset-2 disabled:opacity-50"
      >
        Retry
      </button>
    </div>
  );
}
