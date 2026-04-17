import { describe, it, expect } from 'vitest';
import { calculatePrivacyScore } from '../../src/background/privacy-scorer';
import type { StorageEntry } from '../../src/shared/types';

function makeCookie(
  key: string,
  domain: string,
  classification: StorageEntry['classification'] = 'unknown',
): StorageEntry {
  return {
    id: `cookie::${domain}::${key}`,
    type: 'cookie',
    domain,
    key,
    value: 'value',
    classification,
    metadata: {
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'lax',
      hostOnly: false,
      session: false,
      size: 10,
    },
  };
}

function makeLS(key: string, value: string): StorageEntry {
  return {
    id: `localStorage::example.com::${key}`,
    type: 'localStorage',
    domain: 'example.com',
    key,
    value,
    metadata: { size: key.length + value.length, type: 'localStorage' },
  };
}

describe('calculatePrivacyScore', () => {
  it('returns 100 for empty entries', () => {
    const score = calculatePrivacyScore('example.com', []);
    expect(score.score).toBe(100);
    expect(score.domain).toBe('example.com');
  });

  it('returns high score for essential-only cookies', () => {
    const entries = [
      makeCookie('session_id', 'example.com', 'essential'),
      makeCookie('csrf_token', 'example.com', 'essential'),
    ];
    const score = calculatePrivacyScore('example.com', entries);
    expect(score.score).toBeGreaterThanOrEqual(80);
  });

  it('penalizes tracking cookies heavily', () => {
    const entries = [
      makeCookie('_fbp', '.facebook.com', 'tracking'),
      makeCookie('_gcl_au', '.google.com', 'tracking'),
      makeCookie('IDE', '.doubleclick.net', 'tracking'),
    ];
    const score = calculatePrivacyScore('example.com', entries);
    expect(score.score).toBeLessThan(60);
    expect(score.breakdown.trackingCookies).toBe(3);
    expect(score.breakdown.thirdPartyCookies).toBe(3);
  });

  it('penalizes analytics cookies moderately', () => {
    const noAnalytics = calculatePrivacyScore('example.com', []);
    const withAnalytics = calculatePrivacyScore('example.com', [
      makeCookie('_ga', 'example.com', 'analytics'),
      makeCookie('_gid', 'example.com', 'analytics'),
    ]);
    expect(withAnalytics.score).toBeLessThan(noAnalytics.score);
  });

  it('counts breakdown correctly', () => {
    const entries = [
      makeCookie('session', 'example.com', 'essential'),
      makeCookie('_ga', 'example.com', 'analytics'),
      makeCookie('_fbp', '.facebook.com', 'tracking'),
      makeLS('key1', 'val1'),
    ];
    const score = calculatePrivacyScore('example.com', entries);
    expect(score.breakdown.essentialCookies).toBe(1);
    expect(score.breakdown.analyticsCookies).toBe(1);
    expect(score.breakdown.trackingCookies).toBe(1);
    expect(score.breakdown.localStorageItems).toBe(1);
  });

  it('clamps score between 0 and 100', () => {
    const manyTrackers = Array.from({ length: 20 }, (_, i) =>
      makeCookie(`tracker_${i}`, `.tracker${i}.com`, 'tracking'),
    );
    const score = calculatePrivacyScore('example.com', manyTrackers);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});
