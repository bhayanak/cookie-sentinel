import type { StorageEntry, StorageSnapshot, SnapshotDiff } from '@shared/types';
import { diffSnapshots } from '@shared/utils';

const snapshots = new Map<string, StorageSnapshot>();

/**
 * Create a snapshot of current storage entries for a domain.
 */
export function takeSnapshot(domain: string, entries: StorageEntry[]): StorageSnapshot {
  const id = `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const snapshot: StorageSnapshot = {
    id,
    domain,
    timestamp: new Date().toISOString(),
    entries: structuredClone(entries),
    totalSize: entries.reduce((sum, e) => {
      const meta = e.metadata as { size?: number };
      return sum + (meta.size ?? 0);
    }, 0),
    cookieCount: entries.filter((e) => e.type === 'cookie').length,
    localStorageCount: entries.filter((e) => e.type === 'localStorage').length,
    sessionStorageCount: entries.filter((e) => e.type === 'sessionStorage').length,
    indexedDBCount: entries.filter((e) => e.type === 'indexedDB').length,
    cacheStorageCount: entries.filter((e) => e.type === 'cacheStorage').length,
  };

  snapshots.set(id, snapshot);
  return snapshot;
}

/**
 * Get all stored snapshots.
 */
export function getSnapshots(): StorageSnapshot[] {
  return Array.from(snapshots.values());
}

/**
 * Get a single snapshot by ID.
 */
export function getSnapshotById(id: string): StorageSnapshot | undefined {
  return snapshots.get(id);
}

/**
 * Diff two stored snapshots by their IDs.
 */
export function diffStoredSnapshots(id1: string, id2: string): SnapshotDiff | null {
  const s1 = snapshots.get(id1);
  const s2 = snapshots.get(id2);
  if (!s1 || !s2) return null;
  return diffSnapshots(s1, s2);
}

/**
 * Clear all stored snapshots.
 */
export function clearSnapshots(): void {
  snapshots.clear();
}
