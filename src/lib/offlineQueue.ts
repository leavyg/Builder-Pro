// Offline-resilient capture queue. Pending defects (incl. photo Blobs) are
// stored in IndexedDB so they survive a bad-signal moment or the app closing,
// then uploaded when possible. iOS note: uploads run while the app is open or
// reopened — true background sync isn't available on iOS.

export type PendingCapture = {
  clientId: string;
  photos: Blob[];
  contractorId: string;
  addressId: string;
  description: string;
  gps: { lat: number; lng: number } | null;
  createdAt: number;
};

const DB_NAME = "builder-pro";
const STORE = "pending-defects";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "clientId" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

function notifyChanged() {
  window.dispatchEvent(new Event("bp-queue-changed"));
}

export async function enqueue(item: PendingCapture): Promise<void> {
  await withStore("readwrite", (s) => s.put(item));
  notifyChanged();
}

export async function getAll(): Promise<PendingCapture[]> {
  return (await withStore<PendingCapture[]>("readonly", (s) => s.getAll())) ?? [];
}

export async function remove(clientId: string): Promise<void> {
  await withStore("readwrite", (s) => s.delete(clientId));
  notifyChanged();
}

export async function count(): Promise<number> {
  try {
    return await withStore<number>("readonly", (s) => s.count());
  } catch {
    return 0;
  }
}

let flushing = false;

// Upload all pending captures. Network failure → keep for later; a 4xx (bad
// data we can't recover) → drop it. Safe to call repeatedly.
export async function flush(): Promise<{ uploaded: number; remaining: number }> {
  if (flushing) return { uploaded: 0, remaining: await count() };
  flushing = true;
  let uploaded = 0;
  try {
    for (const it of await getAll()) {
      const fd = new FormData();
      it.photos.forEach((p, i) => fd.append("photos", p, `defect-${i}.jpg`));
      fd.append("contractor_id", it.contractorId);
      fd.append("address_id", it.addressId);
      fd.append("description", it.description);
      fd.append("client_id", it.clientId);
      if (it.gps) {
        fd.append("gps_lat", String(it.gps.lat));
        fd.append("gps_lng", String(it.gps.lng));
      }

      let res: Response;
      try {
        res = await fetch("/api/defects", { method: "POST", body: fd });
      } catch {
        break; // offline / network error — stop, keep everything for next time
      }
      if (res.ok) {
        await remove(it.clientId);
        uploaded++;
      } else if (res.status >= 400 && res.status < 500) {
        await remove(it.clientId); // unrecoverable bad request — drop it
      } else {
        break; // server error — try again later
      }
    }
  } finally {
    flushing = false;
  }
  return { uploaded, remaining: await count() };
}
