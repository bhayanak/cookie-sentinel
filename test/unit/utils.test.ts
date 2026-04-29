import { describe, it, expect } from 'vitest';
import {
  entryId,
  isSensitiveName,
  maskValue,
  truncate,
  byteSize,
  formatBytes,
  formatExpiry,
  getRootDomain,
  isThirdParty,
  diffSnapshots,
  exportToJSON,
  parseImportJSON,
  exportToNetscape,
} from '../../src/shared/utils';
import type { StorageSnapshot, StorageEntry } from '../../src/shared/types';

describe('entryId', () => {
  it('creates a unique composite ID', () => {
    expect(entryId('cookie', 'example.com', 'session')).toBe('cookie::example.com::session');
  });
});

describe('isSensitiveName', () => {
  it('detects sensitive cookie names', () => {
    expect(isSensitiveName('session_id')).toBe(true);
    expect(isSensitiveName('auth_token')).toBe(true);
    expect(isSensitiveName('csrf_token')).toBe(true);
    expect(isSensitiveName('jwt_access')).toBe(true);
    expect(isSensitiveName('api_key')).toBe(true);
  });

  it('returns false for non-sensitive names', () => {
    expect(isSensitiveName('_ga')).toBe(false);
    expect(isSensitiveName('theme')).toBe(false);
    expect(isSensitiveName('lang')).toBe(false);
  });
});

describe('maskValue', () => {
  it('masks short values entirely', () => {
    expect(maskValue('abc')).toBe('•••');
  });

  it('masks long values with first/last 4 chars visible', () => {
    const masked = maskValue('abcdefghijklmnopqrstuvwxyz');
    expect(masked.startsWith('abcd')).toBe(true);
    expect(masked.endsWith('wxyz')).toBe(true);
    expect(masked).toContain('•');
  });
});

