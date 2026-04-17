import type { PrivacyScore, StorageEntry } from '@shared/types';
import { isThirdParty, byteSize } from '@shared/utils';
import { PRIVACY_WEIGHTS } from '@shared/constants';

/**
 * Calculate a privacy score (0-100, 100 = most private) for a set of storage entries.
 */
export function calculatePrivacyScore(domain: string, entries: StorageEntry[]): PrivacyScore {
  const cookies = entries.filter((e) => e.type === 'cookie');
  const localStorageEntries = entries.filter((e) => e.type === 'localStorage');
  const sessionStorageEntries = entries.filter((e) => e.type === 'sessionStorage');

  let essentialCookies = 0;
  let functionalCookies = 0;
  let analyticsCookies = 0;
  let trackingCookies = 0;
  let unknownCookies = 0;
  let thirdPartyCookies = 0;

  for (const c of cookies) {
    switch (c.classification) {
      case 'essential':
        essentialCookies++;
        break;
      case 'functional':
        functionalCookies++;
        break;
      case 'analytics':
        analyticsCookies++;
        break;
      case 'tracking':
        trackingCookies++;
        break;
      default:
        unknownCookies++;
    }
    if (isThirdParty(c.domain, domain)) {
      thirdPartyCookies++;
    }
  }

  const totalDataSize = entries.reduce((sum, e) => {
    return sum + byteSize(e.key + e.value);
  }, 0);
  const totalDataSizeKB = totalDataSize / 1024;

  // Start at 100, deduct points for privacy concerns
  let score = 100;
  score += trackingCookies * PRIVACY_WEIGHTS.trackingCookie;
  score += analyticsCookies * PRIVACY_WEIGHTS.analyticsCookie;
  score += thirdPartyCookies * PRIVACY_WEIGHTS.thirdPartyCookie;
  score += unknownCookies * PRIVACY_WEIGHTS.unknownCookie;
  score += Math.floor(totalDataSizeKB / 100) * PRIVACY_WEIGHTS.largeLocalStorage;

  // Bonus if site only has essential cookies
  if (cookies.length > 0 && trackingCookies === 0 && analyticsCookies === 0) {
    score += PRIVACY_WEIGHTS.essentialOnly;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    domain,
    score,
    breakdown: {
      essentialCookies,
      functionalCookies,
      analyticsCookies,
      trackingCookies,
      unknownCookies,
      thirdPartyCookies,
      localStorageItems: localStorageEntries.length,
      sessionStorageItems: sessionStorageEntries.length,
      totalDataSizeKB: Math.round(totalDataSizeKB * 100) / 100,
    },
  };
}
