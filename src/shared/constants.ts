import type { CookieClass, StorageType } from './types';

export const EXTENSION_NAME = 'Cookie Monster';

export const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  cookie: 'Cookies',
  localStorage: 'Local Storage',
  sessionStorage: 'Session Storage',
  indexedDB: 'IndexedDB',
  cacheStorage: 'Cache Storage',
};

export const STORAGE_TYPE_COLORS: Record<StorageType, string> = {
  cookie: '#f59e0b',
  localStorage: '#3b82f6',
  sessionStorage: '#8b5cf6',
  indexedDB: '#ef4444',
  cacheStorage: '#06b6d4',
};

export const COOKIE_CLASS_LABELS: Record<CookieClass, string> = {
  essential: 'Essential',
  functional: 'Functional',
  analytics: 'Analytics',
  tracking: 'Tracking',
  unknown: 'Unknown',
};

export const COOKIE_CLASS_COLORS: Record<CookieClass, string> = {
  essential: '#22c55e',
  functional: '#3b82f6',
  analytics: '#f59e0b',
  tracking: '#ef4444',
  unknown: '#6b7280',
};

/** Maximum length of a value displayed before truncation */
export const MAX_DISPLAY_VALUE_LENGTH = 200;

/** Sensitive cookie name patterns — values masked by default */
export const SENSITIVE_PATTERNS = [
  /session/i,
  /token/i,
  /auth/i,
  /csrf/i,
  /jwt/i,
  /api[_-]?key/i,
  /secret/i,
  /password/i,
];

/** Privacy score weights */
export const PRIVACY_WEIGHTS = {
  trackingCookie: -15,
  analyticsCookie: -5,
  thirdPartyCookie: -10,
  unknownCookie: -3,
  largeLocalStorage: -2, // per 100KB
  essentialOnly: 20, // bonus
} as const;
