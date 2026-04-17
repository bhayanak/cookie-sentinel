/**
 * Watches cookie changes via chrome.cookies.onChanged and broadcasts them
 * to any open DevTools / popup panels.
 */
export function watchCookieChanges(): void {
  chrome.cookies.onChanged.addListener((changeInfo) => {
    const { removed, cookie, cause } = changeInfo;
    chrome.runtime
      .sendMessage({
        action: 'COOKIE_CHANGED',
        payload: { removed, cookie, cause },
      })
      .catch(() => {
        // No listeners — that's fine, nobody is listening right now
      });
  });
}
