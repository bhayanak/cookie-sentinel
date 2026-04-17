import type { CookieClass, ClassificationRule } from '@shared/types';
import cookieRules from '@data/cookie-rules.json';

const rules: ClassificationRule[] = cookieRules as ClassificationRule[];

/**
 * Classify a cookie as essential/functional/analytics/tracking/unknown
 * based on its name and domain.
 */
export function classifyCookie(name: string, domain: string): CookieClass {
  const lowerName = name.toLowerCase();
  const lowerDomain = domain.toLowerCase();

  for (const rule of rules) {
    const pattern = rule.pattern.toLowerCase();
    if (lowerName.includes(pattern) || lowerDomain.includes(pattern)) {
      return rule.category;
    }
  }

  return 'unknown';
}

/**
 * Classify an array of cookie names and return counts per category.
 */
export function classifyCookieBatch(
  cookies: { name: string; domain: string }[],
): Record<CookieClass, number> {
  const counts: Record<CookieClass, number> = {
    essential: 0,
    functional: 0,
    analytics: 0,
    tracking: 0,
    unknown: 0,
  };

  for (const c of cookies) {
    const cls = classifyCookie(c.name, c.domain);
    counts[cls]++;
  }

  return counts;
}