describe('truncate', () => {
  it('returns short strings as-is', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long strings', () => {
    const result = truncate('a'.repeat(300));
    expect(result.length).toBeLessThan(300);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('byteSize', () => {
  it('calculates byte size of ASCII', () => {
    expect(byteSize('hello')).toBe(5);
  });

  it('calculates byte size of multi-byte chars', () => {
    expect(byteSize('日本語')).toBe(9); // 3 bytes per CJK char
  });
});

describe('formatBytes', () => {
  it('formats zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });
});

describe('formatExpiry', () => {
  it('returns Session for no timestamp', () => {
    expect(formatExpiry()).toBe('Session');
    expect(formatExpiry(undefined)).toBe('Session');
  });

  it('formats a timestamp', () => {
    const result = formatExpiry(1700000000);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('getRootDomain', () => {
  it('extracts root domain', () => {
    expect(getRootDomain('sub.example.com')).toBe('example.com');
    expect(getRootDomain('.sub.example.com')).toBe('example.com');
  });

  it('returns simple domains as-is', () => {
    expect(getRootDomain('example.com')).toBe('example.com');
  });
});

describe('isThirdParty', () => {
  it('detects third party cookies', () => {
    expect(isThirdParty('.facebook.com', 'example.com')).toBe(true);
    expect(isThirdParty('.google-analytics.com', 'mysite.org')).toBe(true);
  });

  it('detects same party cookies', () => {
    expect(isThirdParty('.example.com', 'www.example.com')).toBe(false);
    expect(isThirdParty('example.com', 'sub.example.com')).toBe(false);
  });
});

describe('diffSnapshots', () => {
  function makeSnapshot(entries: StorageEntry[]): StorageSnapshot {
    return {
      id: 'test',
      domain: 'example.com',
      timestamp: new Date().toISOString(),
      entries,
      totalSize: 0,
      cookieCount: 0,
      localStorageCount: 0,
      sessionStorageCount: 0,
      indexedDBCount: 0,
      cacheStorageCount: 0,
    };
  }

  function makeEntry(id: string, value = 'val'): StorageEntry {
    return {
      id,
      type: 'cookie',
      domain: 'example.com',
      key: id,
      value,
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

  it('detects added entries', () => {
    const before = makeSnapshot([makeEntry('a')]);
    const after = makeSnapshot([makeEntry('a'), makeEntry('b')]);
    const diff = diffSnapshots(before, after);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].id).toBe('b');
  });

  it('detects removed entries', () => {
    const before = makeSnapshot([makeEntry('a'), makeEntry('b')]);
    const after = makeSnapshot([makeEntry('a')]);
    const diff = diffSnapshots(before, after);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].id).toBe('b');
  });

  it('detects modified entries', () => {
    const before = makeSnapshot([makeEntry('a', 'old')]);
    const after = makeSnapshot([makeEntry('a', 'new')]);
    const diff = diffSnapshots(before, after);
    expect(diff.modified).toHaveLength(1);
  });
});

describe('exportToJSON / parseImportJSON', () => {
  it('round-trips entries through export/import', () => {
    const entries: StorageEntry[] = [
      {
        id: 'cookie::example.com::test',
        type: 'cookie',
        domain: 'example.com',
        key: 'test',
        value: 'hello',
        metadata: {
          path: '/',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          hostOnly: false,
          session: false,
          size: 10,
        },
      },
    ];

    const json = exportToJSON(entries, 'example.com');
    const parsed = parseImportJSON(json);
    expect(parsed).toHaveLength(1);
    expect(parsed![0].key).toBe('test');
  });

  it('returns null for invalid JSON', () => {
    expect(parseImportJSON('not json')).toBeNull();
    expect(parseImportJSON('{}')).toBeNull();
  });
});

describe('exportToNetscape', () => {
  function makeCookieEntry(
    overrides: Partial<{
      domain: string;
      key: string;
      value: string;
      path: string;
      secure: boolean;
      httpOnly: boolean;
      hostOnly: boolean;
      expirationDate: number | undefined;
      session: boolean;
    }> = {},
  ): StorageEntry {
    return {
      id: `cookie::${overrides.domain ?? '.example.com'}::${overrides.key ?? 'test'}`,
      type: 'cookie',
      domain: overrides.domain ?? '.example.com',
      key: overrides.key ?? 'test',
      value: overrides.value ?? 'abc',
      metadata: {
        path: overrides.path ?? '/',
        secure: overrides.secure ?? false,
        httpOnly: overrides.httpOnly ?? false,
        sameSite: 'lax',
        hostOnly: overrides.hostOnly ?? false,
        session: overrides.session ?? true,
        expirationDate: overrides.expirationDate,
        size: 10,
      },
    };
  }

  it('generates Netscape header', () => {
    const result = exportToNetscape([]);
    expect(result).toContain('# Netscape HTTP Cookie File');
    expect(result.endsWith('\n')).toBe(true);
  });

  it('exports a basic cookie with tab-separated fields', () => {
    const result = exportToNetscape([makeCookieEntry()]);
    const lines = result.trim().split('\n');
    const dataLine = lines[lines.length - 1];
    const fields = dataLine.split('\t');
    expect(fields).toHaveLength(7);
    expect(fields[0]).toBe('.example.com');
    expect(fields[1]).toBe('TRUE'); // subdomain flag (domain starts with .)
    expect(fields[2]).toBe('/');
    expect(fields[3]).toBe('FALSE'); // not secure
    expect(fields[4]).toBe('0'); // session cookie
    expect(fields[5]).toBe('test');
    expect(fields[6]).toBe('abc');
  });

  it('sets secure flag to TRUE', () => {
    const result = exportToNetscape([makeCookieEntry({ secure: true })]);
    const dataLine = result.trim().split('\n').pop()!;
    expect(dataLine.split('\t')[3]).toBe('TRUE');
  });

  it('prefixes #HttpOnly_ for httpOnly cookies', () => {
    const result = exportToNetscape([makeCookieEntry({ httpOnly: true })]);
    const dataLine = result.trim().split('\n').pop()!;
    expect(dataLine.split('\t')[0]).toBe('#HttpOnly_.example.com');
  });

  it('sets subdomain flag FALSE for hostOnly cookies', () => {
    const result = exportToNetscape([makeCookieEntry({ domain: '.example.com', hostOnly: true })]);
    const dataLine = result.trim().split('\n').pop()!;
    expect(dataLine.split('\t')[1]).toBe('FALSE');
  });

  it('sets subdomain flag FALSE for domains without leading dot', () => {
    const result = exportToNetscape([makeCookieEntry({ domain: 'example.com', hostOnly: false })]);
    const dataLine = result.trim().split('\n').pop()!;
    expect(dataLine.split('\t')[1]).toBe('FALSE');
  });

  it('outputs expirationDate as integer', () => {
    const result = exportToNetscape([makeCookieEntry({ expirationDate: 1700000000.5 })]);
    const dataLine = result.trim().split('\n').pop()!;
    expect(dataLine.split('\t')[4]).toBe('1700000000');
  });

  it('skips non-cookie entries', () => {
    const lsEntry: StorageEntry = {
      id: 'localStorage::example.com::theme',
      type: 'localStorage',
      domain: 'example.com',
      key: 'theme',
      value: 'dark',
      metadata: { size: 4, type: 'localStorage' },
    };
    const result = exportToNetscape([lsEntry, makeCookieEntry()]);
    const dataLines = result
      .trim()
      .split('\n')
      .filter((l) => !l.startsWith('#') && l.trim() !== '');
    expect(dataLines).toHaveLength(1);
  });

  it('exports multiple cookies', () => {
    const entries = [
      makeCookieEntry({ key: 'a', value: '1' }),
      makeCookieEntry({ key: 'b', value: '2' }),
      makeCookieEntry({ key: 'c', value: '3' }),
    ];
    const result = exportToNetscape(entries);
    const dataLines = result
      .trim()
      .split('\n')
      .filter((l) => !l.startsWith('#') && l.trim() !== '');
    expect(dataLines).toHaveLength(3);
  });
});
