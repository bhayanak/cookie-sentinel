import { describe, it, expect, beforeEach } from 'vitest';
import {
  takeSnapshot,
  getSnapshots,
  getSnapshotById,
  diffStoredSnapshots,
  clearSnapshots,
} from '../../src/background/snapshot-engine';
import type { StorageEntry } from '../../src/shared/types';

function makeEntry(overrides: Partial<StorageEntry> = {}): StorageEntry {
  return {
    id: 'cookie::example.com::test',
    type: 'cookie',
    domain: 'example.com',
    key: 'test',
    value: 'value1',
    metadata: {
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'lax',
      hostOnly: false,
      session: false,
      size: 10,
    },
    ...overrides,
  };
}

describe('snapshot-engine', () => {
  beforeEach(() => {
    clearSnapshots();
  });

  it('takes a snapshot and stores it', () => {
    const entries = [makeEntry()];
    const snap = takeSnapshot('example.com', entries);

    expect(snap.id).toBeTruthy();
    expect(snap.domain).toBe('example.com');
    expect(snap.entries).toHaveLength(1);
    expect(snap.cookieCount).toBe(1);
    expect(snap.localStorageCount).toBe(0);
  });

  it('retrieves snapshots', () => {
    takeSnapshot('example.com', [makeEntry()]);
    takeSnapshot('example.com', [
      makeEntry(),
      makeEntry({ key: 'test2', id: 'cookie::example.com::test2' }),
    ]);

    const all = getSnapshots();
    expect(all).toHaveLength(2);
  });

  it('retrieves snapshot by ID', () => {
    const snap = takeSnapshot('example.com', [makeEntry()]);
    const retrieved = getSnapshotById(snap.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(snap.id);
  });

  it('diffs two snapshots — added entry', () => {
    const s1 = takeSnapshot('example.com', [makeEntry()]);
    const newEntry = makeEntry({ id: 'cookie::example.com::new', key: 'new', value: 'new_val' });
    const s2 = takeSnapshot('example.com', [makeEntry(), newEntry]);

    const diff = diffStoredSnapshots(s1.id, s2.id);
    expect(diff).not.toBeNull();
    expect(diff!.added).toHaveLength(1);
    expect(diff!.added[0].key).toBe('new');
    expect(diff!.removed).toHaveLength(0);
    expect(diff!.modified).toHaveLength(0);
  });

  it('diffs two snapshots — removed entry', () => {
    const entry = makeEntry();
    const s1 = takeSnapshot('example.com', [entry]);
    const s2 = takeSnapshot('example.com', []);

    const diff = diffStoredSnapshots(s1.id, s2.id);
    expect(diff!.removed).toHaveLength(1);
    expect(diff!.added).toHaveLength(0);
  });

  it('diffs two snapshots — modified entry', () => {
    const s1 = takeSnapshot('example.com', [makeEntry({ value: 'old' })]);
    const s2 = takeSnapshot('example.com', [makeEntry({ value: 'new' })]);

    const diff = diffStoredSnapshots(s1.id, s2.id);
    expect(diff!.modified).toHaveLength(1);
    expect(diff!.modified[0].before.value).toBe('old');
    expect(diff!.modified[0].after.value).toBe('new');
  });

  it('returns null for invalid snapshot IDs', () => {
    expect(diffStoredSnapshots('nope1', 'nope2')).toBeNull();
  });
});
