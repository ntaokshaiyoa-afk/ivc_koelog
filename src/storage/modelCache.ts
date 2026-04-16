const DB_NAME = "koelog-db";
const STORE = "models";

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore(STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadModelFromCache(key: string) {
  const db = await openDB();

  return new Promise<ArrayBuffer | null>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function saveModelToCache(key: string, data: ArrayBuffer) {
  const db = await openDB();

  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(data, key);
}
