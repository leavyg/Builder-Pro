"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "@/components/icons";

// Manual refresh button + auto-refresh: re-fetches server data when the app
// regains focus (e.g. you switch back to it) and on a light interval, so a
// defect going amber shows up without a manual reload. router.refresh() keeps
// scroll position and client state — no jarring full reload.
export default function RefreshControl({
  intervalMs = 30000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const refresh = () => router.refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    const id = setInterval(refresh, intervalMs);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(id);
    };
  }, [router, intervalMs]);

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      aria-label="Refresh"
      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
    >
      <RefreshIcon className={`text-lg ${isPending ? "animate-spin" : ""}`} />
    </button>
  );
}
