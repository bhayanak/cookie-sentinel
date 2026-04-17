import { SENSITIVE_PATTERNS, MAX_DISPLAY_VALUE_LENGTH } from './constants';
import type { StorageEntry, SnapshotDiff, StorageSnapshot } from './types';

/**
 * Generate a unique ID for a storage entry.
 */
export function entryId(type: string, domain: string, key: string): string {
  return `${type}::${domain}::${key}`;
}

/**
 * Check whether a cookie name looks like it holds sensitive data.
 */
export function isSensitiveName(name: string): boolean {
  return SENSITIVE_PATTERNS.some((re) => re.test(name));
}

/**
 * Mask a value for display, revealing only first/last 4 chars.
 */
export function maskValue(value: string): string {
  if (value.length <= 12) return '•'.repeat(value.length);
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(value.length - 8, 20))}${value.slice(-4)}`;
}

/**
 * Truncate a string for display.
 */
export function truncate(value: string, maxLen = MAX_DISPLAY_VALUE_LENGTH): string {
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen)}…`;
}

/**
 * Safely encode text as textContent to prevent XSS.
 */
export function safeText(value: unknown): string {
  return String(value);
}

/**
 * Calculate byte size of a string (UTF-8).
 */
export function byteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Format byte count for human display.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format a Unix timestamp (seconds) to a human-readable string.
 */
export function formatExpiry(timestamp?: number): string {
  if (!timestamp) return 'Session';
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Extract the root domain from a hostname.
 */
export function getRootDomain(hostname: string): string {
  const parts = hostname.replace(/^\./, '').split('.');
  if (parts.length <= 2) return parts.join('.');
  return parts.slice(-2).join('.');
}

/**
 * Check if a cookie is third-party relative to the current page domain.
 */
export function isThirdParty(cookieDomain: string, pageDomain: string): boolean {
  const cookieRoot = getRootDomain(cookieDomain);
  const pageRoot = getRootDomain(pageDomain);
  return cookieRoot !== pageRoot;
}

/**
 * Diff two storage snapshots.
 */
export function diffSnapshots(before: StorageSnapshot, after: StorageSnapshot): SnapshotDiff {
  const beforeMap = new Map(before.entries.map((e) => [e.id, e]));
  const afterMap = new Map(after.entries.map((e) => [e.id, e]));

  const added: StorageEntry[] = [];
  const removed: StorageEntry[] = [];
  const modified: { before: StorageEntry; after: StorageEntry }[] = [];

  for (const [id, entry] of afterMap) {
    const prev = beforeMap.get(id);
    if (!prev) {
      added.push(entry);
    } else if (prev.value !== entry.value) {
      modified.push({ before: prev, after: entry });
    }
  }

  for (const [id, entry] of beforeMap) {
    if (!afterMap.has(id)) {
      removed.push(entry);
    }
  }

  return { added, removed, modified };
}

/**
 * Export storage entries to a JSON blob.
 */
export function exportToJSON(entries: StorageEntry[], domain: string): string {
  const data = {
    exportedAt: new Date().toISOString(),
    domain,
    version: '1.0.0',
    entries,
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Parse an imported JSON string back to storage entries. Returns null on failure.
 */
export function parseImportJSON(json: string): StorageEntry[] | null {
  try {
    const data = JSON.parse(json);
    if (!data || !Array.isArray(data.entries)) return null;
    return data.entries as StorageEntry[];
  } catch {
    return null;
  }
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
