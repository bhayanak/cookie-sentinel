import type {
  ExtensionMessage,
  ExtensionResponse,
  StorageEntry,
  CookieMetadata,
} from '@shared/types';
import { entryId, byteSize } from '@shared/utils';
import { classifyCookie } from './classifier';
import { takeSnapshot, diffStoredSnapshots } from './snapshot-engine';

/**
 * Central message handler for the background service worker.
 */
export async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  switch (message.action) {
    case 'GET_ALL_STORAGE':
      return getAllStorage(message.payload as { tabId: number });

    case 'GET_COOKIES':
      return getCookies(message.payload as { domain: string });

    case 'SET_COOKIE':
      return setCookie(message.payload as chrome.cookies.SetDetails);

    case 'DELETE_COOKIE':
      return deleteCookie(message.payload as { url: string; name: string });

    case 'GET_WEB_STORAGE':
      return getWebStorage(
        message.payload as { tabId: number; type: 'localStorage' | 'sessionStorage' },
      );

    case 'GET_INDEXEDDB':
      return getIndexedDB(message.payload as { tabId: number });

    case 'GET_CACHE_STORAGE':
      return getCacheStorage(message.payload as { tabId: number });

    case 'TAKE_SNAPSHOT':
      return takeSnapshotHandler(message.payload as { tabId: number; domain: string });

    case 'DIFF_SNAPSHOTS':
      return diffSnapshotsHandler(message.payload as { id1: string; id2: string });

    case 'CLASSIFY_COOKIES':
      return classifyCookiesHandler(message.payload as { entries: StorageEntry[] });

    case 'EXPORT_STORAGE':
      return getAllStorage(message.payload as { tabId: number });

    default:
      return { success: false, error: `Unknown action: ${message.action}` };
  }
}

// ─── Cookie operations ───────────────────────────────────

async function getCookies(payload: { domain: string }): Promise<ExtensionResponse<StorageEntry[]>> {
  const cookies = await chrome.cookies.getAll({ domain: payload.domain });
  const entries: StorageEntry[] = cookies.map((c) => ({
    id: entryId('cookie', c.domain, c.name),
    type: 'cookie',
    domain: c.domain,
    key: c.name,
    value: c.value,
    classification: classifyCookie(c.name, c.domain),
    metadata: {
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite as CookieMetadata['sameSite'],
      expirationDate: c.expirationDate,
      hostOnly: c.hostOnly,
      session: c.session,
      size: byteSize(c.name + c.value),
    } satisfies CookieMetadata,
  }));
  return { success: true, data: entries };
}

async function setCookie(details: chrome.cookies.SetDetails): Promise<ExtensionResponse> {
  const cookie = await chrome.cookies.set(details);
  return cookie
    ? { success: true, data: cookie }
    : { success: false, error: 'Failed to set cookie' };
}

async function deleteCookie(payload: { url: string; name: string }): Promise<ExtensionResponse> {
  const result = await chrome.cookies.remove({ url: payload.url, name: payload.name });
  return result ? { success: true } : { success: false, error: 'Failed to delete cookie' };
}

// ─── Web Storage (via content script) ────────────────────

async function getWebStorage(payload: {
  tabId: number;
  type: 'localStorage' | 'sessionStorage';
}): Promise<ExtensionResponse<StorageEntry[]>> {
  const results = await chrome.scripting.executeScript({
    target: { tabId: payload.tabId },
    func: (storageType: string) => {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
      const items: { key: string; value: string }[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key !== null) {
          items.push({ key, value: storage.getItem(key) ?? '' });
        }
      }
      return { items, hostname: location.hostname };
    },
    args: [payload.type],
    world: 'MAIN',
  });

  const frame = results[0]?.result as
    | { items: { key: string; value: string }[]; hostname: string }
    | undefined;
  if (!frame) return { success: true, data: [] };

  const entries: StorageEntry[] = frame.items.map((item) => ({
    id: entryId(payload.type, frame.hostname, item.key),
    type: payload.type,
    domain: frame.hostname,
    key: item.key,
    value: item.value,
    metadata: {
      size: byteSize(item.key + item.value),
      type: payload.type,
    },
  }));

  return { success: true, data: entries };
}

// ─── IndexedDB (via content script) ──────────────────────

