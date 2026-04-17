import { describe, it, expect } from 'vitest';
import { classifyCookie, classifyCookieBatch } from '../../src/background/classifier';

describe('classifyCookie', () => {
  it('classifies Google Analytics cookies as analytics', () => {
    expect(classifyCookie('_ga', 'example.com')).toBe('analytics');
    expect(classifyCookie('_gid', 'example.com')).toBe('analytics');
    expect(classifyCookie('_gat_gtag', 'example.com')).toBe('analytics');
  });

  it('classifies Facebook tracking cookies as tracking', () => {
    expect(classifyCookie('_fbp', 'example.com')).toBe('tracking');
    expect(classifyCookie('_fbc', 'example.com')).toBe('tracking');
  });

  it('classifies session cookies as essential', () => {
    expect(classifyCookie('session_id', 'example.com')).toBe('essential');
    expect(classifyCookie('PHPSESSID', 'example.com')).toBe('essential');
    expect(classifyCookie('connect.sid', 'example.com')).toBe('essential');
  });

  it('classifies CSRF tokens as essential', () => {
    expect(classifyCookie('csrf_token', 'example.com')).toBe('essential');
    expect(classifyCookie('xsrf-token', 'example.com')).toBe('essential');
  });

  it('classifies Cloudflare cookies as essential', () => {
    expect(classifyCookie('__cf_bm', 'example.com')).toBe('essential');
    expect(classifyCookie('cf_clearance', 'example.com')).toBe('essential');
  });

  it('classifies language/locale cookies as functional', () => {
    expect(classifyCookie('lang', 'example.com')).toBe('functional');
    expect(classifyCookie('locale', 'example.com')).toBe('functional');
  });

  it('classifies DoubleClick as tracking', () => {
    expect(classifyCookie('IDE', 'doubleclick.net')).toBe('tracking');
    expect(classifyCookie('test_cookie', 'doubleclick.net')).toBe('tracking');
  });

  it('returns unknown for unrecognized cookies', () => {
    expect(classifyCookie('my_custom_cookie', 'example.com')).toBe('unknown');
    expect(classifyCookie('random_abc', 'example.com')).toBe('unknown');
  });
});

describe('classifyCookieBatch', () => {
  it('counts cookies by classification', () => {
    const cookies = [
      { name: '_ga', domain: 'example.com' },
      { name: '_gid', domain: 'example.com' },
      { name: '_fbp', domain: 'facebook.com' },
      { name: 'session_id', domain: 'example.com' },
      { name: 'my_pref', domain: 'example.com' },
    ];

    const counts = classifyCookieBatch(cookies);
    expect(counts.analytics).toBe(2);
    expect(counts.tracking).toBe(1);
    expect(counts.essential).toBe(1);
    expect(counts.unknown).toBe(1);
  });

  it('handles empty input', () => {
    const counts = classifyCookieBatch([]);
    expect(counts.essential).toBe(0);
    expect(counts.tracking).toBe(0);
    expect(counts.analytics).toBe(0);
  });
});
