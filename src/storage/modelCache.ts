const DB_NAME = "koelog-db";
const STORE_NAME = "models";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ==============================
// 取得
// ==============================
export async function loadModelFromCache(model: string): Promise<ArrayBuffer | null> {
  const db = await openDB();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(model);

    req.onsuccess = () => {
      resolve(req.result || null);
    };

    req.onerror = () => resolve(null);
  });
}

// ==============================
// 保存
// ==============================
export async function saveModelToCache(model: string, data: ArrayBuffer) {
  const db = await openDB();

  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  store.put(data, model);
}
