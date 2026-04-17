import { create } from 'zustand';
import type { AppState, StorageType, CookieClass } from './types';

export const useAppStore = create<AppState>((set, get) => ({
  entries: [],
  filteredEntries: [],
  searchQuery: '',
  activeTypeFilter: 'all',
  activeClassFilter: 'all',
  snapshots: [],
  privacyScore: null,
  isLoading: false,
  error: null,
  currentDomain: '',

  setEntries: (entries) => {
    set({ entries });
    applyFilters(get, set);
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    applyFilters(get, set);
  },

  setTypeFilter: (activeTypeFilter: StorageType | 'all') => {
    set({ activeTypeFilter });
    applyFilters(get, set);
  },

  setClassFilter: (activeClassFilter: CookieClass | 'all') => {
    set({ activeClassFilter });
    applyFilters(get, set);
  },

  addSnapshot: (snapshot) => set((state) => ({ snapshots: [...state.snapshots, snapshot] })),

  setPrivacyScore: (privacyScore) => set({ privacyScore }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentDomain: (currentDomain) => set({ currentDomain }),
}));

function applyFilters(get: () => AppState, set: (partial: Partial<AppState>) => void) {
  const { entries, searchQuery, activeTypeFilter, activeClassFilter } = get();
  let filtered = entries;

  if (activeTypeFilter !== 'all') {
    filtered = filtered.filter((e) => e.type === activeTypeFilter);
  }

  if (activeClassFilter !== 'all') {
    filtered = filtered.filter((e) => e.classification === activeClassFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.key.toLowerCase().includes(q) ||
        e.value.toLowerCase().includes(q) ||
        e.domain.toLowerCase().includes(q),
    );
  }

  set({ filteredEntries: filtered });
}
