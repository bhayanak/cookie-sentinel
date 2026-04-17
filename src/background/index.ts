import { handleMessage } from './storage-aggregator';
import { watchCookieChanges } from './cookie-watcher';
import type { ExtensionMessage } from '@shared/types';

// Start cookie change watcher
watchCookieChanges();

// Listen for messages from popup / devtools
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err: Error) => sendResponse({ success: false, error: err.message }));
  return true; // keep channel open for async response
});
