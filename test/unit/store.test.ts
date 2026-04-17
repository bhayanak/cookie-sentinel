import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../src/shared/store';
import type { StorageEntry, PrivacyScore, StorageSnapshot } from '../../src/shared/types';

function makeEntry(overrides: Partial<StorageEntry> = {}): StorageEntry {
  return {
    id: 'cookie::example.com::test',
    type: 'cookie',
    domain: 'example.com',
    key: 'test',
    value: 'value1',
    classification: 'essential',
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

describe('useAppStore', () => {
  beforeEach(() => {
    const store = useAppStore.getState();
    store.setEntries([]);
    store.setSearchQuery('');
    store.setTypeFilter('all');
    store.setClassFilter('all');
    store.setLoading(false);
    store.setError(null);
    store.setCurrentDomain('');
  });

  it('sets and retrieves entries', () => {
    const entries = [
      makeEntry(),
      makeEntry({ id: 'ls::example.com::key2', type: 'localStorage', key: 'key2' }),
    ];
    useAppStore.getState().setEntries(entries);

    const state = useAppStore.getState();
    expect(state.entries).toHaveLength(2);
    expect(state.filteredEntries).toHaveLength(2);
  });

  it('filters entries by type', () => {
    const entries = [
      makeEntry(),
      makeEntry({ id: 'ls::example.com::key2', type: 'localStorage', key: 'key2' }),
    ];
    useAppStore.getState().setEntries(entries);
    useAppStore.getState().setTypeFilter('cookie');

    expect(useAppStore.getState().filteredEntries).toHaveLength(1);
    expect(useAppStore.getState().filteredEntries[0].type).toBe('cookie');
  });

  it('filters entries by classification', () => {
    const entries = [
      makeEntry({ classification: 'essential' }),
      makeEntry({ id: 'c2', key: 'tracker', classification: 'tracking' }),
    ];
    useAppStore.getState().setEntries(entries);
    useAppStore.getState().setClassFilter('tracking');

    expect(useAppStore.getState().filteredEntries).toHaveLength(1);
    expect(useAppStore.getState().filteredEntries[0].classification).toBe('tracking');
  });

  it('filters entries by search query', () => {
    const entries = [
      makeEntry({ key: 'session_id', value: 'abc123' }),
      makeEntry({ id: 'c2', key: '_ga', value: 'GA1.2.123' }),
    ];
    useAppStore.getState().setEntries(entries);
    useAppStore.getState().setSearchQuery('session');

    expect(useAppStore.getState().filteredEntries).toHaveLength(1);
    expect(useAppStore.getState().filteredEntries[0].key).toBe('session_id');
  });

  it('combines type and search filters', () => {
    const entries = [
      makeEntry({ key: 'session_id' }),
      makeEntry({ id: 'ls::example.com::session', type: 'localStorage', key: 'session_data' }),
    ];
    useAppStore.getState().setEntries(entries);
    useAppStore.getState().setTypeFilter('localStorage');
    useAppStore.getState().setSearchQuery('session');

    expect(useAppStore.getState().filteredEntries).toHaveLength(1);
    expect(useAppStore.getState().filteredEntries[0].type).toBe('localStorage');
  });

  it('adds snapshots', () => {
    const snapshot: StorageSnapshot = {
      id: 'snap1',
      domain: 'example.com',
      timestamp: new Date().toISOString(),
      entries: [],
      totalSize: 0,
      cookieCount: 0,
      localStorageCount: 0,
      sessionStorageCount: 0,
      indexedDBCount: 0,
      cacheStorageCount: 0,
    };
    useAppStore.getState().addSnapshot(snapshot);
    expect(useAppStore.getState().snapshots).toHaveLength(1);
  });

  it('sets privacy score', () => {
    const score: PrivacyScore = {
      domain: 'example.com',
      score: 85,
      breakdown: {
        essentialCookies: 2,
        functionalCookies: 1,
        analyticsCookies: 0,
        trackingCookies: 0,
        unknownCookies: 0,
        thirdPartyCookies: 0,
        localStorageItems: 3,
        sessionStorageItems: 1,
        totalDataSizeKB: 5.2,
      },
    };
    useAppStore.getState().setPrivacyScore(score);
    expect(useAppStore.getState().privacyScore?.score).toBe(85);
  });

  it('sets loading state', () => {
    useAppStore.getState().setLoading(true);
    expect(useAppStore.getState().isLoading).toBe(true);
  });

  it('sets error state', () => {
    useAppStore.getState().setError('Something went wrong');
    expect(useAppStore.getState().error).toBe('Something went wrong');
  });

  it('sets current domain', () => {
    useAppStore.getState().setCurrentDomain('test.com');
    expect(useAppStore.getState().currentDomain).toBe('test.com');
  });

  it('resets filter to all shows all entries', () => {
    const entries = [makeEntry(), makeEntry({ id: 'c2', type: 'localStorage' })];
    useAppStore.getState().setEntries(entries);
    useAppStore.getState().setTypeFilter('cookie');
    expect(useAppStore.getState().filteredEntries).toHaveLength(1);

    useAppStore.getState().setTypeFilter('all');
    expect(useAppStore.getState().filteredEntries).toHaveLength(2);
  });
});
