// Minimal IndexedDB key-value store (localStorage is too small for full Quran editions).
const DB_NAME = 'adhanTime';
const STORE = 'kv';

let dbPromise = null;

const openDb = () => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    }).catch((e) => { dbPromise = null; throw e; });
    return dbPromise;
};

const run = async (mode, fn) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req?.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
};

export const idbGet = (key) => run('readonly', s => s.get(key)).catch(() => undefined);
export const idbSet = (key, value) => run('readwrite', s => s.put(value, key)).catch(() => undefined);
export const idbDelete = (key) => run('readwrite', s => s.delete(key)).catch(() => undefined);
export const idbKeys = () => run('readonly', s => s.getAllKeys()).catch(() => []);
