"use client";

import { useEffect, useState } from "react";

// Slim bar shown whenever the device is offline.
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-amber-500 px-4 py-1.5 text-center text-sm font-medium text-slate-900">
      You’re offline — saved defects will send when you’re back online.
    </div>
  );
}
