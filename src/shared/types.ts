// ─── Storage Types ───────────────────────────────────────

export type StorageType =
  | 'cookie'
  | 'localStorage'
  | 'sessionStorage'
  | 'indexedDB'
  | 'cacheStorage';

export type CookieClass = 'essential' | 'functional' | 'analytics' | 'tracking' | 'unknown';

// ─── Metadata ────────────────────────────────────────────

export interface CookieMetadata {
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none' | 'unspecified';
  expirationDate?: number;
  hostOnly: boolean;
  session: boolean;
  size: number;
}

export interface WebStorageMetadata {
  size: number;
  type: 'localStorage' | 'sessionStorage';
}

export interface IDBMetadata {
  databaseName: string;
  objectStoreName: string;
  keyPath: string | null;
  size: number;
}

export interface CacheMetadata {
  cacheName: string;
  url: string;
  size: number;
}

// ─── Storage Entry ───────────────────────────────────────

export interface StorageEntry {
  id: string;
  type: StorageType;
  domain: string;
  key: string;
  value: string;
  metadata: CookieMetadata | WebStorageMetadata | IDBMetadata | CacheMetadata;
  classification?: CookieClass;
}

// ─── Snapshots ───────────────────────────────────────────

export interface StorageSnapshot {
  id: string;
  domain: string;
  timestamp: string;
  entries: StorageEntry[];
  totalSize: number;
  cookieCount: number;
  localStorageCount: number;
  sessionStorageCount: number;
  indexedDBCount: number;
  cacheStorageCount: number;
}

export interface SnapshotDiff {
  added: StorageEntry[];
  removed: StorageEntry[];
  modified: { before: StorageEntry; after: StorageEntry }[];
}

// ─── Privacy Score ───────────────────────────────────────

export interface PrivacyScore {
  domain: string;
  score: number; // 0-100 (100 = most private)
  breakdown: {
    essentialCookies: number;
    functionalCookies: number;
    analyticsCookies: number;
    trackingCookies: number;
    unknownCookies: number;
    thirdPartyCookies: number;
    localStorageItems: number;
    sessionStorageItems: number;
    totalDataSizeKB: number;
  };
}

// ─── Messages ────────────────────────────────────────────

export type MessageAction =
  | 'GET_ALL_STORAGE'
  | 'GET_COOKIES'
  | 'SET_COOKIE'
  | 'DELETE_COOKIE'
  | 'GET_WEB_STORAGE'
  | 'SET_WEB_STORAGE'
  | 'DELETE_WEB_STORAGE'
  | 'GET_INDEXEDDB'
  | 'GET_CACHE_STORAGE'
  | 'TAKE_SNAPSHOT'
  | 'DIFF_SNAPSHOTS'
  | 'CLASSIFY_COOKIES'
  | 'CALCULATE_PRIVACY_SCORE'
  | 'EXPORT_STORAGE'
  | 'IMPORT_STORAGE'
  | 'CLEAR_ALL_STORAGE';

export interface ExtensionMessage<T = unknown> {
  action: MessageAction;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Classification Rule ─────────────────────────────────

export interface ClassificationRule {
  pattern: string;
  category: CookieClass;
  description: string;
}

// ─── Store State ─────────────────────────────────────────

export interface AppState {
  entries: StorageEntry[];
  filteredEntries: StorageEntry[];
  searchQuery: string;
  activeTypeFilter: StorageType | 'all';
  activeClassFilter: CookieClass | 'all';
  snapshots: StorageSnapshot[];
  privacyScore: PrivacyScore | null;
  isLoading: boolean;
  error: string | null;
  currentDomain: string;

  // Actions
  setEntries: (entries: StorageEntry[]) => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: StorageType | 'all') => void;
  setClassFilter: (filter: CookieClass | 'all') => void;
  addSnapshot: (snapshot: StorageSnapshot) => void;
  setPrivacyScore: (score: PrivacyScore) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentDomain: (domain: string) => void;
}
