/**
 * Content script that reads localStorage and sessionStorage from the page context.
 * Runs in an isolated world and communicates with the background service worker.
 */

import type { ExtensionMessage, ExtensionResponse, StorageEntry } from '@shared/types';
import { entryId, byteSize } from '@shared/utils';

function readWebStorage(storageType: 'localStorage' | 'sessionStorage'): StorageEntry[] {
  const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
  const entries: StorageEntry[] = [];
  const hostname = location.hostname;

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key === null) continue;
    const value = storage.getItem(key) ?? '';

    entries.push({
      id: entryId(storageType, hostname, key),
      type: storageType,
      domain: hostname,
      key,
      value,
      metadata: {
        size: byteSize(key + value),
        type: storageType,
      },
    });
  }

  return entries;
}

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
    if (message.action === 'GET_WEB_STORAGE') {
      const payload = message.payload as { type: 'localStorage' | 'sessionStorage' };
      const entries = readWebStorage(payload.type);
      sendResponse({ success: true, data: entries });
    }

    if (message.action === 'SET_WEB_STORAGE') {
      const payload = message.payload as {
        type: 'localStorage' | 'sessionStorage';
        key: string;
        value: string;
      };
      const storage = payload.type === 'localStorage' ? localStorage : sessionStorage;
      storage.setItem(payload.key, payload.value);
      sendResponse({ success: true });
    }

    if (message.action === 'DELETE_WEB_STORAGE') {
      const payload = message.payload as {
        type: 'localStorage' | 'sessionStorage';
        key: string;
      };
      const storage = payload.type === 'localStorage' ? localStorage : sessionStorage;
      storage.removeItem(payload.key);
      sendResponse({ success: true });
    }

    if (message.action === 'CLEAR_ALL_STORAGE') {
      localStorage.clear();
      sessionStorage.clear();
      sendResponse({ success: true });
    }

    return false;
  },
);