async function getIndexedDB(payload: {
  tabId: number;
}): Promise<ExtensionResponse<StorageEntry[]>> {
  const results = await chrome.scripting.executeScript({
    target: { tabId: payload.tabId },
    func: async () => {
      const dbs = await indexedDB.databases();
      const items: { db: string; store: string; key: string; value: string }[] = [];

      for (const dbInfo of dbs) {
        if (!dbInfo.name) continue;
        try {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(dbInfo.name!);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          });

          for (const storeName of Array.from(db.objectStoreNames)) {
            try {
              const tx = db.transaction(storeName, 'readonly');
              const store = tx.objectStore(storeName);
              const allKeys = await new Promise<IDBValidKey[]>((resolve, reject) => {
                const req = store.getAllKeys();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
              });

              for (const key of allKeys.slice(0, 100)) {
                const val = await new Promise<unknown>((resolve, reject) => {
                  const req = store.get(key);
                  req.onsuccess = () => resolve(req.result);
                  req.onerror = () => reject(req.error);
                });
                items.push({
                  db: dbInfo.name!,
                  store: storeName,
                  key: String(key),
                  value: JSON.stringify(val) ?? '',
                });
              }
            } catch {
              // Skip stores we can't read
            }
          }
          db.close();
        } catch {
          // Skip DBs we can't open
        }
      }
      return { items, hostname: location.hostname };
    },
    args: [],
    world: 'MAIN',
  });

  const frame = results[0]?.result as
    | {
        items: { db: string; store: string; key: string; value: string }[];
        hostname: string;
      }
    | undefined;
  if (!frame) return { success: true, data: [] };

  const entries: StorageEntry[] = frame.items.map((item) => ({
    id: entryId('indexedDB', frame.hostname, `${item.db}/${item.store}/${item.key}`),
    type: 'indexedDB',
    domain: frame.hostname,
    key: `${item.db} → ${item.store} → ${item.key}`,
    value: item.value,
    metadata: {
      databaseName: item.db,
      objectStoreName: item.store,
      keyPath: null,
      size: byteSize(item.value),
    },
  }));

  return { success: true, data: entries };
}

// ─── Cache Storage (via content script) ──────────────────

async function getCacheStorage(payload: {
  tabId: number;
}): Promise<ExtensionResponse<StorageEntry[]>> {
  const results = await chrome.scripting.executeScript({
    target: { tabId: payload.tabId },
    func: async () => {
      const cacheNames = await caches.keys();
      const items: { cacheName: string; url: string }[] = [];

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        for (const req of requests.slice(0, 100)) {
          items.push({ cacheName: name, url: req.url });
        }
      }
      return { items, hostname: location.hostname };
    },
    args: [],
    world: 'MAIN',
  });

  const frame = results[0]?.result as
    | {
        items: { cacheName: string; url: string }[];
        hostname: string;
      }
    | undefined;
  if (!frame) return { success: true, data: [] };

  const entries: StorageEntry[] = frame.items.map((item) => ({
    id: entryId('cacheStorage', frame.hostname, `${item.cacheName}/${item.url}`),
    type: 'cacheStorage',
    domain: frame.hostname,
    key: item.url,
    value: `Cache: ${item.cacheName}`,
    metadata: {
      cacheName: item.cacheName,
      url: item.url,
      size: 0,
    },
  }));

  return { success: true, data: entries };
}

// ─── Aggregate all storage ───────────────────────────────

async function getAllStorage(payload: {
  tabId: number;
}): Promise<ExtensionResponse<StorageEntry[]>> {
  const tab = await chrome.tabs.get(payload.tabId);
  const url = tab.url ? new URL(tab.url) : null;
  const domain = url?.hostname ?? '';

  const [cookies, ls, ss, idb, cache] = await Promise.all([
    getCookies({ domain }),
    getWebStorage({ tabId: payload.tabId, type: 'localStorage' }),
    getWebStorage({ tabId: payload.tabId, type: 'sessionStorage' }),
    getIndexedDB({ tabId: payload.tabId }),
    getCacheStorage({ tabId: payload.tabId }),
  ]);

  const allEntries = [
    ...(cookies.data ?? []),
    ...(ls.data ?? []),
    ...(ss.data ?? []),
    ...(idb.data ?? []),
    ...(cache.data ?? []),
  ];

  return { success: true, data: allEntries };
}

// ─── Snapshot handlers ───────────────────────────────────

async function takeSnapshotHandler(payload: {
  tabId: number;
  domain: string;
}): Promise<ExtensionResponse> {
  const storageResult = await getAllStorage({ tabId: payload.tabId });
  if (!storageResult.success || !storageResult.data) {
    return { success: false, error: 'Failed to collect storage' };
  }
  const snapshot = takeSnapshot(payload.domain, storageResult.data);
  return { success: true, data: snapshot };
}

async function diffSnapshotsHandler(payload: {
  id1: string;
  id2: string;
}): Promise<ExtensionResponse> {
  const diff = diffStoredSnapshots(payload.id1, payload.id2);
  if (!diff) return { success: false, error: 'Snapshots not found' };
  return { success: true, data: diff };
}

// ─── Classification handler ──────────────────────────────

async function classifyCookiesHandler(payload: {
  entries: StorageEntry[];
}): Promise<ExtensionResponse<StorageEntry[]>> {
  const classified = payload.entries.map((entry) => ({
    ...entry,
    classification:
      entry.type === 'cookie' ? classifyCookie(entry.key, entry.domain) : entry.classification,
  }));
  return { success: true, data: classified };
}
